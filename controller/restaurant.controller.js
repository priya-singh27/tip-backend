const { serverErrorResponse,
    successResponse,
    notFoundResponse,
    badRequestResponse
} = require('../utils/response');
const { pool } = require('../utils/dbConfig');
const { generateId} = require('../utils/generateUniqueId');
const joi_schema = require('../joi_validation/restaurant/index');
const { findOwnerByEmail, findOwnerById } = require('../repository/owner.repository');
const { getAllRestaurants, getRestaurantByUniqueId, findRestaurantById, doesRestaurantBelong, getRestaurantByNameAndOwnerId } = require('../repository/restaurant.repository');

const getRestaurants = async (req, res) => {
    try {
        const [err, restaurants] = await getAllRestaurants();
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        console.log(restaurants);
        return successResponse(res, restaurants, 'List of all restaurants have been sent');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const registerRestaurant = async (req, res) => {
    try {
        const { error } = joi_schema.restaurant_schema.validate(req.body);
        if (error) {
            console.log(error);
            return badRequestResponse(res, 'Invalid data entered');
        }
        const owner_id = req.user._id;
        const [err1, restaurant] = await getRestaurantByNameAndOwnerId(req.body.name, owner_id);
        if (restaurant) return badRequestResponse(res, 'This restaurant has already ben registered');

        const [err, owner] = await findOwnerById(owner_id);
        if (err) {
            if (err.code == 404) return badRequestResponse(res, 'Not registered');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        let uniqueNumber = generateId();
        let [err2, isRestaurant] = await getRestaurantByUniqueId(uniqueNumber);
        
        //optimization-remove this unique id generator for the restaurant and figure out some other way to handle this kind of operation(birthday paradox)
    
        while (isRestaurant) {
            uniqueNumber = generateId();
            [err2, isRestaurant] = await getRestaurantByUniqueId(uniqueNumber);
        }
        
        const new_restaurant = await pool.promise().query(
            'INSERT INTO restaurants (name,email,phone,business_hours,belongs_to,unique_id) VALUES (?,?,?,?,?,?)',
            [req.body.name, req.body.email, req.body.phone, req.body.business_hours, owner_id, uniqueNumber]
        );
        const insertedRestaurantId = new_restaurant[0].insertId;

        const [fetchErr, insertedRestaurant] = await findRestaurantById(insertedRestaurantId);
        if (fetchErr) {
            console.log(fetchErr);
            return serverErrorResponse(res, 'Error fetching newly created restaurant');
        }

        return successResponse(res, insertedRestaurant, 'Successfully created');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Interanl server error');
    }
}

module.exports = {
    registerRestaurant,
    getRestaurants
}