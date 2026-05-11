-- =========================================
-- POKEMON
-- =========================================
CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    evolution_id INT REFERENCES pokemon(id)
    );

-- =========================================
-- USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
   id SERIAL PRIMARY KEY,

   username TEXT UNIQUE NOT NULL,
   password_hash TEXT NOT NULL,

   current_pokemon_id INT REFERENCES pokemon(id),
    -- TRUE = Ei, FALSE = Pokémon vorhanden
    is_egg BOOLEAN DEFAULT TRUE,

    happiness INT DEFAULT 0
    );

-- =========================================
-- ENVIRONMENT BACKGROUNDS
-- (Wetter + Tageszeit kombiniert)
-- =========================================
CREATE TABLE IF NOT EXISTS environment_backgrounds (
    id SERIAL PRIMARY KEY,

    weather_type TEXT NOT NULL,
    time_of_day TEXT NOT NULL,

    image_url TEXT NOT NULL,

    UNIQUE(weather_type, time_of_day)
    );