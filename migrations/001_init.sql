CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date_time TEXT NOT NULL,
  description TEXT NOT NULL,
  flyer_image TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS programs (
  slug TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_id TEXT NOT NULL DEFAULT '',
  gallery_image_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS social_links (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT NOT NULL,
  handle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  portfolio TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  career TEXT NOT NULL DEFAULT ''
);
