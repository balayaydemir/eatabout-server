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
    ('Kettner Exchange', 'https://www.kettnerexchange.com/', 4, 'San Diego', 'CA'),
    ('Momofuku Noodle Bar', 'https://momofukunoodlebar.com/', 7, 'New York', 'NY'),
    ('Bosphorous Turkish Cuisine', 'https://www.bosphorousrestaurant.com/', 20, 'Orlando', 'FL'),
    ('Franklins Barbecue', 'https://franklinbbq.com/', 22, 'Austin', 'TX'),
    ('Alinea', 'https://www.alinearestaurant.com/', 4, 'Chicago', 'IL'),
    ('Yokohama Yakitori Koubou', 'https://yokohamayakitorikoubou.com/', 7, 'San Diego', 'CA');

INSERT INTO users (user_name, full_name, password)
VALUES
    ('demo_user', 'Demo User', '$2a$12$HoPB5AqZ6YZ5Eqhw7C6o9eEGp3wuwdHDfWn4O86/bu542XrQSyapK');

INSERT INTO user_restaurants (visited, rating, description, date_visited, restaurant_id, user_id)
VALUES
    (false, null, null, null, 6, 1),
    (false, null, null, null, 5, 1),
    (false, null, null, null, 4, 1),
    (true, 3, 'Not like the food in Turkey!', '2029-01-22T16:28:32.615Z', 3, 1),
    (true, 4, 'A close tie between this place and Ippudo for best Ramen in NYC', '2029-01-22T16:28:32.615Z', 2, 1),
    (true, 5, 'Would kill for the Szechuan noodles here!', '2029-01-22T16:28:32.615Z', 1, 1);









COMMIT;