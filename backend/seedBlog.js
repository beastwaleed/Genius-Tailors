require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./src/models/Blog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const blogContent = `
# The Ultimate Guide to Choosing the Perfect Fabric for Your Shalwar Kameez in Pakistan

When it comes to traditional Eastern wear, nothing compares to the elegance of a perfectly tailored outfit. But before the needle even touches the cloth, the most critical decision is made: **choosing the right fabric**. 

Whether you are looking for a highly breathable **premium cotton kurta pajama** for the scorching summer heat or a sophisticated, heavy **gents shalwar kameez design** for winter weddings, the fabric dictates the flow, comfort, and luxury of the garment. 

As the leading **online tailor in Pakistan**, Genius Tailors has worked with thousands of fabrics. In this guide, we break down exactly how to choose the perfect material for your custom-stitched suit.

## 1. The Summer Essential: Premium Pure Cotton

![White Premium Cotton Kurta](/blogs/cotton_kurta.png)

Summer in Pakistan is unforgiving, making pure cotton the undisputed king of men's traditional wear. 

**Why it works:** Cotton is incredibly breathable, absorbs moisture, and allows air circulation. A pure **premium cotton kurta pajama** in classic white, off-white, or pastel shades keeps you cool while looking exceptionally sharp.

**Styling Tip:** Cotton tends to wrinkle easily, which is part of its natural charm. If you prefer a stiffer look (ideal for formal office wear), opt for a light cotton blend or add starch after washing. Pair it with a classic Peshawari chappal for the ultimate summer aesthetic.

## 2. The Winter Warrior: Heavy Karandi & Khaddar

![Winter Karandi Fabric](/blogs/winter_karandi.png)

When the temperature drops, your fabric needs to provide warmth without sacrificing style. This is where Karandi, Khaddar, and heavy Wash-n-Wear fabrics come into play.

**Why it works:** These fabrics have a dense weave, providing excellent insulation. Karandi, in particular, has a beautiful texture that adds depth to darker colors like navy, maroon, and dark olive green. A thick **gents shalwar kameez design** in these fabrics hangs heavily, creating a very strong, masculine silhouette.

**Styling Tip:** These fabrics are perfect for layering. Combine your textured winter suit with a contrasting velvet shawl or a matching waistcoat for a royal, sophisticated look.

## 3. The All-Rounder: Wash-and-Wear (Blended Fabric)

If you need a suit for daily office wear or casual outings that requires minimal maintenance, wash-and-wear (a blend of cotton and synthetic fibers like polyester) is your best friend.

**Why it works:** It resists wrinkles, drapes beautifully, and is highly durable. It doesn't require extreme ironing like pure cotton, making it the most practical choice for everyday wear.

## 4. The Formal Masterpiece: Boski & Silk Blends

For high-end weddings, Eid, and grand celebrations, you need a fabric that speaks luxury the moment you walk into the room.

**Why it works:** Boski (spun silk) is incredibly smooth, lightweight, and has a subtle sheen that looks phenomenally rich. Silk blends offer a similar luxury feel but with added structure. These fabrics are reserved for statement pieces.

## Conclusion: Let the Experts Handle It

Choosing the fabric is only half the battle. The magic happens in the stitching. A premium fabric stitched poorly is a waste, while average fabric tailored perfectly can look like a million dollars. 

At Genius Tailors, your premier **online tailor in Pakistan**, we don't just stitch clothes; we craft an experience. You select the fabric, provide your measurements online, and our master tailors create a flawless fit delivered right to your doorstep.

[**Book your custom tailoring order today**](/book) and experience the luxury of a perfect fit.
`;

const seedBlog = async () => {
  await connectDB();
  
  try {
    const blog = await Blog.create({
      title: 'The Ultimate Guide to Choosing the Perfect Fabric for Your Shalwar Kameez',
      slug: 'ultimate-guide-fabric-shalwar-kameez-pakistan',
      content: blogContent,
      summary: 'Learn how to select the perfect fabric for your shalwar kameez. From premium summer cotton to heavy winter karandi, master the art of traditional wear with Genius Tailors.',
      featuredImage: '/blogs/fabric_guide_hero.png',
      altText: 'Premium fabrics folded on a tailor table in Pakistan',
      tags: ['Fabric Guide', 'Style Tips', 'Mens Fashion'],
      metaTitle: 'Fabric Guide for Shalwar Kameez Pakistan | Genius Tailors',
      metaDescription: 'Discover the best fabrics for your gents shalwar kameez design. From premium cotton kurta pajama to winter karandi, let our online tailor guide you.',
      status: 'published'
    });
    console.log('Blog successfully created!', blog.slug);
  } catch (error) {
    console.error('Error creating blog:', error);
  } finally {
    process.exit(0);
  }
};

seedBlog();
