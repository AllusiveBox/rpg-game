CREATE TABLE IF NOT EXISTS users.user
(
    id        SERIAL                             NOT NULL
        CONSTRAINT users_pk
            PRIMARY KEY,
    username  TEXT                               NOT NULL
        CONSTRAINT users_unique_key
            UNIQUE,
    password  TEXT            DEFAULT ''         NOT NULL,
    user_type users.user_type DEFAULT 'Standard' NOT NULL,
    CONSTRAINT username_must_be_set
        CHECK (users.user.username != '')
);

COMMENT ON TABLE users.user IS 'A table containing User records.';

COMMENT ON COLUMN users.user.id IS 'The ID for the user.';

COMMENT ON CONSTRAINT users_pk ON users.user IS 'The primary key on the users table';

COMMENT ON COLUMN users.user.username IS 'The user''s username.';

COMMENT ON CONSTRAINT users_unique_key ON users.user IS 'The username column must be unique.';

COMMENT ON COLUMN users.user.password IS 'The user''s password. Not encrypted, because thIS IS just a test project.';

COMMENT ON CONSTRAINT username_must_be_set ON users.user IS 'The user''s username cannot be an empty string';

ALTER TABLE users.user
    OWNER TO postgres;

INSERT INTO users.user (username, user_type)
VALUES ('admin', 'Admin');