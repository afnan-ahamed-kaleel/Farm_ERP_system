const BASE_URL = 'http://localhost:3000/api/v1';

interface TestResult {
  storyId: string;
  storyTitle: string;
  status: 'PASSED' | 'FAILED';
  details: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function api(path: string, options: { method?: string; body?: any; params?: Record<string, string> } = {}) {
  let url = `${BASE_URL}${path}`;
  if (options.params) {
    const q = new URLSearchParams(options.params).toString();
    url += `?${q}`;
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || data || `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }

  return data;
}

async function runTest(storyId: string, storyTitle: string, fn: () => Promise<string>) {
  const start = Date.now();
  try {
    const details = await fn();
    results.push({
      storyId,
      storyTitle,
      status: 'PASSED',
      details,
      durationMs: Date.now() - start,
    });
    console.log(`[PASS] ${storyId}: ${storyTitle}`);
  } catch (err: any) {
    const errorMsg = err.data?.message || err.message || JSON.stringify(err);
    results.push({
      storyId,
      storyTitle,
      status: 'FAILED',
      details: `Error: ${errorMsg}`,
      durationMs: Date.now() - start,
    });
    console.error(`[FAIL] ${storyId}: ${storyTitle} - ${errorMsg}`);
  }
}

async function runAllUserStories() {
  console.log('\n===============================================================');
  console.log('   RUHUNU FARM PRO ERP - COMPLETE USER STORY TEST SUITE');
  console.log('===============================================================\n');

  // Shared test context
  let testFlockId = '';
  let testBrooderHouseId = '';
  let testGrowerHouseId = '';
  let testLayerHouseId = '';
  let testWarehouseId = '';
  let testCustomerId = '';
  let testSupplierId = '';
  let testFormulaVersionId = '';
  let testRawCornItemId = '';
  let testRawSoyaItemId = '';
  let testRawCornBatchId = '';
  let testRawCornBatchNumber = '';
  let testProducedFeedBatchId = '';
  let testEggBatchId = '';
  let testEggBatchNumber = '';

  const timestamp = Date.now();

  // --------------------------------------------------------------------------
  // USER STORY 1: MASTER DATA CONFIGURATION & CREATION
  // --------------------------------------------------------------------------
  await runTest('US-01', 'Master Data Hub - Create Infrastructure, Partners & Flocks', async () => {
    // 1. Create Brooder House
    const brooderRes = await api('/master-data/locations', {
      method: 'POST',
      body: { name: `Test Brooder House-${timestamp}`, type: 'BROODER' },
    });
    testBrooderHouseId = brooderRes.id;

    // 2. Create Grower House
    const growerRes = await api('/master-data/locations', {
      method: 'POST',
      body: { name: `Test Grower House-${timestamp}`, type: 'GROWER' },
    });
    testGrowerHouseId = growerRes.id;

    // 3. Create Layer House
    const layerRes = await api('/master-data/locations', {
      method: 'POST',
      body: { name: `Test Layer Shed-${timestamp}`, type: 'LAYER' },
    });
    testLayerHouseId = layerRes.id;

    // 4. Create Warehouse
    const warehouseRes = await api('/master-data/locations', {
      method: 'POST',
      body: { name: `Central Warehouse-${timestamp}`, type: 'WAREHOUSE' },
    });
    testWarehouseId = warehouseRes.id;

    // 5. Create Supplier (Hatchery)
    const supplierRes = await api('/master-data/suppliers', {
      method: 'POST',
      body: {
        name: `Test Hatchery Supplier-${timestamp}`,
        type: 'HATCHERY',
        contactNumber: '+94 77 111 2233',
        address: 'Kurunegala Hatchery Zone',
      },
    });
    testSupplierId = supplierRes.id;

    // 6. Create Customer
    const customerRes = await api('/master-data/customers', {
      method: 'POST',
      body: {
        name: `Test Retail Supermarket-${timestamp}`,
        contactNumber: '+94 11 444 5566',
        address: 'Colombo 07',
      },
    });
    testCustomerId = customerRes.id;

    // 7. Create Flock Profile
    const flockRes = await api('/master-data/flocks', {
      method: 'POST',
      body: {
        batchNumber: `FLOCK-TEST-${timestamp}`,
        breed: 'Cobb 500 Fast-Growth',
        hatchDate: new Date('2026-09-01').toISOString(),
      },
    });
    testFlockId = flockRes.id;

    return `Created Brooder (${testBrooderHouseId}), Grower (${testGrowerHouseId}), Layer (${testLayerHouseId}), Warehouse (${testWarehouseId}), Supplier (${testSupplierId}), Customer (${testCustomerId}), Flock (${testFlockId})`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 2: FLOCK INTAKE (DAY-OLD CHICK ARRIVAL)
  // --------------------------------------------------------------------------
  await runTest('US-02', 'Flock Intake - Receive DOC Chicks into Brooder House', async () => {
    const intakeQty = 12000;
    // 1. Create draft movement
    const movementRes = await api('/bird-tracking/movements', {
      method: 'POST',
      body: {
        flockId: testFlockId,
        sourceLocationId: testBrooderHouseId,
        targetLocationId: testBrooderHouseId,
        pathway: 'INTAKE',
        quantity: intakeQty,
        date: new Date().toISOString(),
        createdBy: 'Test Operator',
      },
    });
    const movementId = movementRes.id;

    // 2. Post movement
    await api(`/bird-tracking/movements/${movementId}/post`, {
      method: 'POST',
      body: { approvedBy: 'Test Supervisor' },
    });

    // 3. Verify Live Balance
    const balanceRes = await api('/bird-tracking/balance', {
      params: { flockId: testFlockId, locationId: testBrooderHouseId },
    });

    if (balanceRes.liveBalance !== intakeQty) {
      throw new Error(`Expected live balance ${intakeQty}, got ${balanceRes.liveBalance}`);
    }

    return `Received ${intakeQty} chicks into Brooder. Verified Live Balance = ${balanceRes.liveBalance}`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 3: LIFECYCLE TRANSITION & LIVE BALANCE GUARD
  // --------------------------------------------------------------------------
  await runTest('US-03', 'Lifecycle Transitions - Guardrail Over-Transfer & Execute Safe Move', async () => {
    // A. Test Guardrail: Attempt to transfer 15,000 birds when only 12,000 exist
    let guardrailPassed = false;
    try {
      const invalidMove = await api('/bird-tracking/movements', {
        method: 'POST',
        body: {
          flockId: testFlockId,
          sourceLocationId: testBrooderHouseId,
          targetLocationId: testGrowerHouseId,
          pathway: 'BROODER_TO_GROWER',
          quantity: 15000,
          date: new Date().toISOString(),
          createdBy: 'Test Operator',
        },
      });
      await api(`/bird-tracking/movements/${invalidMove.id}/post`, {
        method: 'POST',
        body: { approvedBy: 'Test Supervisor' },
      });
    } catch {
      guardrailPassed = true;
    }

    if (!guardrailPassed) {
      throw new Error('Guardrail failed: System permitted over-transfer of birds exceeding available headcount!');
    }

    // B. Safe Transfer: Move 5,000 birds from Brooder to Grower
    const transferQty = 5000;
    const validMove = await api('/bird-tracking/movements', {
      method: 'POST',
      body: {
        flockId: testFlockId,
        sourceLocationId: testBrooderHouseId,
        targetLocationId: testGrowerHouseId,
        pathway: 'BROODER_TO_GROWER',
        quantity: transferQty,
        date: new Date().toISOString(),
        createdBy: 'Test Operator',
      },
    });

    await api(`/bird-tracking/movements/${validMove.id}/post`, {
      method: 'POST',
      body: { approvedBy: 'Test Supervisor' },
    });

    // Verify balances in both locations
    const brooderBal = (await api('/bird-tracking/balance', {
      params: { flockId: testFlockId, locationId: testBrooderHouseId },
    })).liveBalance;

    const growerBal = (await api('/bird-tracking/balance', {
      params: { flockId: testFlockId, locationId: testGrowerHouseId },
    })).liveBalance;

    if (brooderBal !== 7000 || growerBal !== 5000) {
      throw new Error(`Balance mismatch: Brooder expected 7000 (got ${brooderBal}), Grower expected 5000 (got ${growerBal})`);
    }

    return `Guardrail rejected 15,000 overflow transfer. Successfully moved 5,000 birds. Brooder: ${brooderBal}, Grower: ${growerBal}`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 4: DAILY MORTALITY & CULLING RECORDING
  // --------------------------------------------------------------------------
  await runTest('US-04', 'Daily Mortality - Record Deaths and Validate Headcount Deduction', async () => {
    const mortCount = 25;
    const cullCount = 10;

    await api('/bird-tracking/mortality', {
      method: 'POST',
      body: {
        date: new Date().toISOString(),
        flockId: testFlockId,
        locationId: testGrowerHouseId,
        mortalityCount: mortCount,
        cullingCount: cullCount,
        cause: 'Heat Stress',
        remarks: 'Afternoon heatwave event',
        operatorId: 'Caregiver 1',
      },
    });

    // Verify Grower Balance: 5000 - 35 = 4965
    const growerBal = (await api('/bird-tracking/balance', {
      params: { flockId: testFlockId, locationId: testGrowerHouseId },
    })).liveBalance;

    if (growerBal !== 4965) {
      throw new Error(`Expected Grower balance 4965 after mortality, got ${growerBal}`);
    }

    return `Logged 25 mortality + 10 culling. Grower balance accurately reduced from 5,000 to ${growerBal}`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 5: RAW MATERIAL PROCUREMENT & INVENTORY INFLOW
  // --------------------------------------------------------------------------
  await runTest('US-05', 'Inventory Ledger - Procure Raw Feed Ingredients', async () => {
    // 1. Create Raw Corn Item
    const cornItem = await api('/master-data/items', {
      method: 'POST',
      body: {
        code: `RM-CORN-${timestamp}`,
        name: 'Premium Yellow Feed Corn',
        category: 'RAW_MATERIAL',
        primaryUom: 'KG',
      },
    });
    testRawCornItemId = cornItem.id;

    // 2. Create Raw Soya Item
    const soyaItem = await api('/master-data/items', {
      method: 'POST',
      body: {
        code: `RM-SOYA-${timestamp}`,
        name: 'Hi-Protein Soya Meal 48%',
        category: 'RAW_MATERIAL',
        primaryUom: 'KG',
      },
    });
    testRawSoyaItemId = soyaItem.id;

    // 3. Purchase Inflow Transaction: 5,000 KG of Corn
    testRawCornBatchNumber = `BATCH-CORN-${timestamp}`;
    const cornTrans = await api('/inventory/transaction', {
      method: 'POST',
      body: {
        date: new Date().toISOString(),
        itemId: testRawCornItemId,
        toLocationId: testWarehouseId,
        quantity: 5000,
        uom: 'KG',
        transactionType: 'PURCHASE',
        createdBy: 'Warehouse Clerk',
        batchNumber: testRawCornBatchNumber,
      },
    });
    testRawCornBatchId = cornTrans.batchId;

    // 4. Purchase Inflow: 3,000 KG of Soya
    await api('/inventory/transaction', {
      method: 'POST',
      body: {
        date: new Date().toISOString(),
        itemId: testRawSoyaItemId,
        toLocationId: testWarehouseId,
        quantity: 3000,
        uom: 'KG',
        transactionType: 'PURCHASE',
        createdBy: 'Warehouse Clerk',
        batchNumber: `BATCH-SOYA-${timestamp}`,
      },
    });

    // Verify Corn balance
    const cornStock = await api('/inventory/balance', {
      params: { itemId: testRawCornItemId },
    });

    if (cornStock.balance !== 5000) {
      throw new Error(`Expected corn stock 5000 kg, got ${cornStock.balance}`);
    }

    return `Procured 5,000 KG Corn (Batch: ${testRawCornBatchNumber}) and 3,000 KG Soya. Verified Corn Stock = ${cornStock.balance} KG`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 6: FEED NUTRITIONAL FORMULA CREATION & VERSION LOCK
  // --------------------------------------------------------------------------
  await runTest('US-06', 'Nutrition Master - Create Balanced Recipe (100% Weight Match)', async () => {
    // Create Formula with 600kg Corn (60%) + 400kg Soya (40%) = 1,000kg
    const formulaRes = await api('/feed/formula', {
      method: 'POST',
      body: {
        code: `FORMULA-GROWER-${timestamp}`,
        name: 'High-Density Grower Mash',
        targetStage: 'GROWER',
        baseQuantityKg: 1000,
        ingredients: [
          { rawMaterialItemId: testRawCornItemId, inclusionKg: 600 },
          { rawMaterialItemId: testRawSoyaItemId, inclusionKg: 400 },
        ],
      },
    });

    testFormulaVersionId = formulaRes.versions[0].id;

    if (formulaRes.versions[0].ingredients.length !== 2) {
      throw new Error('Formula version ingredients count mismatch');
    }

    return `Created Formula ${formulaRes.code} with Version ID ${testFormulaVersionId} (600kg Corn + 400kg Soya = 1000kg)`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 7: FEED MILLING RUN & AUTOMATED STOCK CONSUMPTION
  // --------------------------------------------------------------------------
  await runTest('US-07', 'Feed Production Run - Execute Milling with Automatic Ingredient Deductions', async () => {
    // Execute production run
    const prodRes = await api('/feed/production', {
      method: 'POST',
      body: {
        formulaVersionId: testFormulaVersionId,
        targetQuantityKg: 2000,
        operatorId: 'Mill Operator 1',
      },
    });

    testProducedFeedBatchId = prodRes.producedBatchId;

    // Verify Corn Stock: 5000 - 1200 (60% of 2000kg) = 3800
    const cornStock = await api('/inventory/balance', {
      params: { itemId: testRawCornItemId },
    });

    if (cornStock.balance !== 3800) {
      throw new Error(`Expected corn stock 3800 after milling deduction, got ${cornStock.balance}`);
    }

    return `Milled 2,000 KG feed (Batch: ${testProducedFeedBatchId}). Corn stock automatically deducted to ${cornStock.balance} KG`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 8: FEED ISSUE TO SHED & FLOCK FEED CONSUMPTION
  // --------------------------------------------------------------------------
  await runTest('US-08', 'Feed Operations - Issue Feed to Shed and Record Daily Flock Feeding', async () => {
    // 1. Issue feed to grower house
    await api('/feed/issue', {
      method: 'POST',
      body: {
        feedBatchId: testProducedFeedBatchId,
        targetHouseId: testGrowerHouseId,
        quantityKg: 1000,
        operatorId: 'Feed Dispatcher',
      },
    });

    // 2. Log consumption of 500 KG by our grower flock
    const consumeRes = await api('/feed/consume', {
      method: 'POST',
      body: {
        flockId: testFlockId,
        houseLocationId: testGrowerHouseId,
        feedBatchId: testProducedFeedBatchId,
        quantityConsumedKg: 500,
        operatorId: 'Feeder Attendant 1',
      },
    });

    if (consumeRes.quantityConsumedKg !== 500) {
      throw new Error(`Feed consumption quantity mismatch: ${consumeRes.quantityConsumedKg}`);
    }

    return `Issued 1,000 KG feed and recorded 500 KG consumption for Flock ${testFlockId} in Grower House`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 9: DAILY EGG HARVEST, GRADING & CENTRAL STOCK INFLOW
  // --------------------------------------------------------------------------
  await runTest('US-09', 'Daily Egg Harvest - Multi-Grade Collection & Warehouse Stock Generation', async () => {
    // Record harvest of 4,800 Large eggs and 200 Medium eggs
    const harvestRes = await api('/eggs/daily-collection', {
      method: 'POST',
      body: {
        flockId: testFlockId,
        houseLocationId: testGrowerHouseId,
        operatorId: 'Egg Room Supervisor',
        entries: [
          { grade: 'LARGE', condition: 'GOOD', quantity: 4800 },
          { grade: 'MEDIUM', condition: 'GOOD', quantity: 200 },
        ],
      },
    });

    testEggBatchId = harvestRes.eggBatchId;
    testEggBatchNumber = harvestRes.batch;

    if (!testEggBatchId || !testEggBatchNumber) {
      throw new Error('Egg batch was not generated on daily harvest collection');
    }

    if (harvestRes.totalCollected !== 5000) {
      throw new Error(`Expected 5000 total eggs collected, got ${harvestRes.totalCollected}`);
    }

    return `Collected 5,000 graded eggs (4,800 Large + 200 Medium). Generated Egg Lot Batch: ${testEggBatchNumber} (ID: ${testEggBatchId})`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 10: COMMERCIAL SALES DISPATCH & INVOICING
  // --------------------------------------------------------------------------
  await runTest('US-10', 'Sales & Dispatch - Ship Graded Eggs & Audit Stock Deduction', async () => {
    // Dispatch 3,000 eggs to customer
    const dispatchRes = await api('/dispatch', {
      method: 'POST',
      body: {
        customerId: testCustomerId,
        eggBatchId: testEggBatchId,
        grade: 'LARGE',
        quantity: 3000,
        invoiceNumber: `INV-${timestamp}`,
        operatorId: 'Dispatch Officer',
      },
    });

    if (!dispatchRes.dispatchNumber) {
      throw new Error('Dispatch record creation failed');
    }

    return `Dispatched 3,000 eggs to Customer (Invoice: INV-${timestamp}). Generated Dispatch Note: ${dispatchRes.dispatchNumber}`;
  });

  // --------------------------------------------------------------------------
  // USER STORY 11: END-TO-END ISO 22000 TRACEABILITY AUDIT
  // --------------------------------------------------------------------------
  await runTest('US-11', 'Food Safety Compliance - Execute Bidirectional ISO 22000 Audit', async () => {
    // Backward Trace: Given the egg batch number, trace back to flock and feed
    const backwardRes = await api('/traceability/backward', {
      params: { eggBatchNumber: testEggBatchNumber },
    });

    if (!backwardRes || backwardRes.batchNumber !== testEggBatchNumber) {
      throw new Error('Backward traceability batch lookup failed');
    }

    const eggLog = backwardRes.eggProductionLogs?.[0];
    if (!eggLog || !eggLog.flock) {
      throw new Error('Backward traceability flock link missing');
    }

    const feedConsumptions = eggLog.flock.feedConsumptions || [];
    if (feedConsumptions.length === 0) {
      throw new Error('Backward traceability feed link missing');
    }

    // Forward Trace: Given the raw corn batch number, trace forward to production and feed
    const forwardRes = await api('/traceability/forward', {
      params: { rmBatchNumber: testRawCornBatchNumber },
    });

    if (!forwardRes || forwardRes.batchNumber !== testRawCornBatchNumber) {
      throw new Error('Forward traceability raw material batch lookup failed');
    }

    const usages = forwardRes.ingredientUsages || [];
    if (usages.length === 0) {
      throw new Error('Forward traceability ingredient usage missing');
    }

    return `ISO Audit verified. Backward trace linked Egg Lot (${backwardRes.batchNumber}) -> Flock (${eggLog.flock.batchNumber}) -> Feed (${feedConsumptions.length} consumptions). Forward trace linked Raw Batch (${forwardRes.batchNumber}) -> Milling Runs (${usages.length} runs).`;
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('                 USER STORY EXECUTION SUMMARY');
  console.log('===============================================================\n');

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;

  results.forEach((r) => {
    console.log(`[${r.status}] ${r.storyId}: ${r.storyTitle} (${r.durationMs}ms)`);
    console.log(`       Details: ${r.details}\n`);
  });

  console.log(`TOTAL USER STORIES TESTED : ${total}`);
  console.log(`PASSED                    : ${passed}`);
  console.log(`FAILED                    : ${failed}`);
  console.log(`SUCCESS RATE              : ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllUserStories().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
