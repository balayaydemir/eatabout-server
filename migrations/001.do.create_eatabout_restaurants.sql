CREATE TABLE cuisines (
    id SERIAL PRIMARY KEY, 
    cuisine_name TEXT NOT NULL
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    website TEXT NOT NULL,
    cuisine INTEGER REFERENCES cuisines(id) NOT NULL,
    city TEXT NOT NULL,
    state char(2) NOT NULL
);