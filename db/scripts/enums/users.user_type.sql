CREATE TYPE users.user_type AS ENUM('Admin', 'Standard');

ALTER TYPE users.user_type
    OWNER TO postgres;