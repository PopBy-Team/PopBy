-- POPBY EXISTING PROJECT UPGRADE: MOBILE MAP + CARD REFINEMENT
-- Run once in Supabase > SQL Editor after upgrade_mobile_thought_cards.sql.
-- This migration keeps all existing Thoughts. Legacy 10pt cards move to 12pt.

begin;

update public.thoughts
set font_size = 12
where font_size = 10;

alter table public.thoughts
  alter column font_size set default 12,
  drop constraint if exists thoughts_font_size_check;

alter table public.thoughts
  add constraint thoughts_font_size_check check (font_size in (12, 14, 16));

update public.locations as location
set
  lng = anchors.lng,
  lat = anchors.lat,
  geom = extensions.st_setsrid(
    extensions.st_makepoint(anchors.lng, anchors.lat), 4326
  )::extensions.geography
from (values
  ('00000000-0000-4000-8000-000000000101'::uuid, 144.97833614338754, -37.80058074253888),
  ('00000000-0000-4000-8000-000000000102'::uuid, 144.9787535528851, -37.80084453896316),
  ('00000000-0000-4000-8000-000000000103'::uuid, 144.97928785189276, -37.80050393011469),
  ('00000000-0000-4000-8000-000000000104'::uuid, 144.98189911980012, -37.80205452344002),
  ('00000000-0000-4000-8000-000000000105'::uuid, 144.97564295474245, -37.79868505587912),
  ('00000000-0000-4000-8000-000000000106'::uuid, 144.9826194883899, -37.797924668467786)
) as anchors(id, lng, lat)
where location.id = anchors.id;

drop function if exists public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text
);

drop function if exists public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text, uuid
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
  p_font_size smallint default 12,
  p_image_url text default null,
  p_music_url text default null,
  p_target_location_id uuid default null
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

  if p_font_size is null or p_font_size not in (12, 14, 16) then
    raise exception 'Invalid font size';
  end if;

  v_word_count := case
    when btrim(coalesce(p_body, '')) = '' then 0
    else cardinality(regexp_split_to_array(btrim(p_body), '[[:space:]]+'))
  end;

  if v_word_count > 150 then
    raise exception '150-word maximum';
  end if;

  if char_length(coalesce(p_music_url, '')) > 300 then
    raise exception 'Music link is too long';
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

  select count(*)
    into v_count
  from public.thoughts t
  where t.device_id = p_device_id
    and t.created_at > now() - interval '1 hour';

  if v_count >= 5 then
    raise exception 'Hourly drop limit reached';
  end if;

  if p_target_location_id is not null then
    select l.id
      into v_location_id
    from public.locations l
    where l.id = p_target_location_id
      and l.suburb = 'Fitzroy'
      and extensions.st_dwithin(l.geom, v_safe, 20);

    if v_location_id is null then
      raise exception 'Selected location is no longer available';
    end if;
  else
    select l.id
      into v_location_id
    from public.locations l
    where extensions.st_dwithin(l.geom, v_safe, 20)
    order by extensions.st_distance(l.geom, v_safe)
    limit 1;
  end if;

  if v_location_id is null then
    insert into public.locations (suburb, lat, lng, geom)
    values (p_suburb, p_safe_lat, p_safe_lng, v_safe)
    returning id into v_location_id;
  end if;

  select count(*)
    into v_count
  from public.thoughts t
  where t.location_id = v_location_id
    and t.created_at > now() - interval '1 hour';

  if v_count >= 3 then
    raise exception 'This location is taking a short break';
  end if;

  insert into public.thoughts (
    location_id,
    device_id,
    category,
    body,
    background_type,
    background_color,
    font_family,
    font_size,
    image_url,
    music_url
  )
  values (
    v_location_id,
    p_device_id,
    p_category,
    nullif(btrim(p_body), ''),
    p_background_type,
    p_background_color,
    p_font_family,
    p_font_size,
    p_image_url,
    nullif(btrim(p_music_url), '')
  )
  returning id into v_thought_id;

  return v_thought_id;
end;
$$;

revoke all on function public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text, uuid
) from public;

grant execute on function public.publish_thought(
  uuid, double precision, double precision, double precision, double precision,
  double precision, double precision, text, text, text, text, text, text,
  smallint, text, text, uuid
) to anon;

commit;
