Eatabout App Server

Routes:

/api/auth \
    POST /login - user login \
    GET /:user_name - get user by username


/api/cuisines \
    GET / - get all cuisines \
    GET /report - get cuisine chart data


/api/entries \
    GET / - get all entries \
    POST / - post a restaurant entry \
    GET /:entry_id - get a specific entry by id \
    DELETE /:entry_id - delete specific entry by id


/api/items \
    POST / - post an entry item \
    DELETE /:item_id - delete a specific entry item


/api/restaurants \
    GET / - get all restaurants associated with a user \
    POST / - post a new restaurant associated with a user \
    GET /:restaurant_id - get a specific user restaurant \
    PATCH /:restaurant_id - edit user restaurant \
    DELETE /:restaurant_id - delete user restaurant \
    GET /:restaurant_id/entries - get all entries for a user restaurant \
    GET /all - get all restaurants \
    POST /all - post restaurant to main restaurants table

/api/users \
    POST / - create new user (sign up) 


/api/upload \
    POST / - post an item photo (uses cloudinary to store images)