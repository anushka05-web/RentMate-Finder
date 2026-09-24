const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Listing = require('./models/Listing');
const Profile = require('./models/Profile');
const Compatibility = require('./models/Compatibility');
const InterestRequest = require('./models/InterestRequest');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing database...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Profile.deleteMany({});
    await Compatibility.deleteMany({});
    await InterestRequest.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding users...');
    
    // Seed Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@rentmate.in',
      password: 'adminpassword',
      role: 'admin',
      phone: '9876543210',
    });

    // Seed Owners
    const owner1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@gmail.com',
      password: 'password123',
      role: 'owner',
      phone: '9823456789',
    });

    const owner2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      password: 'password123',
      role: 'owner',
      phone: '9123456780',
    });

    // Seed Tenants
    const tenant1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@gmail.com',
      password: 'password123',
      role: 'tenant',
      phone: '8123456789',
    });

    const tenant2 = await User.create({
      name: 'Sneha Gupta',
      email: 'sneha@gmail.com',
      password: 'password123',
      role: 'tenant',
      phone: '7823456789',
    });

    console.log('Seeding room listings...');
    
    const listings = [
      {
        owner: owner1._id,
        title: 'Premium Single Room near Metro in HSR Layout',
        description: 'Cozy and spacious single room located in a prime tech corridor. Ideal for software developers or working professionals. Daily housekeeping and kitchen access included.',
        location: 'Bengaluru',
        locality: 'HSR Layout Sector 2',
        address: 'Flat 402, Sterling Apartments, HSR Layout Sector 2',
        rent: 14500,
        securityDeposit: 30000,
        availableFrom: new Date('2026-08-01'),
        roomType: 'Single Room',
        furnishing: 'Semi Furnished',
        amenities: ['Wi-Fi', 'AC', 'Washing Machine', 'Refrigerator', 'Balcony', 'Geyser', 'CCTV', 'Kitchen Access'],
        foodPreference: 'Both',
        genderPreference: 'Anyone',
        smoking: 'Not Allowed',
        drinking: 'Allowed',
        guests: 'Allowed',
        occupancy: 'Single',
        nearby: ['Metro', 'Office', 'Market', 'Bus Stop'],
        photos: ['/rooms/room1.png'],
        isFilled: false,
      },
      {
        owner: owner1._id,
        title: 'Luxury 1 BHK Studio Flat with Sea View',
        description: 'Stunning fully furnished 1 BHK flat in Andheri West. Comes with high-speed internet, premium air conditioning, and top-tier kitchen appliances. 24/7 security guard.',
        location: 'Mumbai',
        locality: 'Andheri West',
        address: 'B/701, Sea Breeze Tower, Andheri West near Metro Station',
        rent: 24000,
        securityDeposit: 50000,
        availableFrom: new Date('2026-07-20'),
        roomType: '1 BHK',
        furnishing: 'Fully Furnished',
        amenities: ['Wi-Fi', 'AC', 'Washing Machine', 'Refrigerator', 'Microwave', 'TV', 'Geyser', 'Attached Bathroom', 'Security Guard', 'Power Backup'],
        foodPreference: 'Non-Veg Allowed',
        genderPreference: 'Anyone',
        smoking: 'Allowed',
        drinking: 'Allowed',
        guests: 'Allowed',
        occupancy: 'Double',
        nearby: ['Metro', 'Mall', 'Market', 'Hospital'],
        photos: ['/rooms/room2.png'],
        isFilled: false,
      },
      {
        owner: owner2._id,
        title: 'Cozy Shared Room for Girls in South Ext',
        description: 'Neat and clean shared room on a twin sharing basis. Premium study desks, wardrobes, and high-speed Wi-Fi available. Located in a secure gated community.',
        location: 'Delhi',
        locality: 'South Extension Part 1',
        address: 'D-56, Second Floor, South Extension Part 1',
        rent: 18000,
        securityDeposit: 36000,
        availableFrom: new Date('2026-08-15'),
        roomType: 'Shared Room',
        furnishing: 'Fully Furnished',
        amenities: ['Wi-Fi', 'Cooler', 'RO Water', 'Study Table', 'Wardrobe', 'Washing Machine', 'Refrigerator', 'CCTV', 'Attached Bathroom'],
        foodPreference: 'Veg Only',
        genderPreference: 'Girls',
        smoking: 'Not Allowed',
        drinking: 'Not Allowed',
        guests: 'Not Allowed',
        occupancy: 'Double',
        nearby: ['Metro', 'College', 'Market', 'Hospital'],
        photos: ['/rooms/room3.png'],
        isFilled: false,
      },
      {
        owner: owner2._id,
        title: 'Affordable PG Single Bed near Symbiosis',
        description: 'Budget-friendly single occupancy PG room close to Symbiosis Viman Nagar. Includes laundry services, power backup, and regular housekeeping.',
        location: 'Pune',
        locality: 'Viman Nagar',
        address: 'G-12, Orchid Residency, Viman Nagar near Symbiosis College',
        rent: 12000,
        securityDeposit: 20000,
        availableFrom: new Date('2026-08-10'),
        roomType: 'Shared Room',
        furnishing: 'Unfurnished',
        amenities: ['Wi-Fi', 'Cooler', 'Power Backup', 'Housekeeping', 'Laundry', 'Parking'],
        foodPreference: 'Both',
        genderPreference: 'Boys',
        smoking: 'Not Allowed',
        drinking: 'Not Allowed',
        guests: 'Allowed',
        occupancy: 'Single',
        nearby: ['College', 'Bus Stop', 'Mall', 'Office'],
        photos: ['/rooms/room4.png'],
        isFilled: false,
      },
      {
        owner: owner1._id,
        title: 'Spacious 2 BHK Luxury Flat near Tech Park',
        description: 'Beautiful 2 BHK spacious flat with modern decor and premium bathroom fittings. Extremely secure with CCTV and a security guard. Direct park and layout view.',
        location: 'Bengaluru',
        locality: 'Green Glen Layout, Bellandur',
        address: 'Plot 89, Green Glen Layout, Bellandur',
        rent: 28000,
        securityDeposit: 60000,
        availableFrom: new Date('2026-07-15'),
        roomType: '2 BHK',
        furnishing: 'Fully Furnished',
        amenities: ['Wi-Fi', 'AC', 'Washing Machine', 'Refrigerator', 'TV', 'Geyser', 'Balcony', 'Parking', 'Lift', 'Security Guard', 'Attached Bathroom'],
        foodPreference: 'Both',
        genderPreference: 'Anyone',
        smoking: 'Allowed',
        drinking: 'Allowed',
        guests: 'Allowed',
        occupancy: 'Triple',
        nearby: ['Office', 'Market', 'Hospital', 'Mall'],
        photos: ['/rooms/room5.png'],
        isFilled: false,
      }
    ];

    const seededListings = await Listing.insertMany(listings);

    console.log('Seeding tenant requirement profiles...');

    await Profile.create({
      tenant: tenant1._id,
      preferredLocation: 'Bengaluru',
      preferredLocality: 'HSR Layout',
      budgetMin: 12000,
      budgetMax: 18000,
      moveInDate: new Date('2026-08-05'),
      preferredRoomType: 'Single Room',
      furnishingPreference: 'Semi Furnished',
      requiredAmenities: ['Wi-Fi', 'AC', 'Washing Machine', 'Refrigerator', 'Geyser'],
      foodPreference: 'Both',
      gender: 'Anyone',
      smokingPreference: 'Not Allowed',
      drinkingPreference: 'Allowed',
      pets: false,
      parkingRequired: true,
      attachedBathroomRequired: false,
      balconyRequired: true,
      kitchenRequired: true,
      securityRequired: false,
      preferredOccupancy: 'Single',
      nearbyPreference: ['Metro', 'Office', 'Market'],
    });

    await Profile.create({
      tenant: tenant2._id,
      preferredLocation: 'Delhi',
      preferredLocality: 'South Extension',
      budgetMin: 15000,
      budgetMax: 22000,
      moveInDate: new Date('2026-09-01'),
      preferredRoomType: 'Shared Room',
      furnishingPreference: 'Fully Furnished',
      requiredAmenities: ['Wi-Fi', 'Washing Machine', 'Refrigerator', 'RO Water', 'Study Table'],
      foodPreference: 'Veg Only',
      gender: 'Girls',
      smokingPreference: 'Not Allowed',
      drinkingPreference: 'Not Allowed',
      pets: false,
      parkingRequired: false,
      attachedBathroomRequired: true,
      balconyRequired: false,
      kitchenRequired: false,
      securityRequired: true,
      preferredOccupancy: 'Double',
      nearbyPreference: ['Metro', 'Market', 'College'],
    });

    console.log('✓ Seeding Completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedData();
