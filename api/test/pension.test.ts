import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, annualAccrual, contributionSplit, pensionableSalary, projectPension } from '../src/domain/pension.ts';

test('pensionable salary subtracts the franchise', () => {
  assert.equal(pensionableSalary(52_000, 1), 34_455);
});

test('pensionable salary applies the part-time factor', () => {
  assert.equal(pensionableSalary(46_000, 0.6), 17_073);
});

test('pensionable salary is capped at the salary cap', () => {
  assert.equal(pensionableSalary(150_000, 1), 120_255);
});

test('pensionable salary is never negative (salary below franchise)', () => {
  assert.equal(pensionableSalary(16_000, 0.9), 0);
});

test('pensionable salary rejects invalid part-time factors', () => {
  assert.throws(() => pensionableSalary(40_000, 0), RangeError);
  assert.throws(() => pensionableSalary(40_000, 1.2), RangeError);
});

test('annual accrual is 1.75% of pensionable salary', () => {
  assert.equal(annualAccrual(34_455), 602.96);
});

test('contribution split is 60% employer / 40% employee', () => {
  assert.deepEqual(contributionSplit(10_000), { total: 2_700, employer: 1_620, employee: 1_080 });
});

test('age is calculated in whole years', () => {
  assert.equal(ageOn('1972-04-15', '2026-11-18'), 54);
  assert.equal(ageOn('1979-12-20', '2026-11-18'), 46);
});

test('projection at the standard retirement age adds future accrual', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  });
  assert.equal(result.yearsToRetirement, 14);
  assert.equal(result.futureAccrual, 8_441.44);
  assert.equal(result.earlyRetirementReduction, 0);
  assert.equal(result.unreducedAnnualPension, 13_441.44);
  assert.equal(result.projectedAnnualPension, 13_441.44);
  assert.equal(result.retirementDate, '2040-04-15');
});

test('R5 projection stops accrual at 63 and reduces the whole pension', () => {
  const result = projectPension({
    birthDate: '1966-06-30', fullTimeSalary: 98_000, partTimeFactor: 0.8,
    accruedToDate: 10_423.70, asOf: '2026-11-18', retirementAge: 63,
  });
  assert.equal(result.retirementDate, '2029-06-30');
  assert.equal(result.yearsToRetirement, 3);
  assert.equal(result.futureAccrual, 3_379.11);
  assert.equal(result.unreducedAnnualPension, 13_802.81);
  assert.equal(result.earlyRetirementReduction, 0.325);
  assert.equal(result.projectedAnnualPension, 9_316.90);
});

test('R5 accepts ages 60 and 68 and rejects out-of-range and non-integer ages', () => {
  const input = {
    birthDate: '1980-01-01', fullTimeSalary: 52_000, partTimeFactor: 1,
    accruedToDate: 5_000, asOf: '2026-11-18',
  };
  assert.equal(projectPension({ ...input, retirementAge: 60 }).earlyRetirementReduction, 0.52);
  assert.equal(projectPension({ ...input, retirementAge: 68 }).earlyRetirementReduction, 0);
  for (const retirementAge of [59, 69, 60.5]) {
    assert.throws(() => projectPension({ ...input, retirementAge }), /retirementAge must be an integer between 60 and 68/);
  }
});

test('R5 accepts current age even after the birthday and rejects ages below it', () => {
  const input = {
    birthDate: '1963-06-30', fullTimeSalary: 52_000, partTimeFactor: 1,
    accruedToDate: 5_000, asOf: '2026-11-18',
  };
  const result = projectPension({ ...input, retirementAge: 63 });
  assert.equal(result.yearsToRetirement, 0);
  assert.equal(result.futureAccrual, 0);
  assert.equal(result.retirementDate, '2026-06-30');
  assert.equal(result.unreducedAnnualPension, 5_000);
  assert.equal(result.projectedAnnualPension, 3_375);
  assert.throws(() => projectPension({ ...input, retirementAge: 62 }), /below current age/);
  assert.throws(() => projectPension({ ...input, birthDate: '1957-06-30' }), /below current age/);
});

test('R5 applies salary growth only to years before early retirement', () => {
  const result = projectPension({
    birthDate: '1969-04-15', fullTimeSalary: 52_000, partTimeFactor: 1,
    accruedToDate: 5_000, asOf: '2026-11-18', retirementAge: 60, salaryGrowthRate: 0.02,
  });
  assert.equal(result.yearsToRetirement, 3);
  assert.equal(result.futureAccrual, 1_863.85);
  assert.equal(result.unreducedAnnualPension, 6_863.85);
  assert.equal(result.earlyRetirementReduction, 0.52);
  assert.equal(result.projectedAnnualPension, 3_294.65);
});
