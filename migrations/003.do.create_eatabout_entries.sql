CREATE TABLE user_restaurants (
    id SERIAL PRIMARY KEY,
    visited BOOLEAN DEFAULT false,
    rating INTEGER,
    description TEXT,
    date_visited TIMESTAMP,
    restaurant_id INTEGER
        REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE entries (
    id SERIAL PRIMARY KEY, 
    date TIMESTAMP NOT NULL DEFAULT now(),
    user_restaurant_id INTEGER
        REFERENCES user_restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER 
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);