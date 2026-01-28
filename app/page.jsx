'use client';
import React, { useState, useMemo } from 'react';

const POSFinancialModel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const correctPassword = 'owner2026';
  
  const [activeTab, setActiveTab] = useState('summary');
  const [viewMode, setViewMode] = useState('combined');
  
  const [avgGPV, setAvgGPV] = useState(25000);
  const [posRetention, setPosRetention] = useState(85);
  const [posSubFee, setPosSubFee] = useState(250);
  const [txnFeeRate, setTxnFeeRate] = useState(2.7);
  const [fixedTxnFee, setFixedTxnFee] = useState(0.05);
  const [passthroughRate, setPassthroughRate] = useState(2.0);
  
  const activationScenarios = {
    eoyRamp: [24, 29, 34, 38, 43, 48, 53, 58, 62, 67, 72, 72],
    balanced: [35, 40, 45, 50, 50, 50, 55, 55, 55, 55, 55, 55],
    accelerated: [40, 48, 57, 63, 72, 80, 88, 97, 103, 112, 120, 120],
  };
  const [activationScenario, setActivationScenario] = useState('eoyRamp');
  const [posActivations, setPosActivations] = useState(activationScenarios.eoyRamp);
  
  const startingPOSLocs = 27;
  
  const [hardwareCost] = useState(2300);
  const [hardwareDiscount, setHardwareDiscount] = useState(0);
  const [avgTerminals, setAvgTerminals] = useState(1.5);
  
  const calcSoftwareCOGS = (gpv) => {
    const baseGPV = 7000;
    const gpvRatio = gpv / baseGPV;
    const twilio = 13 * gpvRatio * 0.25;
    const gcpAws = 14 * gpvRatio * 0.50;
    const mongo = 3 * gpvRatio * 0.50;
    const esper = 3 * gpvRatio * 0.50;
    const cloudflare = 2 * gpvRatio * 0.50;
    const mailgun = 1 * gpvRatio * 0.25;
    const gaAlloc = 7;
    return twilio + gcpAws + mongo + esper + cloudflare + mailgun + gaAlloc;
  };
  
  const csmAnnualSalary = 70000;
  const benefitsMultiplier = 1.17;
  const csmMonthlyCost = (csmAnnualSalary * benefitsMultiplier) / 12;
  const csmTargetPerLoc = 60;
  const [endingCSMs, setEndingCSMs] = useState(5);
  
  const csAnnualSalary = 20000;
  const csMonthlyCost = (csAnnualSalary * benefitsMultiplier) / 12;
  const csTargetPerLoc = 20;
  const [endingCS, setEndingCS] = useState(6);
  
  const [launchCostPerActivation, setLaunchCostPerActivation] = useState(849);
  const [totalAnnualSalesCost, setTotalAnnualSalesCost] = useState(700000);
  const [salesSpiffPerActivation, setSalesSpiffPerActivation] = useState(100);
  
  const coreMonthlyChurnRates = [0.030012, 0.032012, 0.027720, 0.027581, 0.027443, 0.027305, 0.027168, 0.027031, 0.026896, 0.026761, 0.026627, 0.026494];
  const coreOnboardingCosts = [650339, 663682, 684643, 717259, 762918, 769584, 795290, 820748, 827966, 840412, 859365, 876037];
  const coreActivations = [671, 730, 754, 854, 879, 902, 934, 937, 983, 1010, 1070, 1079];
  const coreNewCW = [879, 851, 976, 1015, 1038, 1073, 1078, 1136, 1165, 1227, 1241, 1241];
  const coreEMRR = [600783, 581280, 669905, 692953, 711876, 737099, 740223, 780028, 803909, 849906, 856989, 856989];
  const coreHWInvesting = [864619, 1143100, 942200, 269773, 286573, 45500, 212100, 102473, 45500, 364973, 364973, 641473];
  const posEPDCosts = [369227, 410293, 490560, 513893, 534427, 616560, 639893, 639893, 660427, 660427, 660427, 660427];
  const posLogisticsCosts = [0, 0, 0, 0, 0, 6533, 6533, 6533, 6533, 6533, 6533, 17733];
  const posCPQCosts = [133333, 133333, 143533, 110200, 110200, 110200, 76867, 76867, 76867, 43533, 43533, 43533];
  const posManagerCosts = [30000, 30000, 30000, 30000, 30000, 30000, 30000, 45000, 45000, 45000, 45000, 45000];

  const posMonthlyChurn = (1 - Math.pow(posRetention / 100, 1/12));
  
  const posLiveLocs = useMemo(() => {
    const locs = [];
    let currentLocs = startingPOSLocs;
    for (let i = 0; i < 12; i++) {
      const churned = Math.round(currentLocs * posMonthlyChurn);
      currentLocs = currentLocs - churned + posActivations[i];
      locs.push(currentLocs);
    }
    return locs;
  }, [posActivations, posMonthlyChurn]);
  
  const posCOGSRamps = useMemo(() => {
    const eoyLocs = posLiveLocs[11];
    const endingCSMCost = endingCSMs * csmMonthlyCost;
    const csmCosts = posLiveLocs.map((locs) => Math.round((locs / eoyLocs) * endingCSMCost));
    const endingCSCost = endingCS * csMonthlyCost;
    const csCosts = posLiveLocs.map((locs) => Math.round((locs / eoyLocs) * endingCSCost));
    const launchCosts = posActivations.map(acts => Math.round(acts * launchCostPerActivation));
    const totalActs = posActivations.reduce((a, b) => a + b, 0);
    const salesCosts = posActivations.map(acts => {
      const baseSales = Math.round((acts / totalActs) * totalAnnualSalesCost);
      const spiff = acts * salesSpiffPerActivation;
      return baseSales + spiff;
    });
    return { csmCosts, csCosts, launchCosts, salesCosts };
  }, [posLiveLocs, posActivations, endingCSMs, endingCS, launchCostPerActivation, totalAnnualSalesCost, salesSpiffPerActivation]);

  const basePlan = [
    { locations: 7747, subRev: 3505375, txnRev: 2333693, discounts: -256900, netRev: 5582168, cogs: 2093623, salesDept: 1772587, mktgDept: 2287607, mediaDept: 96742, epdDept: 1885166, gaDept: 2151035, gpv: 59609016 },
    { locations: 8228, subRev: 3650867, txnRev: 2287935, discounts: -260431, netRev: 5678371, cogs: 2261090, salesDept: 1889386, mktgDept: 2191168, mediaDept: 96797, epdDept: 2056463, gaDept: 2183577, gpv: 57922415 },
    { locations: 8754, subRev: 3880926, txnRev: 2787296, discounts: -294602, netRev: 6373620, cogs: 2384002, salesDept: 2008301, mktgDept: 2295768, mediaDept: 97665, epdDept: 2159925, gaDept: 2243928, gpv: 69944686 },
    { locations: 9366, subRev: 4097532, txnRev: 2846088, discounts: -306206, netRev: 6637415, cogs: 2518394, salesDept: 2082887, mktgDept: 2522408, mediaDept: 97933, epdDept: 2260787, gaDept: 2355118, gpv: 70798219 },
    { locations: 9989, subRev: 4310879, txnRev: 3251710, discounts: -335021, netRev: 7227568, cogs: 2653189, salesDept: 2200251, mktgDept: 2535354, mediaDept: 98630, epdDept: 2405572, gaDept: 2370053, gpv: 80190145 },
    { locations: 10618, subRev: 4540742, txnRev: 3322852, discounts: -347772, netRev: 7515821, cogs: 2739323, salesDept: 2242993, mktgDept: 2554014, mediaDept: 98914, epdDept: 2491495, gaDept: 2465393, gpv: 81243316 },
    { locations: 11263, subRev: 4778975, txnRev: 3539543, discounts: -368136, netRev: 7950381, cogs: 2853345, salesDept: 2318938, mktgDept: 2750047, mediaDept: 99383, epdDept: 2530000, gaDept: 2448875, gpv: 85807095 },
    { locations: 11896, subRev: 5043862, txnRev: 3969465, discounts: -400228, netRev: 8613099, cogs: 2994324, salesDept: 2433021, mktgDept: 2782201, mediaDept: 102036, epdDept: 2794537, gaDept: 2567982, gpv: 95419823 },
    { locations: 12559, subRev: 5309920, txnRev: 3946548, discounts: -409724, netRev: 8846743, cogs: 3079341, salesDept: 2424395, mktgDept: 2788735, mediaDept: 101590, epdDept: 2971660, gaDept: 2593922, gpv: 94077423 },
    { locations: 13233, subRev: 5593872, txnRev: 4524571, discounts: -449983, netRev: 9668460, cogs: 3175760, salesDept: 2440019, mktgDept: 2781889, mediaDept: 119319, epdDept: 2971417, gaDept: 2627369, gpv: 106963864 },
    { locations: 13951, subRev: 5870049, txnRev: 4536513, discounts: -461628, netRev: 9944934, cogs: 3299568, salesDept: 2466565, mktgDept: 2781825, mediaDept: 119543, epdDept: 2974888, gaDept: 2703932, gpv: 106366063 },
    { locations: 14661, subRev: 6138585, txnRev: 5029201, discounts: -497003, netRev: 10670783, cogs: 3415260, salesDept: 2481694, mktgDept: 2782688, mediaDept: 120320, epdDept: 3023904, gaDept: 2748807, gpv: 116958168 }
  ];

  const calculatePOSRevenue = (gpv) => {
    const avgTxnSize = 25;
    const txnCount = gpv / avgTxnSize;
    const passthroughRevenue = gpv * (passthroughRate / 100);
    const effectiveTxnRate = Math.max(0, txnFeeRate - passthroughRate);
    const txnRevenue = (gpv * effectiveTxnRate / 100) + (txnCount * fixedTxnFee);
    return { subRevenue: posSubFee, txnRevenue, passthroughRevenue };
  };

  const financialModel = useMemo(() => {
    const posRevMetrics = calculatePOSRevenue(avgGPV);
    const posMonthlyChurnPct = (1 - Math.pow(posRetention / 100, 1/12)) * 100;
    const hardwareCostPerNewLoc = hardwareCost * avgTerminals * (hardwareDiscount / 100);
    
    const coreL3MLookback = {
      arpa: [706.96, 728.68],
      gm: [0.7565, 0.7555],
      churn: [0.0279, 0.0295],
      locs: [6852, 7295]
    };
    
    const cacL3MLookback = {
      sales: [1502196, 1614411],
      mktg: [1759414, 1975543],
      media: [0, 0],
      onboarding: [573144, 733421],
      activations: [591, 645]
    };
    
    const rawMonths = basePlan.map((month, idx) => {
      const posLocs = posLiveLocs[idx];
      const coreLocs = month.locations;
      const totalLocs = coreLocs;
      const coreMonthlyChurn = coreMonthlyChurnRates[idx] * 100;
      const blendedChurn = totalLocs > 0 ? (((coreLocs - posLocs) * coreMonthlyChurn) + (posLocs * posMonthlyChurnPct)) / coreLocs : 0;
      const newPOSLocs = posActivations[idx];
      const newCoreLocs = idx === 0 ? 0 : Math.max(0, coreLocs - basePlan[idx-1].locations);
      const newLocs = newCoreLocs;
      
      const coreGPV = month.gpv;
      const posGPV = posLocs * avgGPV;
      const totalGPV = coreGPV + posGPV;
      
      const coreSubRev = month.subRev;
      const coreTxnRev = month.txnRev;
      const coreNetRev = month.netRev;
      const posSubRev = posLocs * posRevMetrics.subRevenue;
      const posTxnRev = posLocs * posRevMetrics.txnRevenue;
      const posPassthroughRev = posLocs * posRevMetrics.passthroughRevenue;
      const posNetRev = posSubRev + posTxnRev + posPassthroughRev;
      const totalSubRev = coreSubRev + posSubRev;
      const totalTxnRev = coreTxnRev + posTxnRev;
      const totalNetRev = coreNetRev + posNetRev;
      
      const coreARPA = coreNetRev / coreLocs;
      const posARPA = posRevMetrics.subRevenue + posRevMetrics.txnRevenue;
      const totalARPA = (coreNetRev + posSubRev + posTxnRev) / totalLocs;
      
      const coreARR = (coreSubRev + coreTxnRev) * 12;
      const posARR = (posSubRev + posTxnRev) * 12;
      const totalARR = coreARR + posARR;
      
      const coreCOGS = month.cogs - coreOnboardingCosts[idx];
      const posSoftwareCOGSAmt = posLocs * calcSoftwareCOGS(avgGPV);
      const posCSCOGS = posCOGSRamps.csCosts[idx] + posCOGSRamps.csmCosts[idx];
      const posPaymentsCOGS = posPassthroughRev;
      const posCOGS = posSoftwareCOGSAmt + posCSCOGS + posPaymentsCOGS;
      const totalCOGS = coreCOGS + posCOGS;
      
      const coreGrossProfit = coreNetRev - coreCOGS;
      const posGrossProfit = posNetRev - posCOGS;
      const totalGrossProfit = totalNetRev - totalCOGS;
      
      const coreGrossMargin = (coreGrossProfit / coreNetRev) * 100;
      const posRevExPass = posSubRev + posTxnRev;
      const posGrossMargin = posRevExPass > 0 ? (posGrossProfit / posRevExPass) * 100 : 0;
      const totalGrossMargin = (coreNetRev + posRevExPass) > 0 ? ((coreGrossProfit + posGrossProfit) / (coreNetRev + posRevExPass)) * 100 : 0;
      
      const coreSales = month.salesDept;
      const posSales = posCOGSRamps.salesCosts[idx];
      const totalSales = coreSales + posSales;
      const coreMktg = month.mktgDept;
      const coreMedia = month.mediaDept;
      const coreOnboarding = coreOnboardingCosts[idx];
      const posHardware = newPOSLocs * hardwareCostPerNewLoc;
      const posLaunchCost = posCOGSRamps.launchCosts[idx];
      const posOnboarding = posLaunchCost + posHardware;
      const totalOnboarding = coreOnboarding + posOnboarding;
      const coreEPD = month.epdDept - posEPDCosts[idx];
      const posEPD = posEPDCosts[idx];
      const totalEPD = coreEPD + posEPD;
      const coreGA = month.gaDept;
      const posGA = posLogisticsCosts[idx] + posCPQCosts[idx] + posManagerCosts[idx];
      const totalGA = coreGA + posGA;
      const coreOpex = coreSales + coreMktg + coreMedia + coreOnboarding + coreEPD + coreGA;
      const posOpex = posSales + posOnboarding + posEPD + posGA;
      const totalOpex = coreOpex + posOpex;
      const coreOpIncome = coreGrossProfit - coreOpex;
      const posOpIncome = posGrossProfit - posOpex;
      const totalOpIncome = totalGrossProfit - totalOpex;
      const coreOpMargin = (coreOpIncome / coreNetRev) * 100;
      const posOpMargin = posRevExPass > 0 ? (posOpIncome / posRevExPass) * 100 : 0;
      const totalOpMargin = (totalOpIncome / totalNetRev) * 100;
      
      const coreSMO = coreSales + coreMktg + coreMedia + coreOnboarding;
      const posSMO = posSales + posOnboarding;
      
      // POS penetration for expected GP calculation
      const posPenetration = totalLocs > 0 ? posLocs / totalLocs : 0;
      
      // Cash burn: Operating loss + Investing (Core HW only, POS HW already in CAC)
      const coreHW = coreHWInvesting[idx];
      const coreCashBurn = coreOpIncome - coreHW; // OpIncome is negative, HW is positive cost
      const posCashBurn = posOpIncome; // POS HW already in OpEx via CAC
      const totalCashBurn = totalOpIncome - coreHW;

      return {
        idx, posLocs, coreLocs, totalLocs, coreMonthlyChurn, posMonthlyChurnPct, blendedChurn,
        newPOSLocs, newLocs, coreGPV, posGPV, totalGPV,
        coreSubRev, coreTxnRev, coreNetRev, posSubRev, posTxnRev, posPassthroughRev, posNetRev,
        totalSubRev, totalTxnRev, totalNetRev, coreARPA, posARPA, totalARPA, coreARR, posARR, totalARR,
        coreCOGS, posSoftwareCOGSAmt, posCSCOGS, posPaymentsCOGS, posCOGS, totalCOGS,
        coreGrossProfit, posGrossProfit, totalGrossProfit, coreGrossMargin, posGrossMargin, totalGrossMargin,
        coreSales, posSales, totalSales, coreMktg, coreMedia,
        coreOnboarding, posLaunchCost, posOnboarding, totalOnboarding,
        coreEPD, posEPD, totalEPD, coreGA, posGA, totalGA,
        coreOpex, posOpex, totalOpex, coreOpIncome, posOpIncome, totalOpIncome,
        coreOpMargin, posOpMargin, totalOpMargin, coreSMO, posSMO, posPenetration,
        coreHW, coreCashBurn, posCashBurn, totalCashBurn
      };
    });
    
    return rawMonths.map((r, idx) => {
      const coreArpaArr = idx === 0 ? [coreL3MLookback.arpa[0], coreL3MLookback.arpa[1], r.coreARPA] :
                          idx === 1 ? [coreL3MLookback.arpa[1], rawMonths[0].coreARPA, r.coreARPA] :
                          [rawMonths[idx-2].coreARPA, rawMonths[idx-1].coreARPA, r.coreARPA];
      const coreGmArr = idx === 0 ? [coreL3MLookback.gm[0], coreL3MLookback.gm[1], r.coreGrossMargin/100] :
                        idx === 1 ? [coreL3MLookback.gm[1], rawMonths[0].coreGrossMargin/100, r.coreGrossMargin/100] :
                        [rawMonths[idx-2].coreGrossMargin/100, rawMonths[idx-1].coreGrossMargin/100, r.coreGrossMargin/100];
      const coreChurnArr = idx === 0 ? [coreL3MLookback.churn[0], coreL3MLookback.churn[1], r.coreMonthlyChurn/100] :
                           idx === 1 ? [coreL3MLookback.churn[1], rawMonths[0].coreMonthlyChurn/100, r.coreMonthlyChurn/100] :
                           [rawMonths[idx-2].coreMonthlyChurn/100, rawMonths[idx-1].coreMonthlyChurn/100, r.coreMonthlyChurn/100];
      const coreLocsArr = idx === 0 ? [coreL3MLookback.locs[0], coreL3MLookback.locs[1], r.coreLocs] :
                          idx === 1 ? [coreL3MLookback.locs[1], rawMonths[0].coreLocs, r.coreLocs] :
                          [rawMonths[idx-2].coreLocs, rawMonths[idx-1].coreLocs, r.coreLocs];
      
      const coreAvgARPA = (coreArpaArr[0] + coreArpaArr[1] + coreArpaArr[2]) / 3;
      const coreAvgGM = (coreGmArr[0] + coreGmArr[1] + coreGmArr[2]) / 3;
      const coreWtdChurn = (coreChurnArr[0]*coreLocsArr[0] + coreChurnArr[1]*coreLocsArr[1] + coreChurnArr[2]*coreLocsArr[2]) /
                           (coreLocsArr[0] + coreLocsArr[1] + coreLocsArr[2]);
      const coreLTV = (coreAvgARPA * coreAvgGM) / coreWtdChurn;
      
      let posLTV;
      if (idx === 0) {
        posLTV = r.posMonthlyChurnPct > 0 ? (r.posARPA * (r.posGrossMargin / 100)) / (r.posMonthlyChurnPct / 100) : 0;
      } else if (idx === 1) {
        const posAvgARPA = (rawMonths[0].posARPA + r.posARPA) / 2;
        const posAvgGM = (rawMonths[0].posGrossMargin/100 + r.posGrossMargin/100) / 2;
        const posLocsSum = rawMonths[0].posLocs + r.posLocs;
        const posWtdChurn = posLocsSum > 0 ? 
          (rawMonths[0].posLocs * rawMonths[0].posMonthlyChurnPct/100 + r.posLocs * r.posMonthlyChurnPct/100) / posLocsSum : r.posMonthlyChurnPct/100;
        posLTV = posWtdChurn > 0 ? (posAvgARPA * posAvgGM) / posWtdChurn : 0;
      } else {
        const posAvgARPA = (rawMonths[idx-2].posARPA + rawMonths[idx-1].posARPA + r.posARPA) / 3;
        const posAvgGM = (rawMonths[idx-2].posGrossMargin/100 + rawMonths[idx-1].posGrossMargin/100 + r.posGrossMargin/100) / 3;
        const posLocsSum = rawMonths[idx-2].posLocs + rawMonths[idx-1].posLocs + r.posLocs;
        const posWtdChurn = posLocsSum > 0 ?
          (rawMonths[idx-2].posLocs * rawMonths[idx-2].posMonthlyChurnPct/100 + 
           rawMonths[idx-1].posLocs * rawMonths[idx-1].posMonthlyChurnPct/100 + 
           r.posLocs * r.posMonthlyChurnPct/100) / posLocsSum : r.posMonthlyChurnPct/100;
        posLTV = posWtdChurn > 0 ? (posAvgARPA * posAvgGM) / posWtdChurn : 0;
      }
      
      const coreOnlyLocs = r.coreLocs - r.posLocs;
      const totalLTV = r.coreLocs > 0 ? 
        (coreOnlyLocs * coreLTV + r.posLocs * (coreLTV + posLTV)) / r.coreLocs : coreLTV;
      
      const cacLookbackSMO = cacL3MLookback.sales.map((s, i) => 
        s + cacL3MLookback.mktg[i] + cacL3MLookback.media[i] + cacL3MLookback.onboarding[i]
      );
      const coreSMOArr = idx === 0 ? [cacLookbackSMO[0], cacLookbackSMO[1], r.coreSMO] :
                         idx === 1 ? [cacLookbackSMO[1], rawMonths[0].coreSMO, r.coreSMO] :
                         [rawMonths[idx-2].coreSMO, rawMonths[idx-1].coreSMO, r.coreSMO];
      const coreActsArr = idx === 0 ? [cacL3MLookback.activations[0], cacL3MLookback.activations[1], coreActivations[idx]] :
                          idx === 1 ? [cacL3MLookback.activations[1], coreActivations[0], coreActivations[idx]] :
                          [coreActivations[idx-2], coreActivations[idx-1], coreActivations[idx]];
      
      const l3mCoreSMO = coreSMOArr[0] + coreSMOArr[1] + coreSMOArr[2];
      const l3mActs = coreActsArr[0] + coreActsArr[1] + coreActsArr[2];
      const coreCAC = l3mActs > 0 ? l3mCoreSMO / l3mActs : 0;
      
      let posCAC;
      if (idx === 0) {
        posCAC = r.newPOSLocs > 0 ? r.posSMO / r.newPOSLocs : 0;
      } else if (idx === 1) {
        const posSMOSum = rawMonths[0].posSMO + r.posSMO;
        const posActsSum = rawMonths[0].newPOSLocs + r.newPOSLocs;
        posCAC = posActsSum > 0 ? posSMOSum / posActsSum : 0;
      } else {
        const posSMOSum = rawMonths[idx-2].posSMO + rawMonths[idx-1].posSMO + r.posSMO;
        const posActsSum = rawMonths[idx-2].newPOSLocs + rawMonths[idx-1].newPOSLocs + r.newPOSLocs;
        posCAC = posActsSum > 0 ? posSMOSum / posActsSum : 0;
      }
      
      let l3mPosSMO;
      if (idx === 0) {
        l3mPosSMO = r.posSMO;
      } else if (idx === 1) {
        l3mPosSMO = rawMonths[0].posSMO + r.posSMO;
      } else {
        l3mPosSMO = rawMonths[idx-2].posSMO + rawMonths[idx-1].posSMO + r.posSMO;
      }
      const totalSMO = l3mCoreSMO + l3mPosSMO;
      const totalCAC = l3mActs > 0 ? totalSMO / l3mActs : 0;
      
      const coreLTVCAC = coreCAC > 0 ? coreLTV / coreCAC : 0;
      const posLTVCAC = posCAC > 0 ? posLTV / posCAC : 0;
      const totalLTVCAC = totalCAC > 0 ? totalLTV / totalCAC : 0;
      
      // Payback calculations - use L3M ARPA and L3M Gross Margin
      const coreArpaL3M = coreArpaArr.reduce((a, b) => a + b, 0) / coreArpaArr.length;
      const coreGmL3M = coreGmArr.reduce((a, b) => a + b, 0) / coreGmArr.length;
      const coreGPPerCust = coreArpaL3M * coreGmL3M;
      
      const posArpaArr = idx === 0 ? [r.posARPA] :
                         idx === 1 ? [rawMonths[0].posARPA, r.posARPA] :
                         [rawMonths[idx-2].posARPA, rawMonths[idx-1].posARPA, r.posARPA];
      const posGmArr = idx === 0 ? [r.posGrossMargin/100] :
                       idx === 1 ? [rawMonths[0].posGrossMargin/100, r.posGrossMargin/100] :
                       [rawMonths[idx-2].posGrossMargin/100, rawMonths[idx-1].posGrossMargin/100, r.posGrossMargin/100];
      const posArpaL3M = posArpaArr.reduce((a, b) => a + b, 0) / posArpaArr.length;
      const posGmL3M = posGmArr.reduce((a, b) => a + b, 0) / posGmArr.length;
      const posGPPerCust = posArpaL3M * posGmL3M;
      
      const corePayback = coreGPPerCust > 0 ? coreCAC / coreGPPerCust : 0;
      const posPayback = posGPPerCust > 0 ? posCAC / posGPPerCust : 0;
      
      // Total Payback = Weighted average by L3M activations
      let l3mPosActs;
      if (idx === 0) {
        l3mPosActs = r.newPOSLocs;
      } else if (idx === 1) {
        l3mPosActs = rawMonths[0].newPOSLocs + r.newPOSLocs;
      } else {
        l3mPosActs = rawMonths[idx-2].newPOSLocs + rawMonths[idx-1].newPOSLocs + r.newPOSLocs;
      }
      const l3mTotalActs = l3mActs + l3mPosActs;
      const totalPayback = l3mTotalActs > 0 ? 
        (l3mActs * corePayback + l3mPosActs * posPayback) / l3mTotalActs : 0;

      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
        totalLocs: r.totalLocs, coreLocs: r.coreLocs, posLocs: r.posLocs, newLocs: r.newLocs, newPOSLocs: r.newPOSLocs,
        coreRetention: Math.pow(1 - r.coreMonthlyChurn/100, 12) * 100, 
        posRetention: Math.pow(1 - r.posMonthlyChurnPct/100, 12) * 100, 
        blendedRetention: Math.pow(1 - r.blendedChurn/100, 12) * 100,
        posPenetration: r.posPenetration * 100,
        coreGPV: r.coreGPV/1000, posGPV: r.posGPV/1000, totalGPV: r.totalGPV/1000,
        coreSubRev: r.coreSubRev/1000, posSubRev: r.posSubRev/1000, totalSubRev: r.totalSubRev/1000,
        coreTxnRev: r.coreTxnRev/1000, posTxnRev: r.posTxnRev/1000, totalTxnRev: r.totalTxnRev/1000,
        posPassthroughRev: r.posPassthroughRev/1000,
        coreNetRev: r.coreNetRev/1000, posNetRev: r.posNetRev/1000, totalNetRev: r.totalNetRev/1000,
        coreARPA: r.coreARPA, posARPA: r.posARPA, totalARPA: r.totalARPA,
        coreARR: r.coreARR/1000, posARR: r.posARR/1000, totalARR: r.totalARR/1000,
        coreCOGS: r.coreCOGS/1000, posCOGS: r.posCOGS/1000, totalCOGS: r.totalCOGS/1000,
        posSoftwareCOGS: r.posSoftwareCOGSAmt/1000, posCSCOGS: r.posCSCOGS/1000, posPaymentsCOGS: r.posPaymentsCOGS/1000,
        coreGrossProfit: r.coreGrossProfit/1000, posGrossProfit: r.posGrossProfit/1000, totalGrossProfit: r.totalGrossProfit/1000,
        coreGrossMargin: r.coreGrossMargin, posGrossMargin: r.posGrossMargin, totalGrossMargin: r.totalGrossMargin,
        coreSales: r.coreSales/1000, posSales: r.posSales/1000, totalSales: r.totalSales/1000,
        coreMktg: r.coreMktg/1000, coreMedia: r.coreMedia/1000,
        coreOnboarding: r.coreOnboarding/1000, posOnboarding: r.posOnboarding/1000, totalOnboarding: r.totalOnboarding/1000,
        coreEPD: r.coreEPD/1000, posEPD: r.posEPD/1000, totalEPD: r.totalEPD/1000,
        coreGA: r.coreGA/1000, posGA: r.posGA/1000, totalGA: r.totalGA/1000,
        coreOpex: r.coreOpex/1000, posOpex: r.posOpex/1000, totalOpex: r.totalOpex/1000,
        coreOpIncome: r.coreOpIncome/1000, posOpIncome: r.posOpIncome/1000, totalOpIncome: r.totalOpIncome/1000,
        coreOpMargin: r.coreOpMargin, posOpMargin: r.posOpMargin, totalOpMargin: r.totalOpMargin,
        coreHW: r.coreHW/1000, coreCashBurn: r.coreCashBurn/1000, posCashBurn: r.posCashBurn/1000, totalCashBurn: r.totalCashBurn/1000,
        coreLTV, posLTV, totalLTV,
        coreCAC, posCAC, totalCAC,
        coreLTVCAC, posLTVCAC, totalLTVCAC,
        corePayback, posPayback, totalPayback,
        l3mCoreActs: l3mActs, l3mPosActs, l3mTotalActs,
        posActivationsMonth: r.newPOSLocs,
        coreNewCW: coreNewCW[idx],
        coreLaunched: coreActivations[idx],
        coreEMRR: coreEMRR[idx],
        posNewCW: r.newPOSLocs,
        posLaunched: r.newPOSLocs,
        posEMRR: r.newPOSLocs * r.posARPA,
        posCsmCost: posCOGSRamps.csmCosts[idx]/1000,
        posCsCost: posCOGSRamps.csCosts[idx]/1000,
        posLaunchCost: r.posLaunchCost/1000,
        posSoftwareCOGSPerLoc: calcSoftwareCOGS(avgGPV),
      };
    });
  }, [basePlan, posLiveLocs, posActivations, posCOGSRamps, posSubFee, avgGPV, posRetention, txnFeeRate, fixedTxnFee, passthroughRate, hardwareDiscount, hardwareCost, avgTerminals]);

  const summary = useMemo(() => {
    const dec = financialModel[11];
    const totals = financialModel.reduce((acc, m) => ({
      coreNetRev: acc.coreNetRev + m.coreNetRev,
      posNetRev: acc.posNetRev + m.posNetRev,
      totalNetRev: acc.totalNetRev + m.totalNetRev,
      coreGrossProfit: acc.coreGrossProfit + m.coreGrossProfit,
      posGrossProfit: acc.posGrossProfit + m.posGrossProfit,
      totalGrossProfit: acc.totalGrossProfit + m.totalGrossProfit,
      coreOpIncome: acc.coreOpIncome + m.coreOpIncome,
      posOpIncome: acc.posOpIncome + m.posOpIncome,
      totalOpIncome: acc.totalOpIncome + m.totalOpIncome,
      coreHW: acc.coreHW + m.coreHW,
      coreCashBurn: acc.coreCashBurn + m.coreCashBurn,
      posCashBurn: acc.posCashBurn + m.posCashBurn,
      totalCashBurn: acc.totalCashBurn + m.totalCashBurn,
    }), { coreNetRev: 0, posNetRev: 0, totalNetRev: 0, coreGrossProfit: 0, posGrossProfit: 0, totalGrossProfit: 0, coreOpIncome: 0, posOpIncome: 0, totalOpIncome: 0, coreHW: 0, coreCashBurn: 0, posCashBurn: 0, totalCashBurn: 0 });
    return { dec, totals };
  }, [financialModel]);

  // 2025 monthly ARR values for YoY growth calculations (in $K) - was all Core, no POS existed
  const arr2025Monthly = [30032, 31187, 36179, 37855, 42749, 43816, 46363, 51626, 52909, 59087, 60838, 66958];
  
  // Calculate monthly YoY ARR growth % based on Total ARR vs prior year same month
  const monthlyArrGrowthPct = financialModel.map((m, i) => {
    const priorYearARR = arr2025Monthly[i];
    return ((m.totalARR - priorYearARR) / priorYearARR) * 100;
  });
  
  // Calculate monthly YoY Core ARR growth %
  const monthlyCoreArrGrowthPct = financialModel.map((m, i) => {
    const priorYearARR = arr2025Monthly[i];
    return ((m.coreARR - priorYearARR) / priorYearARR) * 100;
  });
  
  // Quarterly ARR growth (using end of quarter months: Mar, Jun, Sep, Dec)
  const arrGrowthPct = {
    Q1: monthlyArrGrowthPct[2] || 0,   // March
    Q2: monthlyArrGrowthPct[5] || 0,   // June
    Q3: monthlyArrGrowthPct[8] || 0,   // September
    Q4: monthlyArrGrowthPct[11] || 0   // December
  };
  
  // Quarterly Core ARR growth
  const coreArrGrowthPct = {
    Q1: monthlyCoreArrGrowthPct[2] || 0,
    Q2: monthlyCoreArrGrowthPct[5] || 0,
    Q3: monthlyCoreArrGrowthPct[8] || 0,
    Q4: monthlyCoreArrGrowthPct[11] || 0
  };

  // Dec 2025 ARR baseline for burn multiple calculations (in $K)
  const dec2025ARR = 66958;

  // L3M Rule of 40 calculations
  const l3mRuleOf40 = financialModel.map((m, i) => {
    // L3M ARR Growth - average of last 3 months YoY growth
    const arrGrowthArr = i === 0 ? [monthlyArrGrowthPct[0]] :
                         i === 1 ? [monthlyArrGrowthPct[0], monthlyArrGrowthPct[1]] :
                         [monthlyArrGrowthPct[i-2], monthlyArrGrowthPct[i-1], monthlyArrGrowthPct[i]];
    const l3mArrGrowth = arrGrowthArr.reduce((a, b) => a + b, 0) / arrGrowthArr.length;
    
    // L3M Operating Margin - average of last 3 months
    const opMarginArr = i === 0 ? [m.totalOpMargin] :
                        i === 1 ? [financialModel[0].totalOpMargin, m.totalOpMargin] :
                        [financialModel[i-2].totalOpMargin, financialModel[i-1].totalOpMargin, m.totalOpMargin];
    const l3mOpMargin = opMarginArr.reduce((a, b) => a + b, 0) / opMarginArr.length;
    
    // Core L3M
    const coreArrGrowthArr = i === 0 ? [monthlyCoreArrGrowthPct[0]] :
                             i === 1 ? [monthlyCoreArrGrowthPct[0], monthlyCoreArrGrowthPct[1]] :
                             [monthlyCoreArrGrowthPct[i-2], monthlyCoreArrGrowthPct[i-1], monthlyCoreArrGrowthPct[i]];
    const l3mCoreArrGrowth = coreArrGrowthArr.reduce((a, b) => a + b, 0) / coreArrGrowthArr.length;
    
    const coreOpMarginArr = i === 0 ? [m.coreOpMargin] :
                            i === 1 ? [financialModel[0].coreOpMargin, m.coreOpMargin] :
                            [financialModel[i-2].coreOpMargin, financialModel[i-1].coreOpMargin, m.coreOpMargin];
    const l3mCoreOpMargin = coreOpMarginArr.reduce((a, b) => a + b, 0) / coreOpMarginArr.length;
    
    return {
      total: l3mArrGrowth + l3mOpMargin,
      core: l3mCoreArrGrowth + l3mCoreOpMargin,
      pos: null // N/A - no YoY growth for POS
    };
  });

  // L3M Burn Multiple calculations
  const l3mBurnMultiple = financialModel.map((m, i) => {
    // L3M Cash Burn
    const cashBurnArr = i === 0 ? [m.totalCashBurn] :
                        i === 1 ? [financialModel[0].totalCashBurn, m.totalCashBurn] :
                        [financialModel[i-2].totalCashBurn, financialModel[i-1].totalCashBurn, m.totalCashBurn];
    const l3mCashBurn = cashBurnArr.reduce((a, b) => a + b, 0);
    
    // L3M Net New ARR (current ARR - ARR 3 months ago)
    const priorARR = i === 0 ? dec2025ARR : i === 1 ? dec2025ARR : i === 2 ? dec2025ARR : financialModel[i-3].totalARR;
    const l3mNetNewARR = m.totalARR - priorARR;
    
    // Core L3M
    const coreCashBurnArr = i === 0 ? [m.coreCashBurn] :
                            i === 1 ? [financialModel[0].coreCashBurn, m.coreCashBurn] :
                            [financialModel[i-2].coreCashBurn, financialModel[i-1].coreCashBurn, m.coreCashBurn];
    const l3mCoreCashBurn = coreCashBurnArr.reduce((a, b) => a + b, 0);
    const priorCoreARR = i === 0 ? dec2025ARR : i === 1 ? dec2025ARR : i === 2 ? dec2025ARR : financialModel[i-3].coreARR;
    const l3mCoreNetNewARR = m.coreARR - priorCoreARR;
    
    // POS L3M
    const posCashBurnArr = i === 0 ? [m.posCashBurn] :
                           i === 1 ? [financialModel[0].posCashBurn, m.posCashBurn] :
                           [financialModel[i-2].posCashBurn, financialModel[i-1].posCashBurn, m.posCashBurn];
    const l3mPosCashBurn = posCashBurnArr.reduce((a, b) => a + b, 0);
    const priorPosARR = i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 0 : financialModel[i-3].posARR;
    const l3mPosNetNewARR = m.posARR - priorPosARR;
    
    return {
      total: l3mCashBurn >= 0 ? 'Cash+' : l3mNetNewARR > 0 ? (Math.abs(l3mCashBurn) / l3mNetNewARR) : null,
      core: l3mCoreCashBurn >= 0 ? 'Cash+' : l3mCoreNetNewARR > 0 ? (Math.abs(l3mCoreCashBurn) / l3mCoreNetNewARR) : null,
      pos: l3mPosCashBurn >= 0 ? 'Cash+' : l3mPosNetNewARR > 0 ? (Math.abs(l3mPosCashBurn) / l3mPosNetNewARR) : null
    };
  });

  const fmt = (n, d = 0) => n?.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '-';
  const fmtC = (n, d = 0) => n != null ? (n < 0 ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}` : `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`) : '-';
  const fmtP = (n, d = 1) => n != null && isFinite(n) ? `${n.toFixed(d)}%` : '-';

  // Quarterly aggregation helpers
  const quarters = [
    { label: 'Q1', months: [0, 1, 2] },
    { label: 'Q2', months: [3, 4, 5] },
    { label: 'Q3', months: [6, 7, 8] },
    { label: 'Q4', months: [9, 10, 11] }
  ];

  const Row = ({ label, coreValue, posValue, totalValue, bold = false, color = null, showSubRows = true, isEOP = false, isSum = true }) => {
    // For quarterly/annual: isEOP=true uses end of period value, isSum=true sums the values
    const getQValue = (valueFn, qMonths) => {
      if (isEOP) return valueFn(financialModel[qMonths[2]]);
      if (isSum) {
        // Sum the raw values, not the formatted ones
        const vals = qMonths.map(i => {
          const str = valueFn(financialModel[i]);
          if (str === '-' || str === 'N/A') return 0;
          const num = parseFloat(String(str).replace(/[$,%x]/g, '').replace(/,/g, ''));
          return isNaN(num) ? 0 : num;
        });
        const sum = vals.reduce((a, b) => a + b, 0);
        // Detect format from first value
        const sample = valueFn(financialModel[qMonths[0]]);
        if (String(sample).includes('$')) return fmtC(sum, String(sample).includes('.') ? 1 : 0);
        if (String(sample).includes('%')) return fmtP(sum, 0);
        return fmt(sum, 0);
      }
      return valueFn(financialModel[qMonths[2]]);
    };
    const getFYValue = (valueFn) => {
      if (isEOP) return valueFn(financialModel[11]);
      if (isSum) {
        const vals = financialModel.map(m => {
          const str = valueFn(m);
          if (str === '-' || str === 'N/A') return 0;
          const num = parseFloat(String(str).replace(/[$,%x]/g, '').replace(/,/g, ''));
          return isNaN(num) ? 0 : num;
        });
        const sum = vals.reduce((a, b) => a + b, 0);
        const sample = valueFn(financialModel[0]);
        if (String(sample).includes('$')) return fmtC(sum, String(sample).includes('.') ? 1 : 0);
        if (String(sample).includes('%')) return fmtP(sum, 0);
        return fmt(sum, 0);
      }
      return valueFn(financialModel[11]);
    };

    if (viewMode === 'core') {
      const textColor = color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : '';
      return (
        <tr className="hover:bg-blue-50">
          <td className={`sticky left-0 bg-white px-3 py-1 border-r ${bold ? 'font-semibold' : ''} ${textColor}`}>{label}</td>
          {financialModel.map((m, i) => (
            <td key={i} className={`px-2 py-1 text-right ${bold ? 'font-semibold' : ''} ${textColor}`}>{coreValue(m)}</td>
          ))}
          {quarters.map((q, qi) => (
            <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 ${bold ? 'font-semibold' : ''} ${textColor}`}>{getQValue(coreValue, q.months)}</td>
          ))}
          <td className={`px-2 py-1 text-right bg-gray-100 font-semibold ${textColor}`}>{getFYValue(coreValue)}</td>
        </tr>
      );
    }
    if (viewMode === 'pos') {
      return (
        <tr className="hover:bg-blue-50">
          <td className={`sticky left-0 bg-white px-3 py-1 border-r ${bold ? 'font-semibold' : ''} text-blue-600`}>{label}</td>
          {financialModel.map((m, i) => (
            <td key={i} className={`px-2 py-1 text-right ${bold ? 'font-semibold' : ''} text-blue-600`}>{posValue(m)}</td>
          ))}
          {quarters.map((q, qi) => (
            <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 ${bold ? 'font-semibold' : ''} text-blue-600`}>{getQValue(posValue, q.months)}</td>
          ))}
          <td className={`px-2 py-1 text-right bg-gray-100 font-semibold text-blue-600`}>{getFYValue(posValue)}</td>
        </tr>
      );
    }
    const textColor = color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : '';
    return (
      <>
        <tr className="hover:bg-blue-50">
          <td className={`sticky left-0 bg-white px-3 py-1 border-r ${bold ? 'font-semibold' : ''} ${textColor}`}>{label}</td>
          {financialModel.map((m, i) => (
            <td key={i} className={`px-2 py-1 text-right ${bold ? 'font-semibold' : ''} ${textColor}`}>{totalValue(m)}</td>
          ))}
          {quarters.map((q, qi) => (
            <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 ${bold ? 'font-semibold' : ''} ${textColor}`}>{getQValue(totalValue, q.months)}</td>
          ))}
          <td className={`px-2 py-1 text-right bg-gray-100 font-semibold ${textColor}`}>{getFYValue(totalValue)}</td>
        </tr>
        {showSubRows && (
          <>
            <tr className="hover:bg-blue-50 bg-gray-50">
              <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
              {financialModel.map((m, i) => (
                <td key={i} className="px-2 py-1 text-right text-gray-600 text-xs">{coreValue(m)}</td>
              ))}
              {quarters.map((q, qi) => (
                <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs">{getQValue(coreValue, q.months)}</td>
              ))}
              <td className="px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs">{getFYValue(coreValue)}</td>
            </tr>
            <tr className="hover:bg-blue-50 bg-gray-50">
              <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-blue-600 text-xs" style={{paddingLeft: '28px'}}>POS</td>
              {financialModel.map((m, i) => (
                <td key={i} className="px-2 py-1 text-right text-blue-600 text-xs">{posValue(m)}</td>
              ))}
              {quarters.map((q, qi) => (
                <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-blue-600 text-xs">{getQValue(posValue, q.months)}</td>
              ))}
              <td className="px-2 py-1 text-right bg-gray-100 text-blue-600 text-xs">{getFYValue(posValue)}</td>
            </tr>
          </>
        )}
      </>
    );
  };

  const SectionHeader = ({ label }) => (
    <tr className="bg-gray-200">
      <td className="sticky left-0 bg-gray-200 px-3 py-1.5 font-bold border-r" colSpan={18}>{label}</td>
    </tr>
  );

  if (!isAuthenticated) {
    const handleSubmit = () => {
      if (password === correctPassword) {
        setIsAuthenticated(true);
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-80">
          <h2 className="text-lg font-semibold mb-4 text-center">Enter Password</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-2 border rounded mb-4"
            placeholder="Password"
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 text-xs">
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">2026 Financial Model with POS Impact</h1>
          <p className="text-xs text-gray-500">All values in $K unless noted</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('combined')} className={`px-3 py-1 text-xs font-medium rounded ${viewMode === 'combined' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Combined</button>
          <button onClick={() => setViewMode('core')} className={`px-3 py-1 text-xs font-medium rounded ${viewMode === 'core' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Core</button>
          <button onClick={() => setViewMode('pos')} className={`px-3 py-1 text-xs font-medium rounded ${viewMode === 'pos' ? 'bg-blue-500 shadow text-white' : 'text-blue-600 hover:text-blue-800'}`}>POS</button>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="flex px-4">
          {['summary', 'model', 'pos-topline', 'pos-cogs', 'methodology'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-medium border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              {tab === 'summary' ? 'Summary' : tab === 'model' ? 'Financial Model' : tab === 'pos-topline' ? 'POS Top-Line' : tab === 'pos-cogs' ? 'POS Costs' : 'Methodology'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {activeTab === 'model' && (
          <div className="bg-white rounded shadow-sm border overflow-hidden">
            <div className="overflow-auto max-h-[calc(100vh-140px)]">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="sticky left-0 bg-gray-100 px-3 py-2 text-left font-semibold border-r min-w-[200px]">Metric</th>
                    {financialModel.map((m, i) => <th key={i} className="px-2 py-2 text-center font-semibold min-w-[72px]">{m.month}</th>)}
                    <th className="px-2 py-2 text-center font-semibold min-w-[72px] bg-blue-50">Q1</th>
                    <th className="px-2 py-2 text-center font-semibold min-w-[72px] bg-blue-50">Q2</th>
                    <th className="px-2 py-2 text-center font-semibold min-w-[72px] bg-blue-50">Q3</th>
                    <th className="px-2 py-2 text-center font-semibold min-w-[72px] bg-blue-50">Q4</th>
                    <th className="px-2 py-2 text-center font-semibold min-w-[80px] bg-gray-200">FY 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <SectionHeader label="Location Metrics" />
                  <Row label="Live Locations" coreValue={m => fmt(m.coreLocs)} posValue={m => fmt(m.posLocs)} totalValue={m => fmt(m.totalLocs)} isEOP={true} isSum={false} />
                  <Row label="New CW" coreValue={m => fmt(m.coreNewCW)} posValue={m => fmt(m.posNewCW)} totalValue={m => fmt(m.coreNewCW + m.posNewCW)} />
                  <Row label="Launched" coreValue={m => fmt(m.coreLaunched)} posValue={m => fmt(m.posLaunched)} totalValue={m => fmt(m.coreLaunched + m.posLaunched)} />
                  <Row label="eMRR ($K)" coreValue={m => fmtC(m.coreEMRR / 1000)} posValue={m => fmtC(m.posEMRR / 1000)} totalValue={m => fmtC((m.coreEMRR + m.posEMRR) / 1000)} isEOP={true} isSum={false} />
                  <Row label="POS Penetration %" coreValue={m => '-'} posValue={m => fmtP(m.posPenetration)} totalValue={m => fmtP(m.posPenetration)} showSubRows={false} isEOP={true} isSum={false} />
                  <Row label="Annual Retention %" coreValue={m => fmtP(m.coreRetention, 1)} posValue={m => fmtP(m.posRetention, 1)} totalValue={m => fmtP(m.blendedRetention, 1)} isEOP={true} isSum={false} />

                  <SectionHeader label="GPV" />
                  <Row label="GPV" coreValue={m => fmtC(m.coreGPV)} posValue={m => fmtC(m.posGPV)} totalValue={m => fmtC(m.totalGPV)} />
                  <Row label="GPV/Loc - Blended" coreValue={m => fmtC(m.coreGPV * 1000 / m.coreLocs, 0)} posValue={m => fmtC(m.posGPV * 1000 / m.posLocs, 0)} totalValue={m => fmtC(m.totalGPV * 1000 / m.totalLocs, 0)} isEOP={true} isSum={false} />
                  <Row label="GPV/Loc - Attached" coreValue={m => '-'} posValue={m => '-'} totalValue={m => fmtC((m.coreGPV * 1000 / m.coreLocs) + (m.posGPV * 1000 / m.posLocs), 0)} showSubRows={false} isEOP={true} isSum={false} />

                  <SectionHeader label="Revenue" />
                  <Row label="Subscription Revenue" coreValue={m => fmtC(m.coreSubRev)} posValue={m => fmtC(m.posSubRev)} totalValue={m => fmtC(m.totalSubRev)} />
                  <Row label="Transaction Revenue" coreValue={m => fmtC(m.coreTxnRev)} posValue={m => fmtC(m.posTxnRev)} totalValue={m => fmtC(m.totalTxnRev)} />
                  {viewMode !== 'core' && (
                    <tr className="hover:bg-blue-50">
                      <td className="sticky left-0 bg-white px-3 py-1 border-r text-blue-600">Payments Passthrough</td>
                      {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right text-blue-600">{fmtC(m.posPassthroughRev)}</td>)}
                      {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-blue-600">{fmtC(financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.posPassthroughRev, 0))}</td>)}
                      <td className="px-2 py-1 text-right bg-gray-100 font-semibold text-blue-600">{fmtC(financialModel.reduce((s,m) => s + m.posPassthroughRev, 0))}</td>
                    </tr>
                  )}
                  <Row label="Net Revenue (incl. passthrough)" coreValue={m => fmtC(m.coreNetRev)} posValue={m => fmtC(m.posNetRev)} totalValue={m => fmtC(m.totalNetRev)} />
                  <Row label="ARPA - Blended" coreValue={m => fmtC(m.coreARPA, 0)} posValue={m => fmtC(m.posARPA, 0)} totalValue={m => fmtC(m.totalARPA, 0)} isEOP={true} isSum={false} />
                  <Row label="ARPA - Attached" coreValue={m => '-'} posValue={m => '-'} totalValue={m => fmtC(m.coreARPA + m.posARPA, 0)} showSubRows={false} isEOP={true} isSum={false} />
                  <Row label="ARR (excl. passthrough)" coreValue={m => fmtC(m.coreARR)} posValue={m => fmtC(m.posARR)} totalValue={m => fmtC(m.totalARR)} isEOP={true} isSum={false} />
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">ARR Growth % (YoY)</td>
                    {financialModel.map((m, i) => (
                      <td key={i} className="px-2 py-1 text-right">{fmtP(monthlyArrGrowthPct[i], 0)}</td>
                    ))}
                    {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtP(monthlyArrGrowthPct[q.months[2]], 0)}</td>)}
                    <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtP(monthlyArrGrowthPct[11], 0)}</td>
                  </tr>
                  <tr className="hover:bg-blue-50 bg-gray-50">
                    <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
                    {financialModel.map((m, i) => (
                      <td key={i} className="px-2 py-1 text-right text-gray-600 text-xs">{fmtP(monthlyCoreArrGrowthPct[i], 0)}</td>
                    ))}
                    {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs">{fmtP(monthlyCoreArrGrowthPct[q.months[2]], 0)}</td>)}
                    <td className="px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs">{fmtP(monthlyCoreArrGrowthPct[11], 0)}</td>
                  </tr>

                  <SectionHeader label="Cost of Revenue" />
                  <Row label="COGS" coreValue={m => fmtC(m.coreCOGS)} posValue={m => fmtC(m.posCOGS)} totalValue={m => fmtC(m.totalCOGS)} />
                  <Row label="Gross Profit" coreValue={m => fmtC(m.coreGrossProfit)} posValue={m => fmtC(m.posGrossProfit)} totalValue={m => fmtC(m.totalGrossProfit)} />
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Gross Margin % - Blended</td>
                    {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right">{fmtP(m.totalGrossMargin)}</td>)}
                    {quarters.map((q, qi) => {
                      const qGP = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.totalGrossProfit, 0);
                      const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.totalNetRev - m.posPassthroughRev, 0);
                      return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtP(qRev > 0 ? (qGP / qRev) * 100 : 0)}</td>;
                    })}
                    {(() => {
                      const fyGP = financialModel.reduce((s,m) => s + m.totalGrossProfit, 0);
                      const fyRev = financialModel.reduce((s,m) => s + m.totalNetRev - m.posPassthroughRev, 0);
                      return <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtP(fyRev > 0 ? (fyGP / fyRev) * 100 : 0)}</td>;
                    })()}
                  </tr>
                  {viewMode === 'combined' && (
                    <>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
                        {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right text-gray-600 text-xs">{fmtP(m.coreGrossMargin)}</td>)}
                        {quarters.map((q, qi) => {
                          const qGP = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreGrossProfit, 0);
                          const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreNetRev, 0);
                          return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs">{fmtP(qRev > 0 ? (qGP / qRev) * 100 : 0)}</td>;
                        })}
                        {(() => {
                          const fyGP = financialModel.reduce((s,m) => s + m.coreGrossProfit, 0);
                          const fyRev = financialModel.reduce((s,m) => s + m.coreNetRev, 0);
                          return <td className="px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs">{fmtP(fyRev > 0 ? (fyGP / fyRev) * 100 : 0)}</td>;
                        })()}
                      </tr>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-blue-600 text-xs" style={{paddingLeft: '28px'}}>POS</td>
                        {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right text-blue-600 text-xs">{fmtP(m.posGrossMargin)}</td>)}
                        {quarters.map((q, qi) => {
                          const qGP = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.posGrossProfit, 0);
                          const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.posNetRev - m.posPassthroughRev, 0);
                          return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-blue-600 text-xs">{fmtP(qRev > 0 ? (qGP / qRev) * 100 : 0)}</td>;
                        })}
                        {(() => {
                          const fyGP = financialModel.reduce((s,m) => s + m.posGrossProfit, 0);
                          const fyRev = financialModel.reduce((s,m) => s + m.posNetRev - m.posPassthroughRev, 0);
                          return <td className="px-2 py-1 text-right bg-gray-100 text-blue-600 text-xs">{fmtP(fyRev > 0 ? (fyGP / fyRev) * 100 : 0)}</td>;
                        })()}
                      </tr>
                    </>
                  )}
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Gross Margin % - Attached</td>
                    {financialModel.map((m, i) => {
                      // Attached GM = weighted average by ARPA: (Core GM * Core ARPA + POS GM * POS ARPA) / (Core ARPA + POS ARPA)
                      const attachedGM = (m.coreARPA + m.posARPA) > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / (m.coreARPA + m.posARPA) : 0;
                      return <td key={i} className="px-2 py-1 text-right">{fmtP(attachedGM)}</td>;
                    })}
                    {quarters.map((q, qi) => {
                      const m = financialModel[q.months[2]];
                      const attachedGM = (m.coreARPA + m.posARPA) > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / (m.coreARPA + m.posARPA) : 0;
                      return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtP(attachedGM)}</td>;
                    })}
                    {(() => {
                      const m = financialModel[11];
                      const attachedGM = (m.coreARPA + m.posARPA) > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / (m.coreARPA + m.posARPA) : 0;
                      return <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtP(attachedGM)}</td>;
                    })()}
                  </tr>

                  <SectionHeader label="Operating Expenses" />
                  <Row label="Sales" coreValue={m => fmtC(m.coreSales)} posValue={m => fmtC(m.posSales)} totalValue={m => fmtC(m.totalSales)} />
                  {viewMode !== 'pos' && (
                    <>
                      <tr className="hover:bg-blue-50"><td className="sticky left-0 bg-white px-3 py-1 border-r">Marketing</td>{financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right">{fmtC(m.coreMktg)}</td>)}{quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtC(financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreMktg, 0))}</td>)}<td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtC(financialModel.reduce((s,m) => s + m.coreMktg, 0))}</td></tr>
                      <tr className="hover:bg-blue-50"><td className="sticky left-0 bg-white px-3 py-1 border-r">Media</td>{financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right">{fmtC(m.coreMedia)}</td>)}{quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtC(financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreMedia, 0))}</td>)}<td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtC(financialModel.reduce((s,m) => s + m.coreMedia, 0))}</td></tr>
                    </>
                  )}
                  <Row label="Onboarding" coreValue={m => fmtC(m.coreOnboarding)} posValue={m => fmtC(m.posOnboarding)} totalValue={m => fmtC(m.totalOnboarding)} />
                  <Row label="R&D (EPD)" coreValue={m => fmtC(m.coreEPD)} posValue={m => fmtC(m.posEPD)} totalValue={m => fmtC(m.totalEPD)} />
                  <Row label="G&A" coreValue={m => fmtC(m.coreGA)} posValue={m => fmtC(m.posGA)} totalValue={m => fmtC(m.totalGA)} />
                  <Row label="Total Opex" coreValue={m => fmtC(m.coreOpex)} posValue={m => fmtC(m.posOpex)} totalValue={m => fmtC(m.totalOpex)} />

                  <SectionHeader label="Operating Income" />
                  <Row label="Operating Income" coreValue={m => fmtC(m.coreOpIncome)} posValue={m => fmtC(m.posOpIncome)} totalValue={m => fmtC(m.totalOpIncome)} />
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Operating Margin %</td>
                    {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right">{fmtP(m.totalOpMargin)}</td>)}
                    {quarters.map((q, qi) => {
                      const qOpIncome = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.totalOpIncome, 0);
                      const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.totalNetRev - m.posPassthroughRev, 0);
                      return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtP(qRev > 0 ? (qOpIncome / qRev) * 100 : 0)}</td>;
                    })}
                    {(() => {
                      const fyOpIncome = financialModel.reduce((s,m) => s + m.totalOpIncome, 0);
                      const fyRev = financialModel.reduce((s,m) => s + m.totalNetRev - m.posPassthroughRev, 0);
                      return <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtP(fyRev > 0 ? (fyOpIncome / fyRev) * 100 : 0)}</td>;
                    })()}
                  </tr>
                  {viewMode === 'combined' && (
                    <>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
                        {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right text-gray-600 text-xs">{fmtP(m.coreOpMargin)}</td>)}
                        {quarters.map((q, qi) => {
                          const qOpIncome = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreOpIncome, 0);
                          const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreNetRev, 0);
                          return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs">{fmtP(qRev > 0 ? (qOpIncome / qRev) * 100 : 0)}</td>;
                        })}
                        {(() => {
                          const fyOpIncome = financialModel.reduce((s,m) => s + m.coreOpIncome, 0);
                          const fyRev = financialModel.reduce((s,m) => s + m.coreNetRev, 0);
                          return <td className="px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs">{fmtP(fyRev > 0 ? (fyOpIncome / fyRev) * 100 : 0)}</td>;
                        })()}
                      </tr>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-blue-600 text-xs" style={{paddingLeft: '28px'}}>POS</td>
                        {financialModel.map((m, i) => <td key={i} className="px-2 py-1 text-right text-blue-600 text-xs">{fmtP(m.posOpMargin)}</td>)}
                        {quarters.map((q, qi) => {
                          const qOpIncome = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.posOpIncome, 0);
                          const qRev = financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.posNetRev - m.posPassthroughRev, 0);
                          return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-blue-600 text-xs">{fmtP(qRev > 0 ? (qOpIncome / qRev) * 100 : 0)}</td>;
                        })}
                        {(() => {
                          const fyOpIncome = financialModel.reduce((s,m) => s + m.posOpIncome, 0);
                          const fyRev = financialModel.reduce((s,m) => s + m.posNetRev - m.posPassthroughRev, 0);
                          return <td className="px-2 py-1 text-right bg-gray-100 text-blue-600 text-xs">{fmtP(fyRev > 0 ? (fyOpIncome / fyRev) * 100 : 0)}</td>;
                        })()}
                      </tr>
                    </>
                  )}
                  <Row label="Operating Burn" coreValue={m => fmtC(m.coreOpIncome)} posValue={m => fmtC(m.posOpIncome)} totalValue={m => fmtC(m.totalOpIncome)} />
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Investing Burn (Core HW)</td>
                    {financialModel.map((m, i) => (
                      <td key={i} className="px-2 py-1 text-right">{fmtC(-m.coreHW)}</td>
                    ))}
                    {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{fmtC(-financialModel.slice(q.months[0], q.months[2]+1).reduce((s,m) => s + m.coreHW, 0))}</td>)}
                    <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{fmtC(-financialModel.reduce((s,m) => s + m.coreHW, 0))}</td>
                  </tr>
                  <Row label="Cash Burn (Op + Invest)" coreValue={m => fmtC(m.coreCashBurn)} posValue={m => fmtC(m.posCashBurn)} totalValue={m => fmtC(m.totalCashBurn)} />

                  <SectionHeader label="Efficiency Metrics" />
                  <Row label="LTV ($) - Blended" coreValue={m => fmtC(m.coreLTV, 0)} posValue={m => fmtC(m.posLTV, 0)} totalValue={m => fmtC(m.totalLTV, 0)} isEOP={true} isSum={false} />
                  <Row label="CAC ($) - Blended" coreValue={m => fmtC(m.coreCAC, 0)} posValue={m => fmtC(m.posCAC, 0)} totalValue={m => fmtC(m.totalCAC, 0)} isEOP={true} isSum={false} />
                  <Row label="LTV/CAC - Blended" coreValue={m => m.coreLTVCAC && isFinite(m.coreLTVCAC) ? `${m.coreLTVCAC.toFixed(1)}x` : '-'} posValue={m => m.posLTVCAC && isFinite(m.posLTVCAC) ? `${m.posLTVCAC.toFixed(1)}x` : '-'} totalValue={m => m.totalLTVCAC && isFinite(m.totalLTVCAC) ? `${m.totalLTVCAC.toFixed(1)}x` : '-'} isEOP={true} isSum={false} />
                  <Row label="LTV ($) - Attached" coreValue={m => '-'} posValue={m => '-'} totalValue={m => fmtC(m.coreLTV + m.posLTV, 0)} showSubRows={false} isEOP={true} isSum={false} />
                  <Row label="CAC ($) - Attached" coreValue={m => '-'} posValue={m => '-'} totalValue={m => fmtC(m.coreCAC + m.posCAC, 0)} showSubRows={false} isEOP={true} isSum={false} />
                  <Row label="LTV/CAC - Attached" coreValue={m => '-'} posValue={m => '-'} totalValue={m => { const attachedLTV = m.coreLTV + m.posLTV; const attachedCAC = m.coreCAC + m.posCAC; return attachedCAC > 0 && isFinite(attachedLTV / attachedCAC) ? `${(attachedLTV / attachedCAC).toFixed(1)}x` : '-'; }} showSubRows={false} isEOP={true} isSum={false} />
                  <Row label="CAC Payback (mo) - Blended" coreValue={m => m.corePayback && isFinite(m.corePayback) ? fmt(m.corePayback, 1) : '-'} posValue={m => m.posPayback && isFinite(m.posPayback) ? fmt(m.posPayback, 1) : '-'} totalValue={m => m.totalPayback && isFinite(m.totalPayback) ? fmt(m.totalPayback, 1) : '-'} isEOP={true} isSum={false} />
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">CAC Payback (mo) - Attached</td>
                    {financialModel.map((m, i) => {
                      // Attached CAC Payback = (Core CAC + POS CAC) / (Attached GM % * Attached ARPA)
                      const attachedCAC = m.coreCAC + m.posCAC;
                      const attachedARPA = m.coreARPA + m.posARPA;
                      const attachedGM = attachedARPA > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / attachedARPA / 100 : 0;
                      const gpPerCust = attachedGM * attachedARPA;
                      const payback = gpPerCust > 0 ? attachedCAC / gpPerCust : 0;
                      return <td key={i} className="px-2 py-1 text-right">{payback > 0 && isFinite(payback) ? fmt(payback, 1) : '-'}</td>;
                    })}
                    {quarters.map((q, qi) => {
                      const m = financialModel[q.months[2]];
                      const attachedCAC = m.coreCAC + m.posCAC;
                      const attachedARPA = m.coreARPA + m.posARPA;
                      const attachedGM = attachedARPA > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / attachedARPA / 100 : 0;
                      const gpPerCust = attachedGM * attachedARPA;
                      const payback = gpPerCust > 0 ? attachedCAC / gpPerCust : 0;
                      return <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">{payback > 0 && isFinite(payback) ? fmt(payback, 1) : '-'}</td>;
                    })}
                    {(() => {
                      const m = financialModel[11];
                      const attachedCAC = m.coreCAC + m.posCAC;
                      const attachedARPA = m.coreARPA + m.posARPA;
                      const attachedGM = attachedARPA > 0 ? 
                        (m.coreGrossMargin * m.coreARPA + m.posGrossMargin * m.posARPA) / attachedARPA / 100 : 0;
                      const gpPerCust = attachedGM * attachedARPA;
                      const payback = gpPerCust > 0 ? attachedCAC / gpPerCust : 0;
                      return <td className="px-2 py-1 text-right bg-gray-100 font-semibold">{payback > 0 && isFinite(payback) ? fmt(payback, 1) : '-'}</td>;
                    })()}
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Rule of 40 (L3M)</td>
                    {financialModel.map((m, i) => (
                      <td key={i} className="px-2 py-1 text-right">
                        {viewMode === 'core' ? `${fmt(l3mRuleOf40[i].core, 0)}%` :
                         viewMode === 'pos' ? 'N/A' :
                         `${fmt(l3mRuleOf40[i].total, 0)}%`}
                      </td>
                    ))}
                    {quarters.map((q, qi) => (
                      <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50">
                        {viewMode === 'core' ? `${fmt(l3mRuleOf40[q.months[2]].core, 0)}%` :
                         viewMode === 'pos' ? 'N/A' :
                         `${fmt(l3mRuleOf40[q.months[2]].total, 0)}%`}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-right bg-gray-100 font-semibold">
                      {viewMode === 'core' ? `${fmt(l3mRuleOf40[11].core, 0)}%` :
                       viewMode === 'pos' ? 'N/A' :
                       `${fmt(l3mRuleOf40[11].total, 0)}%`}
                    </td>
                  </tr>
                  {viewMode === 'combined' && (
                    <>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
                        {financialModel.map((m, i) => (
                          <td key={i} className="px-2 py-1 text-right text-gray-600 text-xs">{fmt(l3mRuleOf40[i].core, 0)}%</td>
                        ))}
                        {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs">{fmt(l3mRuleOf40[q.months[2]].core, 0)}%</td>)}
                        <td className="px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs">{fmt(l3mRuleOf40[11].core, 0)}%</td>
                      </tr>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-blue-600 text-xs" style={{paddingLeft: '28px'}}>POS</td>
                        {financialModel.map((m, i) => (
                          <td key={i} className="px-2 py-1 text-right text-blue-600 text-xs">N/A</td>
                        ))}
                        {quarters.map((q, qi) => <td key={`q${qi}`} className="px-2 py-1 text-right bg-blue-50 text-blue-600 text-xs">N/A</td>)}
                        <td className="px-2 py-1 text-right bg-gray-100 text-blue-600 text-xs">N/A</td>
                      </tr>
                    </>
                  )}
                  <tr className="hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-3 py-1 border-r">Burn Multiple (L3M)</td>
                    {financialModel.map((m, i) => {
                      const bm = viewMode === 'core' ? l3mBurnMultiple[i].core :
                                 viewMode === 'pos' ? l3mBurnMultiple[i].pos :
                                 l3mBurnMultiple[i].total;
                      const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                      return <td key={i} className={`px-2 py-1 text-right ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                    })}
                    {quarters.map((q, qi) => {
                      const bm = viewMode === 'core' ? l3mBurnMultiple[q.months[2]].core :
                                 viewMode === 'pos' ? l3mBurnMultiple[q.months[2]].pos :
                                 l3mBurnMultiple[q.months[2]].total;
                      const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                      return <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                    })}
                    {(() => {
                      const bm = viewMode === 'core' ? l3mBurnMultiple[11].core :
                                 viewMode === 'pos' ? l3mBurnMultiple[11].pos :
                                 l3mBurnMultiple[11].total;
                      const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                      return <td className={`px-2 py-1 text-right bg-gray-100 font-semibold ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                    })()}
                  </tr>
                  {viewMode === 'combined' && (
                    <>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-gray-600 text-xs" style={{paddingLeft: '28px'}}>Core</td>
                        {financialModel.map((m, i) => {
                          const bm = l3mBurnMultiple[i].core;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td key={i} className={`px-2 py-1 text-right text-gray-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })}
                        {quarters.map((q, qi) => {
                          const bm = l3mBurnMultiple[q.months[2]].core;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 text-gray-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })}
                        {(() => {
                          const bm = l3mBurnMultiple[11].core;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td className={`px-2 py-1 text-right bg-gray-100 text-gray-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })()}
                      </tr>
                      <tr className="hover:bg-blue-50 bg-gray-50">
                        <td className="sticky left-0 bg-gray-50 px-3 py-1 border-r text-blue-600 text-xs" style={{paddingLeft: '28px'}}>POS</td>
                        {financialModel.map((m, i) => {
                          const bm = l3mBurnMultiple[i].pos;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td key={i} className={`px-2 py-1 text-right text-blue-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })}
                        {quarters.map((q, qi) => {
                          const bm = l3mBurnMultiple[q.months[2]].pos;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td key={`q${qi}`} className={`px-2 py-1 text-right bg-blue-50 text-blue-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })}
                        {(() => {
                          const bm = l3mBurnMultiple[11].pos;
                          const burnMult = bm === 'Cash+' ? 'Cash+' : bm != null ? `${fmt(bm, 1)}x` : '-';
                          return <td className={`px-2 py-1 text-right bg-gray-100 text-blue-600 text-xs ${bm === 'Cash+' ? 'text-green-600' : ''}`}>{burnMult}</td>;
                        })()}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pos-topline' && (
          <div className="max-w-5xl space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-3">POS Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Avg GPV/Location</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="10000" max="50000" step="1000" value={avgGPV} onChange={e => setAvgGPV(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm font-medium w-20">${(avgGPV/1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">POS Retention</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="70" max="95" step="1" value={posRetention} onChange={e => setPosRetention(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm font-medium w-12">{posRetention}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Fee ($/mo)</label>
                  <input type="number" step="1" value={posSubFee} onChange={e => setPosSubFee(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Fee (% of GPV)</label>
                  <input type="number" step="0.1" value={txnFeeRate} onChange={e => setTxnFeeRate(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fixed Per-Txn Fee ($)</label>
                  <input type="number" step="0.01" value={fixedTxnFee} onChange={e => setFixedTxnFee(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Passthrough Cost (%)</label>
                  <input type="number" step="0.1" value={passthroughRate} onChange={e => setPassthroughRate(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">POS Activation Ramp</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setActivationScenario('eoyRamp'); setPosActivations(activationScenarios.eoyRamp); }} className={`px-3 py-1.5 text-xs font-medium rounded border-2 ${activationScenario === 'eoyRamp' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>EOY Ramp (600)</button>
                  <button onClick={() => { setActivationScenario('balanced'); setPosActivations(activationScenarios.balanced); }} className={`px-3 py-1.5 text-xs font-medium rounded border-2 ${activationScenario === 'balanced' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>Balanced (600)</button>
                  <button onClick={() => { setActivationScenario('accelerated'); setPosActivations(activationScenarios.accelerated); }} className={`px-3 py-1.5 text-xs font-medium rounded border-2 ${activationScenario === 'accelerated' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200'}`}>Accelerated (1,000)</button>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-1">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <div key={i} className="text-center">
                    <label className="block text-xs text-gray-500 mb-1">{m}</label>
                    <input type="number" value={posActivations[i]} onChange={e => { const r = [...posActivations]; r[i] = Number(e.target.value); setPosActivations(r); setActivationScenario('custom'); }} className="w-full p-1 border rounded text-xs text-center" />
                  </div>
                ))}
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">Total: {posActivations.reduce((a,b) => a+b, 0)} activations</div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <label className="block text-xs font-medium text-gray-700 mb-1">Live POS Locations (after churn)</label>
                <div className="grid grid-cols-12 gap-1">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <div key={i} className="text-center">
                      <label className="block text-xs text-gray-500 mb-1">{m}</label>
                      <div className="p-1 bg-white border rounded text-xs font-medium">{posLiveLocs[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos-cogs' && (
          <div className="max-w-5xl space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-3">Software COGS</h3>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-600">At ${avgGPV.toLocaleString()} GPV:</div>
                <div className="text-2xl font-semibold text-blue-700">${calcSoftwareCOGS(avgGPV).toFixed(2)}/loc/mo</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-3">Hardware</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Avg Terminals/Location</label>
                  <input type="number" step="0.1" value={avgTerminals} onChange={e => setAvgTerminals(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hardware Cost/Terminal</label>
                  <input type="text" value={`$${hardwareCost}`} disabled className="w-full p-2 border rounded text-sm bg-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">HW Discount: {hardwareDiscount}%</label>
                  <input type="range" min="0" max="100" step="5" value={hardwareDiscount} onChange={e => setHardwareDiscount(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-3">Personnel Costs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ending CSMs</label>
                  <input type="number" value={endingCSMs} onChange={e => setEndingCSMs(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ending CS Staff</label>
                  <input type="number" value={endingCS} onChange={e => setEndingCS(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-3">Sales & Launch</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Launch Cost/Activation</label>
                  <input type="number" value={launchCostPerActivation} onChange={e => setLaunchCostPerActivation(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Annual Sales Cost</label>
                  <input type="number" step="10000" value={totalAnnualSalesCost} onChange={e => setTotalAnnualSalesCost(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Spiff/Activation</label>
                  <input type="number" step="10" value={salesSpiffPerActivation} onChange={e => setSalesSpiffPerActivation(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'summary' && (
          <div className="max-w-6xl space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-4">Quarterly Summary</h3>
              
              {/* Total/Blended Unit Economics */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Total (Blended)</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2">Metric</th>
                      <th className="text-right py-2 px-2">Q1</th>
                      <th className="text-right py-2 px-2">Q2</th>
                      <th className="text-right py-2 px-2">Q3</th>
                      <th className="text-right py-2 px-2">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="py-1.5 px-2">GPV/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.totalGPV * 1000 / financialModel[2]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.totalGPV * 1000 / financialModel[5]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.totalGPV * 1000 / financialModel[8]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.totalGPV * 1000 / financialModel[11]?.totalLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">ARPA ($/mo)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.totalARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.totalARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.totalARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.totalARPA, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Profit/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.totalGrossProfit * 1000 / financialModel[2]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.totalGrossProfit * 1000 / financialModel[5]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.totalGrossProfit * 1000 / financialModel[8]?.totalLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.totalGrossProfit * 1000 / financialModel[11]?.totalLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Margin %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.totalGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.totalGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.totalGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.totalGrossMargin)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Annual Retention %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.blendedRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.blendedRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.blendedRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.blendedRetention)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.totalLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.totalLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.totalLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.totalLTV, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.totalCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.totalCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.totalCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.totalCAC, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV/CAC</td><td className="text-right py-1.5 px-2">{financialModel[2]?.totalLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[5]?.totalLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[8]?.totalLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[11]?.totalLTVCAC?.toFixed(1)}x</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC Payback (mo)</td><td className="text-right py-1.5 px-2">{fmt(financialModel[2]?.totalPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[5]?.totalPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[8]?.totalPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[11]?.totalPayback, 1)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Total/Attached Unit Economics */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Total (Attached)</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2">Metric</th>
                      <th className="text-right py-2 px-2">Q1</th>
                      <th className="text-right py-2 px-2">Q2</th>
                      <th className="text-right py-2 px-2">Q3</th>
                      <th className="text-right py-2 px-2">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="py-1.5 px-2">GPV/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[2]?.coreGPV * 1000 / financialModel[2]?.coreLocs) + (financialModel[2]?.posGPV * 1000 / financialModel[2]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[5]?.coreGPV * 1000 / financialModel[5]?.coreLocs) + (financialModel[5]?.posGPV * 1000 / financialModel[5]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[8]?.coreGPV * 1000 / financialModel[8]?.coreLocs) + (financialModel[8]?.posGPV * 1000 / financialModel[8]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[11]?.coreGPV * 1000 / financialModel[11]?.coreLocs) + (financialModel[11]?.posGPV * 1000 / financialModel[11]?.posLocs), 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">ARPA ($/mo)</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[2]?.coreARPA || 0) + (financialModel[2]?.posARPA || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[5]?.coreARPA || 0) + (financialModel[5]?.posARPA || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[8]?.coreARPA || 0) + (financialModel[8]?.posARPA || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[11]?.coreARPA || 0) + (financialModel[11]?.posARPA || 0), 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Profit/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[2]?.coreGrossProfit * 1000 / financialModel[2]?.coreLocs) + (financialModel[2]?.posGrossProfit * 1000 / financialModel[2]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[5]?.coreGrossProfit * 1000 / financialModel[5]?.coreLocs) + (financialModel[5]?.posGrossProfit * 1000 / financialModel[5]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[8]?.coreGrossProfit * 1000 / financialModel[8]?.coreLocs) + (financialModel[8]?.posGrossProfit * 1000 / financialModel[8]?.posLocs), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[11]?.coreGrossProfit * 1000 / financialModel[11]?.coreLocs) + (financialModel[11]?.posGrossProfit * 1000 / financialModel[11]?.posLocs), 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Margin %</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[2]; const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); return arpa > 0 ? fmtP(((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[5]; const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); return arpa > 0 ? fmtP(((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[8]; const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); return arpa > 0 ? fmtP(((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[11]; const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); return arpa > 0 ? fmtP(((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa) : '-'; })()}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Annual Retention %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.posRetention)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV ($)</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[2]?.coreLTV || 0) + (financialModel[2]?.posLTV || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[5]?.coreLTV || 0) + (financialModel[5]?.posLTV || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[8]?.coreLTV || 0) + (financialModel[8]?.posLTV || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[11]?.coreLTV || 0) + (financialModel[11]?.posLTV || 0), 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC ($)</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[2]?.coreCAC || 0) + (financialModel[2]?.posCAC || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[5]?.coreCAC || 0) + (financialModel[5]?.posCAC || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[8]?.coreCAC || 0) + (financialModel[8]?.posCAC || 0), 0)}</td><td className="text-right py-1.5 px-2">{fmtC((financialModel[11]?.coreCAC || 0) + (financialModel[11]?.posCAC || 0), 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV/CAC</td><td className="text-right py-1.5 px-2">{(() => { const ltv = (financialModel[2]?.coreLTV || 0) + (financialModel[2]?.posLTV || 0); const cac = (financialModel[2]?.coreCAC || 0) + (financialModel[2]?.posCAC || 0); return cac > 0 ? `${(ltv/cac).toFixed(1)}x` : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const ltv = (financialModel[5]?.coreLTV || 0) + (financialModel[5]?.posLTV || 0); const cac = (financialModel[5]?.coreCAC || 0) + (financialModel[5]?.posCAC || 0); return cac > 0 ? `${(ltv/cac).toFixed(1)}x` : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const ltv = (financialModel[8]?.coreLTV || 0) + (financialModel[8]?.posLTV || 0); const cac = (financialModel[8]?.coreCAC || 0) + (financialModel[8]?.posCAC || 0); return cac > 0 ? `${(ltv/cac).toFixed(1)}x` : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const ltv = (financialModel[11]?.coreLTV || 0) + (financialModel[11]?.posLTV || 0); const cac = (financialModel[11]?.coreCAC || 0) + (financialModel[11]?.posCAC || 0); return cac > 0 ? `${(ltv/cac).toFixed(1)}x` : '-'; })()}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC Payback (mo)</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[2]; const cac = (m?.coreCAC || 0) + (m?.posCAC || 0); const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); const gm = arpa > 0 ? ((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa / 100 : 0; const gp = gm * arpa; return gp > 0 ? fmt(cac / gp, 1) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[5]; const cac = (m?.coreCAC || 0) + (m?.posCAC || 0); const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); const gm = arpa > 0 ? ((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa / 100 : 0; const gp = gm * arpa; return gp > 0 ? fmt(cac / gp, 1) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[8]; const cac = (m?.coreCAC || 0) + (m?.posCAC || 0); const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); const gm = arpa > 0 ? ((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa / 100 : 0; const gp = gm * arpa; return gp > 0 ? fmt(cac / gp, 1) : '-'; })()}</td><td className="text-right py-1.5 px-2">{(() => { const m = financialModel[11]; const cac = (m?.coreCAC || 0) + (m?.posCAC || 0); const arpa = (m?.coreARPA || 0) + (m?.posARPA || 0); const gm = arpa > 0 ? ((m?.coreGrossMargin || 0) * (m?.coreARPA || 0) + (m?.posGrossMargin || 0) * (m?.posARPA || 0)) / arpa / 100 : 0; const gp = gm * arpa; return gp > 0 ? fmt(cac / gp, 1) : '-'; })()}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Core Unit Economics */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Core</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2">Metric</th>
                      <th className="text-right py-2 px-2">Q1</th>
                      <th className="text-right py-2 px-2">Q2</th>
                      <th className="text-right py-2 px-2">Q3</th>
                      <th className="text-right py-2 px-2">Q4</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b"><td className="py-1.5 px-2">GPV/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.coreGPV * 1000 / financialModel[2]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.coreGPV * 1000 / financialModel[5]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.coreGPV * 1000 / financialModel[8]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.coreGPV * 1000 / financialModel[11]?.coreLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">ARPA ($/mo)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.coreARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.coreARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.coreARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.coreARPA, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Profit/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.coreGrossProfit * 1000 / financialModel[2]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.coreGrossProfit * 1000 / financialModel[5]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.coreGrossProfit * 1000 / financialModel[8]?.coreLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.coreGrossProfit * 1000 / financialModel[11]?.coreLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Margin %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.coreGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.coreGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.coreGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.coreGrossMargin)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Annual Retention %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.coreRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.coreRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.coreRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.coreRetention)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.coreLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.coreLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.coreLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.coreLTV, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.coreCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.coreCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.coreCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.coreCAC, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV/CAC</td><td className="text-right py-1.5 px-2">{financialModel[2]?.coreLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[5]?.coreLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[8]?.coreLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[11]?.coreLTVCAC?.toFixed(1)}x</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC Payback (mo)</td><td className="text-right py-1.5 px-2">{fmt(financialModel[2]?.corePayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[5]?.corePayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[8]?.corePayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[11]?.corePayback, 1)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* POS Unit Economics */}
              <div>
                <h4 className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">POS</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2">Metric</th>
                      <th className="text-right py-2 px-2">Q1</th>
                      <th className="text-right py-2 px-2">Q2</th>
                      <th className="text-right py-2 px-2">Q3</th>
                      <th className="text-right py-2 px-2">Q4</th>
                    </tr>
                  </thead>
                  <tbody className="text-blue-600">
                    <tr className="border-b"><td className="py-1.5 px-2">GPV/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.posGPV * 1000 / financialModel[2]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.posGPV * 1000 / financialModel[5]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.posGPV * 1000 / financialModel[8]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.posGPV * 1000 / financialModel[11]?.posLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">ARPA ($/mo)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.posARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.posARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.posARPA, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.posARPA, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Profit/Loc ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.posGrossProfit * 1000 / financialModel[2]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.posGrossProfit * 1000 / financialModel[5]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.posGrossProfit * 1000 / financialModel[8]?.posLocs, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.posGrossProfit * 1000 / financialModel[11]?.posLocs, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Gross Margin %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.posGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.posGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.posGrossMargin)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.posGrossMargin)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">Annual Retention %</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[2]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[5]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[8]?.posRetention)}</td><td className="text-right py-1.5 px-2">{fmtP(financialModel[11]?.posRetention)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.posLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.posLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.posLTV, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.posLTV, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC ($)</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[2]?.posCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[5]?.posCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[8]?.posCAC, 0)}</td><td className="text-right py-1.5 px-2">{fmtC(financialModel[11]?.posCAC, 0)}</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">LTV/CAC</td><td className="text-right py-1.5 px-2">{financialModel[2]?.posLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[5]?.posLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[8]?.posLTVCAC?.toFixed(1)}x</td><td className="text-right py-1.5 px-2">{financialModel[11]?.posLTVCAC?.toFixed(1)}x</td></tr>
                    <tr className="border-b"><td className="py-1.5 px-2">CAC Payback (mo)</td><td className="text-right py-1.5 px-2">{fmt(financialModel[2]?.posPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[5]?.posPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[8]?.posPayback, 1)}</td><td className="text-right py-1.5 px-2">{fmt(financialModel[11]?.posPayback, 1)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'methodology' && (
          <div className="max-w-4xl space-y-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-4">Methodology: Blended Metrics</h3>
              
              <div className="space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total Locations</h4>
                  <p className="text-gray-600">Total Locations = Core Locations (includes POS customers, as POS is an upsell)</p>
                  <p className="text-gray-500 mt-1">POS Locations are a subset of Core Locations, not additive.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total Revenue</h4>
                  <p className="text-gray-600">Total Net Revenue = Core Net Revenue + POS Net Revenue</p>
                  <p className="text-gray-500 mt-1">Includes payments passthrough revenue in POS.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total ARPA (excl. passthrough)</h4>
                  <p className="text-gray-600">Total ARPA = (Core Net Revenue + POS Sub Revenue + POS Txn Revenue) / Total Locations</p>
                  <p className="text-gray-500 mt-1">Excludes payments passthrough to show true per-location economics.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total Gross Margin</h4>
                  <p className="text-gray-600">Total GM = (Core Gross Profit + POS Gross Profit) / (Core Revenue + POS Revenue excl. passthrough)</p>
                  <p className="text-gray-500 mt-1">Passthrough excluded from denominator as it has ~0% margin.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Blended Annual Retention</h4>
                  <p className="text-gray-600">Blended Monthly Churn = [(Core-only Locs × Core Churn) + (POS Locs × POS Churn)] / Total Locs</p>
                  <p className="text-gray-600 mt-1">Annual Retention = (1 - Monthly Churn)^12</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total LTV</h4>
                  <p className="text-gray-600">Weighted by customer mix:</p>
                  <p className="text-gray-600 mt-1">Total LTV = [(Core-only Locs × Core LTV) + (POS Locs × (Core LTV + POS LTV))] / Total Locs</p>
                  <p className="text-gray-500 mt-1">POS customers generate both Core and POS lifetime value.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total CAC</h4>
                  <p className="text-gray-600">Total CAC = (Core S&M + POS S&M) / Core Activations</p>
                  <p className="text-gray-500 mt-1">All S&M attributed to Core activations since POS is an upsell, not a new customer acquisition.</p>
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Total CAC Payback</h4>
                  <p className="text-gray-600">Weighted average by L3M activations:</p>
                  <p className="text-gray-600 mt-1">Total Payback = (Core Acts × Core Payback + POS Acts × POS Payback) / Total Acts</p>
                  <p className="text-gray-500 mt-1">Ensures Total Payback is always between Core and POS payback values.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">L3M Calculations</h4>
                  <p className="text-gray-600">LTV, CAC, and Payback use Last 3 Month (L3M) averages weighted by location count.</p>
                  <p className="text-gray-500 mt-1">Jan uses 1 month, Feb uses 2 months, Mar+ uses full L3M. Core metrics include Nov/Dec 2025 lookback data.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSFinancialModel;
