BEGIN;

TRUNCATE
    items,
    entries, 
    user_restaurants,
    users,
    restaurants,
    cuisines
    RESTART IDENTITY CASCADE;

INSERT INTO cuisines (cuisine_name)
VALUES
    ('Mexican'),
    ('Italian'),
    ('Spanish'),
    ('American'),
    ('British'),
    ('Thai'),
    ('Japanese'),
    ('Chinese'),
    ('Indian'),
    ('Russian'),
    ('German'), 
    ('French'),
    ('Hawaiian'),
    ('Brazilian'),
    ('Peruvian'),
    ('Cuban'),
    ('Greek'), 
    ('Cajun'), 
    ('Portuguese'),
    ('Turkish'),
    ('Korean'), 
    ('BBQ'),
    ('Southern'),
    ('Lebanese'),
    ('Jamaican'),
    ('Colombian'),
    ('Meditteranean');

INSERT INTO restaurants (name, website, cuisine, city, state)
VALUES
    ('Restaurant1', 'www.google.com', 3, 'San Diego', 'CA'),
    ('Restaurant2', 'www.google.com', 4, 'San Diego', 'CA'),
    ('Restaurant3', 'www.google.com', 3, 'San Diego', 'CA');

INSERT INTO users (user_name, full_name, password)
VALUES
    ('demo', 'demo user', '$2y$12$4KicpRLvnxyD99/Q/JZEnuXsPc1z0CIwfyb6Zix8LrEhvQ6IwQNg.'),
    ('balay', 'Balay Aydemir', '$2y$12$6ZjKGRO23yGY/rl1oi0sfug6ElHdGRLRkfx95LfPsF/DxlVPwwQka'),
    ('ismail', 'Ismail Aydemir', '$2y$12$wcJ5lch2oA8SwTz83tM.HeruSZwZPsJktQ.abjFez9wrlCB8IDIxy');

INSERT INTO user_restaurants (visited, rating, description, date_visited, restaurant_id, user_id)
VALUES
    (false, null, null, null, 1, 2),
    (true, 5, 'so good', now(), 2, 2),
    (true, 5, 'test', now(), 2, 2),
    (false, null, null, null, 3, 2);

INSERT INTO entries (user_restaurant_id, user_id)
VALUES
    (2, 2);

INSERT INTO items (name, description, entry_id)
VALUES 
    ('spaghetti', 'good spaghetti', 1),
    ('appetizer', 'yummy', 1);







COMMIT;