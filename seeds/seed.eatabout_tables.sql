BEGIN;

TRUNCATE
    items,
    entries, 
    restaurants,
    users,
    cuisines
    RESTART IDENTITY CASCADE;

INSERT INTO cuisines (name)
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

INSERT INTO users (user_name, full_name, password)
VALUES
    ('demo', 'demo user', 'AgFdWe1337!'),
    ('balay', 'Balay Aydemir', 'Opiestinks92!'),
    ('ismail', 'Ismail Aydemir', 'Opiestinks1337!');

INSERT INTO restaurants (visited, name, website, cuisine, city, state, rating, description)
VALUES
    (false, 'Restaurant1', 'www.google.com', 3, 'San Diego', 'CA', null, 'I want to go here'),
    (true, 'Restaurant2', 'www.google.com', 4, 'San Diego', 'CA', 3, 'it was ok'),
    (false, 'Restaurant3', 'www.google.com', 3, 'San Diego', 'CA', null, 'I want to go here');

INSERT INTO entries (restaurant_id, user_id)
VALUES
    (2, 2);

INSERT INTO items (name, description, entry_id)
VALUES 
    ('spaghetti', 'good spaghetti', 1);





COMMIT;