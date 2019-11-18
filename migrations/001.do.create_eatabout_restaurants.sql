CREATE TABLE cuisines (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    visited BOOLEAN DEFAULT false,
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    cuisine INTEGER REFERENCES cuisines(id) NOT NULL,
    city TEXT NOT NULL,
    state char(2) NOT NULL,
    rating INTEGER,
    description TEXT,
    date_visited TIMESTAMP NOT NULL DEFAULT now()
);