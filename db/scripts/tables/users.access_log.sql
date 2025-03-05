CREATE TABLE IF NOT EXISTS users.access_log
(
    id          SERIAL                                NOT NULL
        CONSTRAINT access_log_pk
            PRIMARY KEY,
    user_id     INTEGER                               NOT NULL
        CONSTRAINT access_log_user_id_fk
            REFERENCES users."user",
    accessed_on TIMESTAMPTZ default CURRENT_TIMESTAMP NOT NULL,
    ip_address  TEXT                                  NOT NULL
);

COMMENT ON TABLE users.access_log IS
    'Table containing access details for Users.';

COMMENT ON COLUMN users.access_log.id IS
    'The unique ID for the access log entry.';

COMMENT ON CONSTRAINT access_log_pk ON users.access_log IS
    'The primary key on the access_log table';

COMMENT ON COLUMN users.access_log.user_id IS
    'The ID of the user that this access log record is for.';

COMMENT ON CONSTRAINT access_log_user_id_fk ON users.access_log IS
    'The ID for the user record associated with an access_log entry.';

COMMENT ON COLUMN users.access_log.accessed_on IS
    'The Date Time that the access was made';

COMMENT ON COLUMN users.access_log.ip_address IS
    'The IP Address accessed from.';

ALTER TABLE users.access_log
    OWNER TO postgres;

