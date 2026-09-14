const express = require('express');
const router = express.Router();
const { protectClient } = require('../middleware/authMiddleware');
const {
    getSavedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    reverseGeocode,
    searchPlaces
} = require('../controllers/locationController');

router.get('/client/addresses', protectClient, getSavedAddresses);
router.post('/client/addresses', protectClient, addAddress);
router.put('/client/addresses/:id', protectClient, updateAddress);
router.delete('/client/addresses/:id', protectClient, deleteAddress);
router.get('/reverse-geocode', reverseGeocode);
router.get('/search', searchPlaces);

module.exports = router;
