const User = require('../models/User');
const axios = require('axios');
const logger = require('../utils/logger');

// Google Maps API mock fallbacks — used when key is absent or quota exceeded
const GEOCODE_FALLBACK = { address: 'Address unavailable', city: '', pincode: '' };
const PLACES_FALLBACK = (q) => [
    { id: '1', name: q || 'Location', address: `${q || 'Location'}, India` }
];

// @desc    Get saved addresses
// @route   GET /api/v1/location/client/addresses
// @access  Private (Client)
const getSavedAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user.savedAddresses });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/v1/location/client/addresses
// @access  Private (Client)
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newAddress = req.body;

        user.savedAddresses.push(newAddress);
        await user.save();

        const addedAddress = user.savedAddresses[user.savedAddresses.length - 1];

        res.json({ success: true, data: addedAddress });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/v1/location/client/addresses/:id
// @access  Private (Client)
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressIndex = user.savedAddresses.findIndex(addr => addr._id.toString() === req.params.id);

        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        user.savedAddresses[addressIndex] = { ...user.savedAddresses[addressIndex].toObject(), ...req.body };
        await user.save();

        res.json({ success: true, data: user.savedAddresses[addressIndex] });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// @desc    Delete address
// @route   DELETE /api/v1/location/client/addresses/:id
// @access  Private (Client)
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedAddresses = user.savedAddresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();

        res.json({ success: true, message: 'Address removed' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const reverseGeocode = async (req, res) => {
    const { lat, lng } = req.query;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
        logger.warn('[Geocoding] Invalid or missing lat/lng coordinates', { lat, lng });
        return res.json({ success: true, data: GEOCODE_FALLBACK });
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;

    // Safe dev fallback: no key configured → return mock without crashing
    if (!key) {
        logger.info('[Geocoding] No GOOGLE_MAPS_API_KEY set — returning mock data');
        return res.json({ success: true, data: GEOCODE_FALLBACK });
    }

    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            { params: { latlng: `${lat},${lng}`, key } }
        );

        // CRITICAL: Google returns HTTP 200 even on quota/auth errors — always check status field
        if (response.data.status !== 'OK' || !response.data.results?.length) {
            logger.warn('[Geocoding] Non-OK status from Google API', { status: response.data.status, lat, lng });
            return res.json({ success: true, data: GEOCODE_FALLBACK });
        }

        const result = response.data.results[0];
        const components = result.address_components || [];
        const city = components.find(c => c.types.includes('locality'))?.long_name
            || components.find(c => c.types.includes('administrative_area_level_2'))?.long_name
            || '';
        const pincode = components.find(c => c.types.includes('postal_code'))?.long_name || '';

        res.json({
            success: true,
            data: { address: result.formatted_address, city, pincode }
        });
    } catch (err) {
        logger.error('[Geocoding] Reverse geocode request failed', { error: err.message });
        res.json({ success: true, data: GEOCODE_FALLBACK });
    }
};

// @desc    Search places (text → place suggestions)
// @route   GET /api/v1/location/search?q=query
// @access  Public
const searchPlaces = async (req, res) => {
    const { q } = req.query;
    const key = process.env.GOOGLE_MAPS_API_KEY;

    // Safe dev fallback: no key configured → return mock without crashing
    if (!key) {
        logger.info('[Geocoding] No GOOGLE_MAPS_API_KEY set — returning mock place data');
        return res.json({ success: true, data: PLACES_FALLBACK(q) });
    }

    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/autocomplete/json',
            { params: { input: q, key, components: 'country:in', language: 'en' } }
        );

        // CRITICAL: Google returns HTTP 200 even on quota/auth errors — always check status field
        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            logger.warn('[Geocoding] Non-OK status from Places API', { status: response.data.status, q });
            return res.json({ success: true, data: PLACES_FALLBACK(q) });
        }

        const predictions = response.data.predictions || [];
        const data = predictions.map(p => ({
            id: p.place_id,
            name: p.structured_formatting?.main_text || p.description,
            address: p.description
        }));

        // Return fallback if zero results rather than empty array
        res.json({ success: true, data: data.length ? data : PLACES_FALLBACK(q) });
    } catch (err) {
        logger.error('[Geocoding] Place search request failed', { error: err.message });
        res.json({ success: true, data: PLACES_FALLBACK(q) });
    }
};

module.exports = {
    getSavedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    reverseGeocode,
    searchPlaces
};
