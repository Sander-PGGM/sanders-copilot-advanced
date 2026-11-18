import type { Router } from '../http/router.ts';
import { badRequest, notFound } from '../http/errors.ts';
import type { EmployerRepository } from '../repositories/employerRepository.ts';
import type { MemberRepository } from '../repositories/memberRepository.ts';
import type { ContributionRepository } from '../repositories/contributionRepository.ts';

export function registerEmployerRoutes(router: Router, deps: {
  employers: EmployerRepository;
  members: MemberRepository;
  contributions: ContributionRepository;
}): void {
  router.get('/api/employers', () => ({ body: deps.employers.list() }));

  router.get('/api/employers/:id/contributions', ({ params, query }) => {
    const years = query.getAll('year');
    const problems: string[] = [];
    if (years.length !== 1 || !/^(?!0000)[0-9]{4}(?![\s\S])/.test(years[0])) {
      problems.push('year must be supplied once as a four-digit integer between 0001 and 9999');
    }
    if (problems.length) throw badRequest('Invalid employer contributions query', problems);
    if (!deps.employers.findById(params.id)) throw notFound(`Employer ${params.id}`);
    const year = Number(years[0]);
    return { body: { employerId: params.id, year, ...deps.contributions.summarizeByEmployer(params.id, year) } };
  });

  router.get('/api/employers/:id', ({ params }) => {
    const employer = deps.employers.findById(params.id);
    if (!employer) throw notFound(`Employer ${params.id}`);
    const memberCount = deps.members.list({ employerId: employer.id }).length;
    return { body: { ...employer, memberCount } };
  });
}
