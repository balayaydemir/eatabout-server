CREATE TABLE items (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    entry_id INTEGER 
        REFERENCES entries(id) ON DELETE CASCADE NOT NULL
);
