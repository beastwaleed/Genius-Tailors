const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./src/models/Service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/genius-tailors';

mongoose.connect(MONGO_URI).then(async () => {
  await Service.deleteMany({});
  
  const services = [
    {
      name: 'Kameez Shalwar',
      description: 'The Timeless Pakistani Classic. Our most-ordered garment.',
      basePrice: 2500,
      customizations: {
        collarStyles: ['Ban', 'Collar', 'Sherwani', 'Round Neck'],
        sleeveStyles: ['Cuff', 'Open', 'Half Sleeve'],
        frontStyles: ['Hidden Placket', 'Visible Buttons', 'Embroidery'],
        bottomStyles: ['Straight Shalwar', 'Patiyala']
      }
    },
    {
      name: 'Kurta Shalwar',
      description: 'Relaxed, Refined, Everyday. A shorter, lighter alternative.',
      basePrice: 2000,
      customizations: {
        collarStyles: ['Mandarin', 'Standard Collar', 'Round Neck'],
        sleeveStyles: ['Cuff', 'Open'],
        frontStyles: ['Hidden Placket', 'Visible Buttons'],
        bottomStyles: ['Straight Shalwar']
      }
    },
    {
      name: 'Kurta Pajama',
      description: 'Evening Elegance. Perfect for events, evenings, and festive wear.',
      basePrice: 2000,
      customizations: {
        collarStyles: ['Ban', 'Collar', 'Sherwani'],
        sleeveStyles: ['Cuff', 'Open'],
        frontStyles: ['Hidden Placket', 'Visible Buttons', 'Pin Tucks'],
        bottomStyles: ['Slim Pajama', 'Churidar', 'Straight Trouser']
      }
    },
    {
      name: 'Waistcoat',
      description: 'Sharp Layering for Any Look. Elevates any ethnic outfit.',
      basePrice: 2000,
      customizations: {
        collarStyles: ['Ban', 'V-Neck', 'Round'],
        frontStyles: ['Single Breasted', 'Double Breasted', 'Hidden Buttons'],
        bottomStyles: []
      }
    }
  ];

  await Service.insertMany(services);
  console.log('Services seeded successfully!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
