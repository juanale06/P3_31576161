import sequelize from '../config/database.js';
import User from '../models/User.model.js';
import Category from '../models/Category.model.js';
import Tag from '../models/Tag.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';
import { OrderStatus } from '../models/Order.model.js';

// Datos de ejemplo para generar registros variados
const artistNames = [
  'Pink Floyd', 'The Beatles', 'Led Zeppelin', 'Queen', 'The Rolling Stones',
  'Miles Davis', 'John Coltrane', 'Ella Fitzgerald', 'Louis Armstrong', 'Duke Ellington',
  'Daft Punk', 'Kraftwerk', 'Aphex Twin', 'The Chemical Brothers', 'Massive Attack',
  'Michael Jackson', 'Madonna', 'Prince', 'David Bowie', 'Elton John',
  'Mozart', 'Beethoven', 'Bach', 'Vivaldi', 'Tchaikovsky',
  'Bob Dylan', 'Jimi Hendrix', 'Nirvana', 'Radiohead', 'The Doors',
  'Aretha Franklin', 'Stevie Wonder', 'Marvin Gaye', 'Ray Charles', 'James Brown',
  'AC/DC', 'Metallica', 'Iron Maiden', 'Black Sabbath', 'Deep Purple',
  'The Clash', 'Sex Pistols', 'Ramones', 'The Smiths', 'Joy Division',
  'Fleetwood Mac', 'Eagles', 'Creedence Clearwater Revival', 'The Who', 'Genesis'
];

const albumPrefixes = [
  'The Best of', 'Greatest Hits', 'Live at', 'The Complete', 'Essential',
  'Anthology', 'Collection', 'Masterpieces', 'Classics', 'Legends',
  'Ultimate', 'Definitive', 'Platinum', 'Gold', 'Diamond'
];

const albumSuffixes = [
  'Sessions', 'Years', 'Era', 'Collection', 'Experience',
  'Journey', 'Story', 'Legacy', 'Chronicles', 'Memories'
];

const labels = [
  'Columbia Records', 'Atlantic Records', 'Capitol Records', 'RCA Records', 'Warner Bros',
  'EMI', 'Decca', 'Mercury Records', 'Polydor', 'Island Records',
  'Virgin Records', 'Epic Records', 'Elektra Records', 'Reprise Records', 'A&M Records',
  'Motown', 'Stax Records', 'Blue Note', 'Verve Records', 'Impulse!'
];

const formats = ['LP', 'EP', 'Single', '7"', '10"', '12"'];
const conditions = ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good'];

const categoryData = [
  { name: 'Rock', description: 'Vinilos de música rock clásica y moderna' },
  { name: 'Jazz', description: 'Vinilos de jazz y blues' },
  { name: 'Electronic', description: 'Música electrónica y dance' },
  { name: 'Pop', description: 'Música pop internacional' },
  { name: 'Classical', description: 'Música clásica y orquestal' },
  { name: 'Soul', description: 'Soul, funk y R&B' },
  { name: 'Metal', description: 'Heavy metal y hard rock' },
  { name: 'Punk', description: 'Punk rock y new wave' },
  { name: 'Folk', description: 'Folk y country' },
  { name: 'Hip Hop', description: 'Hip hop y rap' },
  { name: 'Reggae', description: 'Reggae y ska' },
  { name: 'Blues', description: 'Blues tradicional y moderno' },
  { name: 'Indie', description: 'Indie rock y alternativo' },
  { name: 'Progressive', description: 'Rock progresivo' },
  { name: 'Psychedelic', description: 'Rock psicodélico' }
];

const tagData = [
  { name: 'Vintage' }, { name: 'Rare' }, { name: 'Limited Edition' },
  { name: 'Remastered' }, { name: 'First Press' }, { name: 'Collector Item' },
  { name: 'Audiophile' }, { name: 'Import' }, { name: 'Gatefold' },
  { name: 'Picture Disc' }, { name: 'Colored Vinyl' }, { name: 'Box Set' },
  { name: 'Signed' }, { name: 'Numbered' }, { name: 'Sealed' },
  { name: 'Original Press' }, { name: 'Reissue' }, { name: 'Anniversary Edition' },
  { name: '180g Vinyl' }, { name: 'Half Speed Master' }
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomPrice(): number {
  return parseFloat((Math.random() * 80 + 10).toFixed(2));
}

function randomStock(): number {
  return Math.floor(Math.random() * 20);
}

function randomYear(): number {
  return Math.floor(Math.random() * (2024 - 1950) + 1950);
}

function generateAlbumName(artist: string): string {
  const types = [
    `${randomElement(albumPrefixes)} ${artist}`,
    `${artist} ${randomElement(albumSuffixes)}`,
    `${artist} - ${randomElement(['Vol.', 'Part', 'Chapter'])} ${Math.floor(Math.random() * 5 + 1)}`,
    `${randomElement(['The', 'A', 'An'])} ${randomElement(['Journey', 'Story', 'Legend', 'Dream', 'Vision'])} of ${artist}`,
  ];
  return randomElement(types);
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    console.log('⏳ Este proceso puede tomar algunos minutos...\n');

    // Sincronizar base de datos (recrear tablas)
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear 100 usuarios
    console.log('👥 Creando usuarios...');
    const users = [];
    for (let i = 1; i <= 100; i++) {
      const user = await User.create({
        nombreCompleto: `Usuario ${i}`,
        email: `user${i}@example.com`,
        password: 'password123',
      });
      users.push(user);
      if (i % 20 === 0) console.log(`   ✓ ${i} usuarios creados`);
    }
    console.log(`✅ ${users.length} usuarios creados\n`);

    // Crear 100 categorías (15 base + 85 variaciones)
    console.log('📁 Creando categorías...');
    const categories = [];
    const usedCategoryNames = new Set<string>();

    // Crear categorías base
    for (const cat of categoryData) {
      const category = await Category.create(cat);
      categories.push(category);
      usedCategoryNames.add(cat.name);
    }

    // Crear variaciones de categorías
    const subgenres = [
      'Classic', 'Modern', 'Contemporary', 'Traditional', 'Experimental',
      'Underground', 'Mainstream', 'Alternative', 'Fusion', 'Acoustic',
      'Vintage', 'New Wave', 'Post', 'Neo', 'Proto'
    ];

    const decades = ['50s', '60s', '70s', '80s', '90s', '2000s', '2010s', '2020s'];
    const regions = ['British', 'American', 'European', 'Latin', 'Asian', 'African'];

    for (let i = categoryData.length; i < 100; i++) {
      let categoryName = '';
      let attempts = 0;

      // Intentar generar un nombre único
      while (attempts < 50) {
        const type = Math.random();
        if (type < 0.4) {
          const baseCat = randomElement(categoryData);
          const subgenre = randomElement(subgenres);
          categoryName = `${subgenre} ${baseCat.name}`;
        } else if (type < 0.7) {
          const baseCat = randomElement(categoryData);
          const decade = randomElement(decades);
          categoryName = `${decade} ${baseCat.name}`;
        } else {
          const baseCat = randomElement(categoryData);
          const region = randomElement(regions);
          categoryName = `${region} ${baseCat.name}`;
        }

        if (!usedCategoryNames.has(categoryName)) {
          break;
        }
        attempts++;
      }

      if (usedCategoryNames.has(categoryName)) {
        categoryName = `Category ${i + 1}`;
      }

      const baseCat = randomElement(categoryData);
      const category = await Category.create({
        name: categoryName,
        description: `${categoryName} - ${baseCat.description.toLowerCase()}`
      });
      categories.push(category);
      usedCategoryNames.add(categoryName);

      if (i % 20 === 0) console.log(`   ✓ ${i} categorías creadas`);
    }
    console.log(`✅ ${categories.length} categorías creadas\n`);

    // Crear 100 tags (20 base + 80 variaciones)
    console.log('🏷️  Creando tags...');
    const tags = [];
    const usedTagNames = new Set<string>();

    for (const tag of tagData) {
      const newTag = await Tag.create(tag);
      tags.push(newTag);
      usedTagNames.add(tag.name);
    }

    const tagVariations = [
      'Rare Find', 'Must Have', 'Essential', 'Iconic', 'Legendary',
      'Cult Classic', 'Hidden Gem', 'Underrated', 'Masterpiece', 'Timeless',
      'Award Winner', 'Chart Topper', 'Platinum', 'Gold Certified', 'Multi-Platinum',
      'Studio Recording', 'Live Recording', 'Acoustic Version', 'Deluxe Edition', 'Special Edition',
      'Critically Acclaimed', 'Fan Favorite', 'Best Seller', 'Top Rated', 'Highly Recommended',
      'Mint Condition', 'Near Perfect', 'Excellent Quality', 'Premium', 'Superior',
      'Rare Pressing', 'Original Artwork', 'Complete Set', 'Bonus Tracks', 'Extended Version',
      'Remastered Audio', 'Enhanced Sound', 'Digital Remaster', 'Restored', 'Cleaned',
      'Collectible', 'Investment Grade', 'Museum Quality', 'Archive Quality', 'Pristine',
      'Hard to Find', 'Out of Print', 'Discontinued', 'Limited Run', 'Small Batch',
      'Indie Release', 'Self Released', 'Underground', 'Bootleg', 'Unofficial',
      'Promotional', 'Radio Edit', 'Demo Version', 'Test Press', 'White Label'
    ];

    for (let i = tagData.length; i < 100; i++) {
      let tagName = '';

      if (i < 80 && tagVariations.length > 0) {
        const availableVariations = tagVariations.filter(v => !usedTagNames.has(v));
        if (availableVariations.length > 0) {
          tagName = randomElement(availableVariations);
        } else {
          tagName = `Tag ${i + 1}`;
        }
      } else {
        tagName = `Tag ${i + 1}`;
      }

      const tag = await Tag.create({ name: tagName });
      tags.push(tag);
      usedTagNames.add(tagName);

      if (i % 20 === 0) console.log(`   ✓ ${i} tags creados`);
    }
    console.log(`✅ ${tags.length} tags creados\n`);

    // Crear 100 productos
    console.log('🎵 Creando productos...');
    const products = [];

    for (let i = 1; i <= 100; i++) {
      const artist = randomElement(artistNames);
      const albumName = generateAlbumName(artist);
      const year = randomYear();
      const price = randomPrice();
      const stock = randomStock();
      const format = randomElement(formats);
      const condition = randomElement(conditions);
      const category = randomElement(categories);
      const user = randomElement(users);
      const label = randomElement(labels);

      const product = await Product.create({
        name: albumName,
        description: `${albumName} by ${artist} - Released in ${year}. ${format} format in ${condition} condition.`,
        price,
        stock,
        categoryId: category.id,
        artist,
        label,
        releaseYear: year,
        format,
        condition,
        sku: `${artist.substring(0, 3).toUpperCase()}-${year}-${i}`,
        userId: user.id,
        isActive: Math.random() > 0.1,
      });

      const numTags = Math.floor(Math.random() * 4) + 2;
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, numTags);
      await product.$set('tags', randomTags);

      products.push(product);
      if (i % 20 === 0) console.log(`   ✓ ${i} productos creados`);
    }
    console.log(`✅ ${products.length} productos creados\n`);

    // Crear 30 órdenes de ejemplo
    console.log('🛒 Creando órdenes...');
    const orders = [];
    const orderStatuses = [OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELED];

    for (let i = 1; i <= 30; i++) {
      const user = randomElement(users);
      const status = randomElement(orderStatuses);

      const numItems = Math.floor(Math.random() * 4) + 1;
      const availableProducts = products.filter(p => p.stock > 0);
      const orderProducts = availableProducts.sort(() => 0.5 - Math.random()).slice(0, numItems);

      let totalAmount = 0;
      const orderItemsData = [];

      for (const product of orderProducts) {
        const quantity = Math.min(Math.floor(Math.random() * 3) + 1, product.stock);
        const unitPrice = Number(product.price);
        totalAmount += unitPrice * quantity;

        orderItemsData.push({
          productId: product.id,
          quantity,
          unitPrice,
        });
      }

      const order = await Order.create({
        userId: user.id,
        status,
        totalAmount,
      });

      for (const itemData of orderItemsData) {
        await OrderItem.create({
          orderId: order.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
      }

      orders.push(order);
      if (i % 10 === 0) console.log(`   ✓ ${i} órdenes creadas`);
    }
    console.log(`✅ ${orders.length} órdenes creadas\n`);

    console.log('📊 Estadísticas del seed:');
    console.log(`   👥 Usuarios: ${users.length}`);
    console.log(`   📁 Categorías: ${categories.length}`);
    console.log(`   🏷️  Tags: ${tags.length}`);
    console.log(`   🎵 Productos: ${products.length}`);
    console.log(`   🛒 Órdenes: ${orders.length}`);

    const activeProducts = products.filter(p => p.isActive).length;
    const totalValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price));
      return sum + price;
    }, 0);
    const avgPrice = totalValue / products.length;

    console.log(`\n💰 Estadísticas de productos:`);
    console.log(`   Activos: ${activeProducts}`);
    console.log(`   Inactivos: ${products.length - activeProducts}`);
    console.log(`   Precio promedio: $${avgPrice.toFixed(2)}`);
    console.log(`   Valor total inventario: $${totalValue.toFixed(2)}`);

    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const totalOrderValue = orders.reduce((sum, o) => {
      const amount = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(String(o.totalAmount));
      return sum + amount;
    }, 0);

    console.log(`\n🛒 Estadísticas de órdenes:`);
    console.log(`   Completadas: ${completedOrders}`);
    console.log(`   Fallidas/Canceladas: ${orders.length - completedOrders}`);
    console.log(`   Valor total: $${totalOrderValue.toFixed(2)}`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('   Email: user1@example.com');
    console.log('   Password: password123');
    console.log('\n💡 Puedes usar cualquier usuario de user1 a user100');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
