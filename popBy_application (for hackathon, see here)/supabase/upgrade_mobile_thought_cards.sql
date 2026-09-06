-- POPBY EXISTING PROJECT UPGRADE: MOBILE THOUGHT CARDS
-- Run once in Supabase > SQL Editor after the original schema.sql.
-- Existing Thoughts keep their content and receive safe appearance defaults.

alter table public.thoughts
  add column if not exists background_color text not null default 'white',
  add column if not exists font_family text not null default 'caveat',
  add column if not exists font_size smallint not null default 14;

alter table public.thoughts
  drop constraint if exists thoughts_background_type_check,
  drop constraint if exists thoughts_background_color_check,
  drop constraint if exists thoughts_font_family_check,
  drop constraint if exists thoughts_font_size_check;

alter table public.thoughts
  add constraint thoughts_background_type_check check (
    background_type in ('solid', 'lined', 'grid', 'dots', 'photo')
  ),
  add constraint thoughts_background_color_check check (
    background_color in ('white', 'sage', 'rose', 'clay', 'blue', 'lavender')
  ),
  add constraint thoughts_font_family_check check (
    font_family in ('caveat', 'patrick-hand', 'homemade-apple', 'island-moments')
  ),
  add constraint thoughts_font_size_check check (font_size in (10, 12, 14));

drop function if exists public.get_location_thoughts(uuid, uuid, boolean);

create function public.get_location_thoughts(
  p_location_id uuid,
  p_device_id uuid,
  p_mine_only boolean
)
returns table (
  id uuid,
  category text,
  body text,
  background_type text,
  background_color text,
  font_family text,
  font_size smallint,
  image_url text,
  music_url text,
  created_at timestamptz,
  is_own boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,
    t.category,
    t.body,
    t.background_type,
    t.background_color,
    t.font_family,
    t.font_size,
    t.image_url,
    t.music_url,
    t.created_at,
    (t.device_id = p_device_id) as is_own
  from public.thoughts t
  where t.location_id = p_location_id
    and t.hidden = false
    and (
      (p_mine_only = true and t.device_id = p_device_id)
      or
      (
        p_mine_only = false
        and exists (
          select 1
          from public.unlocks u
          where u.location_id = p_location_id
            and u.device_id = p_device_id
        )
      )
    )
  order by t.created_at desc;
$$;

revoke all on function public.get_location_thoughts(uuid, uuid, boolean) from public;
grant execute on function public.get_location_thoughts(uuid, uuid, boolean) to anon;

drop function if exists public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text
);

drop function if exists public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text
);

create function public.publish_thought(
  p_device_id uuid,
  p_user_lat double precision,
  p_user_lng double precision,
  p_drop_lat double precision,
  p_drop_lng double precision,
  p_safe_lat double precision,
  p_safe_lng double precision,
  p_suburb text,
  p_category text,
  p_body text default null,
  p_background_type text default 'solid',
  p_background_color text default 'white',
  p_font_family text default 'caveat',
  p_font_size smallint default 14,
  p_image_url text default null,
  p_music_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user extensions.geography;
  v_drop extensions.geography;
  v_safe extensions.geography;
  v_location_id uuid;
  v_thought_id uuid;
  v_count integer;
  v_word_count integer;
begin
  if p_suburb is distinct from 'Fitzroy' then
    raise exception 'Awaiting unlock';
  end if;

  if p_category is null
    or p_category not in ('Animals', 'Nature', 'Eat', 'Art', 'Place', 'Sound', 'Moment') then
    raise exception 'Invalid category';
  end if;

  if p_background_type is null
    or p_background_type not in ('solid', 'lined', 'grid', 'dots', 'photo') then
    raise exception 'Invalid background';
  end if;

  if p_background_color is null
    or p_background_color not in ('white', 'sage', 'rose', 'clay', 'blue', 'lavender') then
    raise exception 'Invalid background color';
  end if;

  if p_font_family is null
    or p_font_family not in ('caveat', 'patrick-hand', 'homemade-apple', 'island-moments') then
    raise exception 'Invalid font';
  end if;

  if p_font_size is null or p_font_size not in (10, 12, 14) then
    raise exception 'Invalid font size';
  end if;

  v_word_count := case
    when btrim(coalesce(p_body, '')) = '' then 0
    else cardinality(regexp_split_to_array(btrim(p_body), '[[:space:]]+'))
  end;

  if v_word_count > 200 then
    raise exception '200-word maximum';
  end if;

  if nullif(btrim(p_music_url), '') is not null
    and p_music_url !~* '^https?://' then
    raise exception 'Music URL must use http or https';
  end if;

  v_user := extensions.st_setsrid(
    extensions.st_makepoint(p_user_lng, p_user_lat), 4326
  )::extensions.geography;
  v_drop := extensions.st_setsrid(
    extensions.st_makepoint(p_drop_lng, p_drop_lat), 4326
  )::extensions.geography;
  v_safe := extensions.st_setsrid(
    extensions.st_makepoint(p_safe_lng, p_safe_lat), 4326
  )::extensions.geography;

  if not extensions.st_dwithin(v_user, v_drop, 50) then
    raise exception 'Drop within 50m of your current location';
  end if;
  if not extensions.st_dwithin(v_drop, v_safe, 60) then
    raise exception 'Privacy anchor is too far from the original drop';
  end if;

  select count(*) into v_count
  from public.thoughts t
  where t.device_id = p_device_id
    and t.created_at > now() - interval '1 hour';
  if v_count >= 5 then
    raise exception 'Hourly drop limit reached';
  end if;

  select l.id into v_location_id
  from public.locations l
  where extensions.st_dwithin(l.geom, v_safe, 20)
  order by extensions.st_distance(l.geom, v_safe)
  limit 1;

  if v_location_id is null then
    insert into public.locations (suburb, lat, lng, geom)
    values (p_suburb, p_safe_lat, p_safe_lng, v_safe)
    returning id into v_location_id;
  end if;

  select count(*) into v_count
  from public.thoughts t
  where t.location_id = v_location_id
    and t.created_at > now() - interval '1 hour';
  if v_count >= 3 then
    raise exception 'This location is taking a short break';
  end if;

  insert into public.thoughts (
    location_id, device_id, category, body, background_type,
    background_color, font_family, font_size, image_url, music_url
  ) values (
    v_location_id, p_device_id, p_category, nullif(btrim(p_body), ''),
    p_background_type, p_background_color, p_font_family, p_font_size,
    p_image_url, nullif(btrim(p_music_url), '')
  ) returning id into v_thought_id;

  return v_thought_id;
end;
$$;

revoke all on function public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text
) from public;
grant execute on function public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text
) to anon;

create or replace function public.delete_thought(
  p_device_id uuid,
  p_thought_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.thoughts t
  where t.id = p_thought_id
    and t.device_id = p_device_id;

  if not found then
    raise exception 'Thought not found';
  end if;

  return true;
end;
$$;

revoke all on function public.delete_thought(uuid, uuid) from public;
grant execute on function public.delete_thought(uuid, uuid) to anon, authenticated;
