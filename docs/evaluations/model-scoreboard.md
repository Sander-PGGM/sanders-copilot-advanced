# Model scorecard — rule R1 (pensionableSalary)

> One run is a sample, not a benchmark. Synthetic data only — never paste secrets or real member data.

| | Model A | Model B |
|---|---|---|
| Model (name as shown in the picker) | GPT-5.3-Codex | MAI-Code-1.1-Flash |
| Harness · Mode · Permissions | Copilot · Interactive · Manual | Copilot · Interactive · Manual |
| Reasoning effort | Not reported | Not reported |
| Date | Evaluated 2026-11-18; original run date not reported | Evaluated 2026-11-18; original run date not reported |

Evaluation uses the supplied answers and latency observations. Harness, mode and permissions above are the template settings, not independently confirmed for these runs.

## Scores

| Criterion | How to score | Model A | Model B |
|---|---|---|---|
| Correctness verified | Expected values that match the `node -e` output (x / 5) | 4/5 | 5/5 |
| Edge cases found | Which did it cover? franchise boundary · salary cap · part-time · below franchise → 0 · invalid factor (0 or > 1) · negative salary | Near franchise / half-cent rounding (wrong expected value); above salary cap; part-time; below franchise → 0; invalid factor 0; negative salary. No exact franchise boundary or factor > 1. | Exact franchise boundary; exact salary cap (not above it); part-time; invalid factor 0; negative salary. No below-franchise case or factor > 1. Part-time row is an ordinary valid example, not a boundary. |
| Hallucinations | Invented functions, parameters, files or rules? List them (none = 👍) | None; one numerical error, detailed below | None |
| Latency feel | fast / ok / slow | slow (user-reported) | ok (user-reported) |
| Cost / credits | Relative cost of the model (supported-models doc) — heavier model = more AI credits | Not measured; no usage or pricing evidence supplied | Not measured; no usage or pricing evidence supplied |

Both explanations match the implementation's validation and formula. Model A's rounding example is numerically incorrect, not an invented API or rule. Actual credits cannot be inferred from perceived speed or model name; consult the [supported-models documentation](https://docs.github.com/en/copilot/reference/ai-models/supported-models) and billing/usage records.

## Per-example verification

| Model | # | fullTimeSalary | partTimeFactor | Model expected | Actual result | Match |
|---|---|---|---|---|---|---|
| A | 1 | -0.01 | 1 | RangeError: fullTimeSalary must be a non-negative number | RangeError: fullTimeSalary must be a non-negative number | ✅ |
| A | 2 | 50000 | 0 | RangeError: partTimeFactor must be greater than 0 and at most 1 | RangeError: partTimeFactor must be greater than 0 and at most 1 | ✅ |
| A | 3 | 0 | 1 | 0 | 0 | ✅ |
| A | 4 | 17545.01 | 0.5 | 0.01 | 0 | ❌ |
| A | 5 | 200000 | 1 | 120255 | 120255 | ✅ |
| B | 1 | 17545 | 1 | 0 | 0 | ✅ |
| B | 2 | 100000 | 0.5 | 41227.5 | 41227.5 | ✅ |
| B | 3 | 137800 | 1 | 120255 | 120255 | ✅ |
| B | 4 | -1 | 0.5 | RangeError: fullTimeSalary must be a non-negative number | RangeError: fullTimeSalary must be a non-negative number | ✅ |
| B | 5 | 100000 | 0 | RangeError: partTimeFactor must be greater than 0 and at most 1 | RangeError: partTimeFactor must be greater than 0 and at most 1 | ✅ |

Model A's fourth case is mathematically a half-cent, but JavaScript evaluates `(17545.01 - 17545) * 0.5` slightly below `0.005`. The current `roundMoney` implementation therefore returns `0`. This scores the actual code behavior, not ideal decimal arithmetic; no implementation changes were made.

## Verification output

Command run from the repository root with Node v24.22.3:

```bash
node -e "import('./api/src/domain/pension.ts').then(m=>{for (const [model,cases] of [['Model A', [[-0.01,1],[50000,0],[0,1],[17545.01,0.5],[200000,1]]],['Model B', [[17545,1],[100000,0.5],[137800,1],[-1,0.5],[100000,0]]]]) {console.log(model); for (const [s,f] of cases) {try{console.log(s,f,m.pensionableSalary(s,f))}catch(e){if (!(e instanceof RangeError)) throw e; console.log(s,f,e.name+': '+e.message)}}}})"
```

Result: completed successfully; all ten actual results are recorded below.

```text
Model A
-0.01 1 RangeError: fullTimeSalary must be a non-negative number
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
0 1 0
17545.01 0.5 0
200000 1 120255
Model B
17545 1 0
100000 0.5 41227.5
137800 1 120255
-1 0.5 RangeError: fullTimeSalary must be a non-negative number
100000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
```

## Verdict

- For **this kind of task** I would use: **MAI-Code-1.1-Flash**, provisionally, based on this sample.
- Because: all five expected outputs matched the real function, and latency felt ok rather than slow. GPT-5.3-Codex selected a useful rounding edge case but got its exact result wrong. Model B's 5/5 does not establish better overall edge-case coverage: it did not test above-cap clamping or below-franchise clamping.
- Would I trust it **without** the `node -e` check? **No** — exact money outputs need execution-based verification; plausible decimal reasoning missed JavaScript floating-point behavior here.
- To make this a real benchmark I would need: repeated independent runs with identical prompts, context, effort and permissions; a shared hidden test set covering boundaries, rounding and non-finite inputs; measured latency and actual credit usage; and separate scores for correctness and edge-case coverage.