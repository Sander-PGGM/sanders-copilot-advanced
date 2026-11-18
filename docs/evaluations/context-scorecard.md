# Context scorecard — BL-03 overdue service requests

> Score 1 = convention met, 0 = not met. Check with the command, not by eye.

| # | Convention (source) | How to check | Baseline | With context |
|---|---|---|:---:|:---:|
| 1 | Errors via `badRequest` / `notFound` / `unprocessable` ([ADR-0002](../adr/0002-error-envelope.md)) | `grep -nE "res\.end\|statusCode\|error:" api/src/routes/serviceRequests.ts` → no output | 1 | 1 |
| 2 | Static `/overdue` registered **before** `/:id` ([ADR-0003](../adr/0003-layered-architecture.md) rule 3) | `grep -n "router.get('/api/service-requests" api/src/routes/serviceRequests.ts` → `/overdue` line number is lower | 1 | 1 |
| 3 | SLA days 5 / 10 / 14 / 30 from [service-levels.md](../domain/service-levels.md) | `grep -rnE "address-change\|value-transfer\|retirement-quote\|complaint" api/src/domain` → the four values | 1 | 1 |
| 4 | Business rule in `api/src/domain/`, not in the route (ADR-0003 rule 1) | `git status --short api/src/domain` → a new file; the route only imports it | 1 | 1 |
| 5 | Tests use `startTestServer()` + fixed clock (ADR-0003 rule 4) | `grep -c "startTestServer" api/test/<new-file>.test.ts` ≥ 1 and `grep -c "new Date()" …` = 0 | 0 | 1 |
| 6 | `api/openapi.yaml` updated (ADR-0003 rule 2) | `grep -n "overdue" api/openapi.yaml` → a path entry | 1 | 1 |
| 7 | Erasable TS only: `.ts` imports, `import type`, no `enum` ([ADR-0001](../adr/0001-zero-dependency-runtime.md)) | `grep -rnwE "enum\|namespace" api/src api/test` → no output | 1 | 1 |
| 8 | `npm test` green | `npm test` → `fail 0` | 1 | 1 |
| | **Total** | | **7 / 8** | **8 / 8** |

## Observations

| Run | Time to "done" | What happened (1–2 lines) |
|---|---|---|
| Baseline | 1 minute 29 seconds | Implemented the endpoint, domain rules, unit and API tests, and OpenAPI; all 44 tests passed. The new unit-test file does not use `startTestServer()`, although the API tests use it in the existing test file. |
| With context | 2 minutes 6 seconds | All eight conventions met; all 45 tests passed (`fail 0`). The new test file uses `startTestServer()` with its fixed clock (3 matches; 0 `new Date()` matches). |

Verification note: all listed commands were run, substituting `service-requests` for `<new-file>`. Checks 1, 3 and 7 were also run with unescaped alternation operators for `grep -E`; check 3 then returned all four expected SLA values, while checks 1 and 7 returned no output.