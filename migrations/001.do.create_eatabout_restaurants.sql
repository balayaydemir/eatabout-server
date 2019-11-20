CREATE TABLE cuisines (
    cuisine_id SERIAL PRIMARY KEY, 
    cuisine_name TEXT NOT NULL
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    cuisine INTEGER REFERENCES cuisines(cuisine_id) NOT NULL,
    city TEXT NOT NULL,
    state char(2) NOT NULL
);