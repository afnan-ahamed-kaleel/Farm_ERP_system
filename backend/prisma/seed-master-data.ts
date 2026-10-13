import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Master Data...');

  // 1. Seed Customers
  const customers = [
    { name: 'Ceylon Supermarkets Ltd', contactNumber: '+94 11 234 5678', address: 'Colombo 03' },
    { name: 'Southern Wholesale Bakers', contactNumber: '+94 91 888 2211', address: 'Galle City' },
    { name: 'Lanka Agro Mart', contactNumber: '+94 41 555 4321', address: 'Matara Junction' },
  ];
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!existing) await prisma.customer.create({ data: c });
  }

  // 2. Seed Suppliers
  const suppliers = [
    { name: 'Supreme Hatcheries Ltd', type: 'HATCHERY', contactNumber: '+94 33 221 4455', address: 'Kurunegala' },
    { name: 'Lanka Feeds & Grains Co', type: 'FEED_INGREDIENT', contactNumber: '+94 11 999 1234', address: 'Peliyagoda' },
    { name: 'Apex Packaging Supplies', type: 'PACKAGING', contactNumber: '+94 11 777 9876', address: 'Biyagama EPZ' },
  ];
  for (const s of suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.supplier.create({ data: s });
  }

  // 3. Seed Items (Raw materials, Feeds, Packaging, Eggs)
  const items = [
    { code: 'RM-CORN-01', name: 'Whole Yellow Corn', category: 'RAW_MATERIAL', primaryUom: 'KG' },
    { code: 'RM-SOYA-01', name: 'Dehulled Soybean Meal', category: 'RAW_MATERIAL', primaryUom: 'KG' },
    { code: 'RM-PREMIX-01', name: 'Layer Mineral & Vitamin Premix', category: 'RAW_MATERIAL', primaryUom: 'KG' },
    { code: 'FEED-BROODER-01', name: 'Brooder Starter Crumbles', category: 'FEED', primaryUom: 'KG' },
    { code: 'FEED-LAYER-01', name: 'Commercial Layer Mash', category: 'FEED', primaryUom: 'KG' },
    { code: 'PKG-TRAY-30', name: 'Molded Pulp Egg Trays (30 Eggs)', category: 'PACKAGING', primaryUom: 'UNIT' },
    { code: 'EGG-TABLE-01', name: 'Fresh Farm Table Eggs', category: 'EGG', primaryUom: 'UNIT' },
  ];
  for (const it of items) {
    const existing = await prisma.item.findUnique({ where: { code: it.code } });
    if (!existing) await prisma.item.create({ data: it as any });
  }

  // 4. Seed Operational Reasons
  const reasons = [
    { category: 'MORTALITY_CAUSE', code: 'HEAT_STRESS', name: 'Heat Stress (Ambient > 34°C)', description: 'Hyperthermia during peak midday' },
    { category: 'MORTALITY_CAUSE', code: 'RESPIRATORY', name: 'Respiratory Infection (CRD)', description: 'Mycoplasma or IB symptoms' },
    { category: 'MORTALITY_CAUSE', code: 'SMOTHERING', name: 'Huddling / Smothering', description: 'Suffocation caused by sudden panic or draft' },
    { category: 'MORTALITY_CAUSE', code: 'CULLING_SICK', name: 'Selective Culling (Weak/Sick)', description: 'Non-productive or diseased bird removal' },
    { category: 'MORTALITY_CAUSE', code: 'NATURAL', name: 'Natural / General Mortality', description: 'Age or metabolic failure' },
    { category: 'REJECTION_REASON', code: 'CRACKED', name: 'Hairline or Crushed Shell', description: 'Physical egg damage during collection' },
    { category: 'REJECTION_REASON', code: 'DIRTY', name: 'Dirty / Manure Stained', description: 'Nest box hygiene defect' },
    { category: 'REJECTION_REASON', code: 'DEFORMED', name: 'Soft / Misshapen Shell', description: 'Calcium deficiency or young hen defect' },
  ];
  for (const r of reasons) {
    const existing = await prisma.operationalReason.findUnique({ where: { code: r.code } });
    if (!existing) await prisma.operationalReason.create({ data: r });
  }

  console.log('Master data seeded successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
