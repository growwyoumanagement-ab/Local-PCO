const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for Node >= 18 SRV resolution issues in local networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars

dotenv.config({ path: path.join(__dirname, '../.env') });

// Load models
const ServiceCategory = require('../src/models/ServiceCategory');

const categories = [
    { name: 'Electrician', icon: 'flash', description: 'Professional electrical services and repairs' },
    { name: 'AC Repair', icon: 'snow', description: 'Air conditioner installation, repair, and maintenance' },
    { name: 'Painter', icon: 'color-palette', description: 'Interior and exterior painting services' },
    { name: 'Locksmith', icon: 'key', description: 'Lock repair, replacement, and emergency lockout services' },
    { name: 'Cleaning', icon: 'broom', description: 'Deep cleaning and regular cleaning services' },
    { name: 'Pest Control', icon: 'bug', description: 'Pest control and extermination services' },
    { name: 'CCTV', icon: 'videocam', description: 'CCTV installation and maintenance' },
    { name: 'Tiles', icon: 'grid', description: 'Tile laying and repair services' },
    { name: 'Appliance Repair', icon: 'construct', description: 'Repair services for household appliances' },
    { name: 'Waterproofing', icon: 'water', description: 'Waterproofing solutions for roofs and walls' },
    { name: 'Packers & Movers', icon: 'cube', description: 'Relocation and packing services' },
    { name: 'Interior Design', icon: 'home', description: 'Professional interior design and consultation' },
    { name: 'Lawn', icon: 'leaf', description: 'Lawn care and gardening services' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');

        // Check for existing categories to avoid duplicates
        const existingCategories = await ServiceCategory.find({});
        const existingNames = existingCategories.map(cat => cat.name);

        const newCategories = categories.filter(cat => !existingNames.includes(cat.name));

        if (newCategories.length > 0) {
            await ServiceCategory.insertMany(newCategories);
            console.log(`Successfully added ${newCategories.length} new categories.`);
            console.log(newCategories.map(c => c.name).join(', '));
        } else {
            console.log('No new categories to add. All requested categories already exist.');
        }

        process.exit();
    } catch (err) {
        console.error('Error seeding categories:', err);
        process.exit(1);
    }
};

seedCategories();
