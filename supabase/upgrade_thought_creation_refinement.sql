-- POPBY EXISTING PROJECT UPGRADE: THOUGHT CREATION REFINEMENT
-- Run once after upgrade_bgm_allowlist.sql. Safe to rerun.
-- Keeps existing data, migrates legacy type sizes, requires new Thoughts to
-- contain text, and creates a new location unless the user explicitly held an
-- existing Thought point.

begin;

update public.thoughts
set font_size = 14
where font_size in (10, 12);

alter table public.thoughts
  alter column font_size set default 14,
  drop constraint if exists thoughts_font_size_check;

alter table public.thoughts
  add constraint thoughts_font_size_check check (font_size in (14, 16, 18));

create or replace function public.publish_thought(
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

  if p_font_size is null or p_font_size not in (14, 16, 18) then
    raise exception 'Invalid font size';
  end if;

  if coalesce(p_body, '') !~ '[^[:space:]]' then
    raise exception 'Thought text is required';
  end if;

  v_word_count := cardinality(
    regexp_split_to_array(btrim(p_body), '[[:space:]]+')
  );

  if v_word_count > 150 then
    raise exception '150-word maximum';
  end if;

  if char_length(coalesce(p_music_url, '')) > 300 then
    raise exception 'Music link is too long';
  end if;

  if not public.is_supported_music_url(p_music_url) then
    raise exception 'Invalid music link';
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
    btrim(p_body),
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
