CREATE TABLE entries (
    id SERIAL PRIMARY KEY, 
    date TIMESTAMP NOT NULL DEFAULT now(),
    restaurant_id INTEGER
        REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER 
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);