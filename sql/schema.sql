
-- Gott að hafa inni þegar við erum hugsanlega að henda og búa til aftur og aftur
DROP TABLE IF EXISTS signatures;

CREATE TABLE IF NOT EXISTS signatures(
  id serial primary key,
  name varchar(128) not null,
  nationalId varchar(10) not null unique,
  comment varchar(400) not null,
  anonymous boolean not null default true,
  signed DATE not null
);

DROP TABLE IF EXISTS users;

-- TODO setja inn töflu fyrir notendur
CREATE TABLE IF NOT EXISTS users(
    id serial primary key,
    username character varying(255) not null unique,
    password character varying(255) not null, 
    admin boolean not null default false
);
