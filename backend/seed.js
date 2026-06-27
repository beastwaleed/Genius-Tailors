const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Service = require('./src/models/Service');
  
  const newServices = [
    {
      name: 'Kameez Shalwar Design',
      description: 'Custom designer patterns and exclusive stitching for a truly unique look.',
      basePrice: 3500,
      featuredImage: 'https://res.cloudinary.com/dg46t4sxa/image/upload/v1700000000/ShalwarKameezFeaturedImage.jpeg',
      customizations: {
        collarStyles: ['Ban Collar', 'Shirt Collar'],
        sleeveStyles: ['Round Cuff', 'Square Cuff', 'Double Cuff'],
        frontStyles: [],
        backStyles: [],
        bottomStyles: ['Straight Shalwar', 'Pajama']
      },
      isActive: true
    },
    {
      name: 'Kurta Shalwar Design',
      description: 'A modern, designer take on the classic Kurta Shalwar with unique details.',
      basePrice: 3000,
      featuredImage: 'https://res.cloudinary.com/dg46t4sxa/image/upload/v1700000000/kurtaShalwarFeatured.jpeg',
      customizations: {
        collarStyles: ['Ban Collar'],
        sleeveStyles: ['Round Sleeves', 'Square Cuff'],
        frontStyles: [],
        backStyles: [],
        bottomStyles: ['Straight Shalwar', 'Pajama']
      },
      isActive: true
    },
    {
      name: 'Zardari Suit',
      description: 'A complete 3-piece suit with perfectly matching kurta, shalwar, and waistcoat.',
      basePrice: 5000,
      featuredImage: 'https://res.cloudinary.com/dg46t4sxa/image/upload/v1700000000/waistcoatfront.jpeg',
      customizations: {
        collarStyles: ['Round Neck', 'Sherwani Collar', 'V Collar'],
        sleeveStyles: [],
        frontStyles: [],
        backStyles: [],
        bottomStyles: []
      },
      isActive: true
    }
  ];

  for (let svc of newServices) {
    const exists = await Service.findOne({ name: svc.name });
    if (!exists) {
      await Service.create(svc);
      console.log('Created:', svc.name);
    } else {
      console.log('Exists:', svc.name);
    }
  }

  process.exit(0);
}).catch(console.error);
