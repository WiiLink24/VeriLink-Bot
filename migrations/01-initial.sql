BEGIN;

CREATE TABLE IF NOT EXISTS polls (id varchar(15) unique, channel_id text, message_id text, title text, options text[], votes json, is_published boolean, is_closed boolean, allow_multiple boolean);

END;