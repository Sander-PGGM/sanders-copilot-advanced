import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/database.ts';
import { ContributionRepository } from '../src/repositories/contributionRepository.ts';
import { startTestServer } from './helpers.ts';

describe('Employer contribution repository', () => {
  test('sums E-200 recorded contributions for 2025', () => {
    const db = createDatabase();
    try {
      assert.deepEqual(new ContributionRepository(db).summarizeByEmployer('E-200', 2025), {
        employerContribution: 33902.39, employeeContribution: 22601.59, memberCount: 3,
      });
    } finally { db.close(); }
  });

  test('returns zeros for a year without rows and an unknown employer', () => {
    const db = createDatabase();
    try {
      const repository = new ContributionRepository(db);
      const zeros = { employerContribution: 0, employeeContribution: 0, memberCount: 0 };
      assert.deepEqual(repository.summarizeByEmployer('E-200', 1), zeros);
      assert.deepEqual(repository.summarizeByEmployer('E-9999', 2025), zeros);
    } finally { db.close(); }
  });

  test('uses stored amounts, isolates employer and year, and counts zero-valued history rows', () => {
    const db = createDatabase();
    try {
      db.prepare(`
        INSERT INTO contributions
          (member_id, year, full_time_salary, part_time_factor, pensionable_salary,
           accrual, employer_contribution, employee_contribution)
        SELECT id, 2099, 0, 1, 0, 0, 1.11, 2.22 FROM members WHERE employer_id = ?
      `).run('E-200');
      db.prepare(`
        UPDATE contributions SET employer_contribution = 0, employee_contribution = 0
        WHERE year = 2099 AND member_id = (SELECT MIN(id) FROM members WHERE employer_id = ?)
      `).run('E-200');
      const repository = new ContributionRepository(db);
      assert.deepEqual(repository.summarizeByEmployer('E-200', 2099), {
        employerContribution: 2.22, employeeContribution: 4.44, memberCount: 3,
      });
      assert.deepEqual(repository.summarizeByEmployer('E-200', 2025), {
        employerContribution: 33902.39, employeeContribution: 22601.59, memberCount: 3,
      });
    } finally { db.close(); }
  });
});

describe('Employer contributions API', () => {
  let api: Awaited<ReturnType<typeof startTestServer>>;
  before(async () => { api = await startTestServer(); });
  after(async () => { await api.close(); });

  test('returns the exact E-200/2025 contribution summary', async () => {
    const res = await api.get('/api/employers/E-200/contributions?year=2025');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      employerId: 'E-200', year: 2025,
      employerContribution: 33902.39, employeeContribution: 22601.59, memberCount: 3,
    });
  });

  test('returns zeros for years without rows, including year boundaries', async () => {
    for (const year of ['0001', '9999']) {
      const res = await api.get(`/api/employers/E-200/contributions?year=${year}`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        employerId: 'E-200', year: Number(year),
        employerContribution: 0, employeeContribution: 0, memberCount: 0,
      });
    }
  });

  test('rejects a year with a trailing line break', async () => {
    const res = await api.get('/api/employers/E-200/contributions?year=2025%0A');
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), {
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid employer contributions query',
        details: ['year must be supplied once as a four-digit integer between 0001 and 9999'],
      },
    });
  });

  test('returns the standard 404 envelope for an unknown employer', async () => {
    const res = await api.get('/api/employers/E-9999/contributions?year=2025');
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), {
      error: { code: 'NOT_FOUND', message: 'Employer E-9999 not found' },
    });
  });

  test('rejects missing, malformed, out-of-range and repeated years with the 400 envelope', async () => {
    for (const query of [
      '', '?year=', '?year=0000', '?year=10000', '?year=25', '?year=-2025',
      '?year=2025.5', '?year=2e3', '?year=abcd', '?year=%202025',
      '?year=2025&year=2025',
    ]) {
      const res = await api.get(`/api/employers/E-200/contributions${query}`);
      assert.equal(res.status, 400, query);
      assert.deepEqual(await res.json(), {
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid employer contributions query',
          details: ['year must be supplied once as a four-digit integer between 0001 and 9999'],
        },
      });
    }
  });
});
