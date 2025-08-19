require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const User = require('../models/User');

async function seedCars() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.log('Admin user không tồn tại. Chạy seed:users trước.');
      process.exit(1);
    }

    const samples = [
      { name: 'Toyota Camry 2.5Q', brand: 'Toyota', price: 950000000, year: 2022, condition: 'USED', mileageKm: 15000, description: 'Sedan cao cấp, nội thất da, màn hình 9 inch, cam 360.' },
      { name: 'Honda CR-V 1.5L Turbo', brand: 'Honda', price: 1020000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV 7 chỗ, động cơ tăng áp 1.5L, Honda Sensing.' },
      { name: 'VinFast VF8 Eco', brand: 'VinFast', price: 1150000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Xe điện thông minh OTA updates.' },
      { name: 'Mazda CX-5 Premium', brand: 'Mazda', price: 870000000, year: 2021, condition: 'USED', mileageKm: 22000, description: 'SUV 5 chỗ, GVC Plus, nội thất sáng.' },
      { name: 'Ford Ranger Wildtrak 2.0', brand: 'Ford', price: 990000000, year: 2022, condition: 'USED', mileageKm: 18000, description: 'Bán tải hiệu năng cao, dẫn động 2 cầu.' },
      { name: 'Ford Everest Titanium 2.0', brand: 'Ford', price: 1250000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV 7 chỗ, nhiều công nghệ an toàn.' },
      { name: 'Hyundai SantaFe 2.2D', brand: 'Hyundai', price: 1180000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV 7 chỗ máy dầu, tiết kiệm nhiên liệu.' },
      { name: 'Hyundai Tucson 2.0', brand: 'Hyundai', price: 830000000, year: 2022, condition: 'USED', mileageKm: 12000, description: 'Crossover phong cách, an toàn cao.' },
      { name: 'Kia Seltos 1.4 Turbo', brand: 'Kia', price: 720000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV đô thị trẻ trung.' },
      { name: 'Kia Carnival Premium', brand: 'Kia', price: 1380000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'MPV gia đình sang trọng.' },
      { name: 'Mercedes C300 AMG', brand: 'Mercedes', price: 1850000000, year: 2022, condition: 'USED', mileageKm: 9000, description: 'Sedan hạng sang, gói AMG thể thao.' },
      { name: 'Mercedes GLC300 4Matic', brand: 'Mercedes', price: 2450000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV hạng sang, dẫn động 4Matic.' },
      { name: 'BMW 330i M Sport', brand: 'BMW', price: 2100000000, year: 2022, condition: 'USED', mileageKm: 8000, description: 'Sedan thể thao, cảm giác lái phấn khích.' },
      { name: 'BMW X5 xDrive40i', brand: 'BMW', price: 4200000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV sang trọng, động cơ mạnh mẽ.' },
      { name: 'Audi Q5 S-Line', brand: 'Audi', price: 2300000000, year: 2022, condition: 'USED', mileageKm: 10000, description: 'SUV sang, hệ dẫn quattro.' },
      { name: 'Audi A6 45 TFSI', brand: 'Audi', price: 2700000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Sedan sang, nội thất công nghệ.' },
      { name: 'Porsche Macan Base', brand: 'Porsche', price: 3500000000, year: 2022, condition: 'USED', mileageKm: 7000, description: 'SUV hiệu năng, cảm giác lái tốt.' },
      { name: 'Porsche Cayenne', brand: 'Porsche', price: 5500000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'SUV hạng sang cao cấp.' },
      { name: 'Lexus RX350 Luxury', brand: 'Lexus', price: 4100000000, year: 2022, condition: 'USED', mileageKm: 6000, description: 'SUV sang trọng, êm ái.' },
      { name: 'Lexus ES250', brand: 'Lexus', price: 2700000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Sedan sang trọng yên tĩnh.' },
      { name: 'Chevrolet Trailblazer LTZ', brand: 'Chevrolet', price: 860000000, year: 2021, condition: 'USED', mileageKm: 25000, description: 'SUV 7 chỗ rộng rãi.' },
      { name: 'Chevrolet Spark LS', brand: 'Chevrolet', price: 280000000, year: 2022, condition: 'USED', mileageKm: 9000, description: 'Xe đô thị nhỏ gọn.' },
      { name: 'Nissan Navara VL', brand: 'Nissan', price: 950000000, year: 2022, condition: 'USED', mileageKm: 14000, description: 'Bán tải mạnh mẽ, êm ái.' },
      { name: 'Nissan Almera Turbo', brand: 'Nissan', price: 540000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Sedan cỡ B động cơ tăng áp.' },
      { name: 'Mitsubishi Xpander Cross', brand: 'Mitsubishi', price: 710000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'MPV gầm cao đa dụng.' },
      { name: 'Mitsubishi Pajero Sport', brand: 'Mitsubishi', price: 1250000000, year: 2022, condition: 'USED', mileageKm: 20000, description: 'SUV khung gầm rời mạnh mẽ.' },
      { name: 'Peugeot 3008 Allure', brand: 'Peugeot', price: 1050000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Crossover phong cách châu Âu.' },
      { name: 'Peugeot 5008 GT', brand: 'Peugeot', price: 1250000000, year: 2022, condition: 'USED', mileageKm: 9000, description: 'SUV 7 chỗ, i-Cockpit.' },
      { name: 'Subaru Forester iL', brand: 'Subaru', price: 980000000, year: 2022, condition: 'USED', mileageKm: 13000, description: 'SUV AWD cân bằng tốt.' },
      { name: 'Subaru Outback', brand: 'Subaru', price: 1650000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Crossover wagon đa dụng.' },
      { name: 'Volvo XC60 Inscription', brand: 'Volvo', price: 2450000000, year: 2022, condition: 'USED', mileageKm: 10000, description: 'SUV an toàn, nội thất Bắc Âu.' },
      { name: 'Volvo S90 Momentum', brand: 'Volvo', price: 2700000000, year: 2023, condition: 'NEW', mileageKm: 0, description: 'Sedan sang trọng, tối giản.' }
    ];

    for (const c of samples) {
      const exists = await Car.findOne({ name: c.name, year: c.year });
      if (!exists) {
        await Car.create({ ...c, createdBy: admin._id });
        console.log('Đã tạo xe:', c.name);
      } else {
        console.log('Xe đã tồn tại, bỏ qua:', c.name);
      }
    }

    console.log('Seeding cars hoàn tất.');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed cars:', err);
    process.exit(1);
  }
}

seedCars();
