-- PopBy Fitzroy demo data. Safe to re-run: all demo rows use stable UUIDs.

with demo_locations(id, lng, lat) as (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 144.97833614338754, -37.80058074253888),
    ('00000000-0000-4000-8000-000000000102'::uuid, 144.9787535528851, -37.80084453896316),
    ('00000000-0000-4000-8000-000000000103'::uuid, 144.97928785189276, -37.80050393011469),
    ('00000000-0000-4000-8000-000000000104'::uuid, 144.98189911980012, -37.80205452344002),
    ('00000000-0000-4000-8000-000000000105'::uuid, 144.97564295474245, -37.79868505587912),
    ('00000000-0000-4000-8000-000000000106'::uuid, 144.9826194883899, -37.797924668467786)
)
insert into public.locations(id, suburb, lng, lat, geom)
select
  id,
  'Fitzroy',
  lng,
  lat,
  extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
from demo_locations
on conflict (id) do update set
  suburb = excluded.suburb,
  lng = excluded.lng,
  lat = excluded.lat,
  geom = excluded.geom;

insert into public.thoughts(
  id, location_id, device_id, category, body,
  background_type, background_color, font_family, font_size,
  image_url, music_url, created_at
)
values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000002001', 'Sound', 'Leaves whisper against the awning whenever the tram passes.', 'lined', 'white', 'caveat', 14, null, null, '2026-09-05 08:20:00+00'),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000002002', 'Sound', 'A bicycle bell keeps landing on the same bright note.', 'solid', 'rose', 'patrick-hand', 16, null, 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', '2026-09-05 08:19:00+00'),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000002003', 'Nature', 'A fern is unfolding from the darkest crack in the wall.', 'grid', 'white', 'homemade-apple', 18, null, null, '2026-09-05 08:18:00+00'),
  ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000002004', 'Nature', 'The plane-tree shadows move faster than the afternoon crowd.', 'solid', 'blue', 'island-moments', 14, null, 'https://music.apple.com/au/song/dreams/1440768234', '2026-09-05 08:17:00+00'),
  ('00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000002005', 'Nature', 'New leaves made one tiny green window above the lane.', 'dots', 'white', 'caveat', 16, null, null, '2026-09-05 08:16:00+00'),
  ('00000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000002006', 'Nature', 'Rain is still balancing along the edge of every leaf.', 'lined', 'white', 'patrick-hand', 18, null, null, '2026-09-05 08:15:00+00'),
  ('00000000-0000-4000-8000-000000001007', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000002007', 'Nature', 'Late sun turned the whole canopy briefly gold.', 'photo', 'white', 'homemade-apple', 14, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', null, '2026-09-05 08:14:00+00'),
  ('00000000-0000-4000-8000-000000001008', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002008', 'Animals', 'A magpie is rehearsing beside the crossing.', 'solid', 'clay', 'island-moments', 16, null, null, '2026-09-05 08:13:00+00'),
  ('00000000-0000-4000-8000-000000001009', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002001', 'Animals', 'The smallest dog here has chosen the biggest stick.', 'lined', 'white', 'caveat', 18, null, null, '2026-09-05 08:12:00+00'),
  ('00000000-0000-4000-8000-000000001010', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002002', 'Animals', 'Two pigeons are taking turns guarding this doorway.', 'grid', 'white', 'patrick-hand', 14, null, null, '2026-09-05 08:11:00+00'),
  ('00000000-0000-4000-8000-000000001011', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002003', 'Animals', 'A sleepy greyhound stopped exactly where the music starts.', 'dots', 'white', 'homemade-apple', 16, null, 'https://music.youtube.com/watch?v=dQw4w9WgXcQ', '2026-09-05 08:10:00+00'),
  ('00000000-0000-4000-8000-000000001012', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002004', 'Nature', 'Rain is holding in the leaves even though the sky cleared.', 'solid', 'rose', 'island-moments', 18, null, null, '2026-09-05 08:09:00+00'),
  ('00000000-0000-4000-8000-000000001013', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002005', 'Animals', 'A terrier is inspecting every doorway like a tiny mayor.', 'photo', 'white', 'caveat', 14, 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80', null, '2026-09-05 08:08:00+00'),
  ('00000000-0000-4000-8000-000000001014', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002006', 'Sound', 'Coffee cups, tram bells, and one very patient magpie.', 'lined', 'white', 'patrick-hand', 16, null, 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz', '2026-09-05 08:07:00+00'),
  ('00000000-0000-4000-8000-000000001015', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002007', 'Place', 'This corner feels like a pause between errands.', 'grid', 'white', 'homemade-apple', 18, null, null, '2026-09-05 08:06:00+00'),
  ('00000000-0000-4000-8000-000000001016', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002008', 'Moment', 'Someone held the door for three strangers in a row.', 'solid', 'sage', 'island-moments', 14, null, 'https://music.apple.com/au/album/rumours/1440857781?i=1440857798', '2026-09-05 08:05:00+00'),
  ('00000000-0000-4000-8000-000000001017', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000002001', 'Eat', 'Keep walking until the toasted sesame smell wins.', 'solid', 'rose', 'caveat', 16, null, null, '2026-09-05 08:04:00+00'),
  ('00000000-0000-4000-8000-000000001018', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000002002', 'Art', 'A hand-painted sign makes the bike rack look like part of the mural.', 'solid', 'clay', 'patrick-hand', 18, null, null, '2026-09-05 08:03:00+00'),
  ('00000000-0000-4000-8000-000000001019', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000002003', 'Eat', 'Toasted sesame drifts past the old brick whenever the door opens.', 'grid', 'white', 'homemade-apple', 14, null, null, '2026-09-05 08:02:00+00'),
  ('00000000-0000-4000-8000-000000001020', '00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000002004', 'Sound', 'There is a quiet pocket here between two busy streets.', 'lined', 'white', 'island-moments', 16, null, null, '2026-09-05 08:01:00+00')
on conflict (id) do update set
  location_id = excluded.location_id,
  device_id = excluded.device_id,
  category = excluded.category,
  body = excluded.body,
  background_type = excluded.background_type,
  background_color = excluded.background_color,
  font_family = excluded.font_family,
  font_size = excluded.font_size,
  image_url = excluded.image_url,
  music_url = excluded.music_url,
  hidden = false,
  created_at = excluded.created_at;

insert into public.unlocks(device_id, location_id, unlocked_at)
values
  ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000101', '2026-09-05 07:30:00+00'),
  ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000101', '2026-09-05 07:31:00+00'),
  ('00000000-0000-4000-8000-000000003003', '00000000-0000-4000-8000-000000000102', '2026-09-05 07:32:00+00'),
  ('00000000-0000-4000-8000-000000003004', '00000000-0000-4000-8000-000000000102', '2026-09-05 07:33:00+00'),
  ('00000000-0000-4000-8000-000000003005', '00000000-0000-4000-8000-000000000103', '2026-09-05 07:34:00+00'),
  ('00000000-0000-4000-8000-000000003006', '00000000-0000-4000-8000-000000000103', '2026-09-05 07:35:00+00'),
  ('00000000-0000-4000-8000-000000003007', '00000000-0000-4000-8000-000000000104', '2026-09-05 07:36:00+00'),
  ('00000000-0000-4000-8000-000000003008', '00000000-0000-4000-8000-000000000104', '2026-09-05 07:37:00+00'),
  ('00000000-0000-4000-8000-000000003009', '00000000-0000-4000-8000-000000000105', '2026-09-05 07:38:00+00'),
  ('00000000-0000-4000-8000-000000003010', '00000000-0000-4000-8000-000000000106', '2026-09-05 07:39:00+00')
on conflict (device_id, location_id) do nothing;
