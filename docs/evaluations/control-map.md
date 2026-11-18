# Control map — GitHub Copilot in our organisation

Status: ✅ enforced · ⚠️ available but not set · ❓ unknown · 🔒 can't see (admin only)

| Layer | Control | Owner | Status |
|---|---|---|---|
| ① GitHub AI controls | Copilot features (chat, agents, cloud agent, code review) | Organisation/enterprise Copilot administrator — individual ❓ unknown | ✅ managed feature policy observed: IDE chat, IDE agent mode, Copilot in the cloud (replacement for the previous Cloud Agent policy) and code review enabled |
| ① GitHub AI controls | Model availability + "Default availability" for new models | Organisation/enterprise Copilot administrator — individual ❓ unknown | ✅ per-model enabled/disabled policy observed; ❓ "Default availability" for new models not shown |
| ① GitHub AI controls | MCP servers in Copilot policy | Organisation/enterprise Copilot administrator — individual ❓ unknown | ✅ MCP servers in Copilot enabled by managed policy; ❓ server-specific restrictions not shown |
| ① GitHub AI controls | Content exclusion | ❓ unknown — confirm with organisation/enterprise Copilot administrator | ❓ unknown — exclusion configuration not inspected |
| ① GitHub AI controls | Audit log (agent actions) | ❓ unknown — confirm with organisation/enterprise audit administrator | ❓ unknown — audit access and agent-action coverage not verified |
| ② Enterprise-managed settings | `permissions` / `sandbox` | ❓ unknown — confirm with enterprise developer-tooling administrator | ⚠️ available but not set in this snapshot — no active managed settings; no enterprise-required Agent Host sandbox |
| ② Enterprise-managed settings | Default `model` / `fusionTier` | ❓ unknown — confirm with enterprise developer-tooling administrator | ⚠️ available but not set in this snapshot — no managed keys reported by VS Code or the Copilot runtime |
| ② Enterprise-managed settings | MCP allow / deny lists | ❓ unknown — confirm with enterprise developer-tooling administrator | ⚠️ available but not set in this snapshot — no managed MCP lists |
| ③ VS Code device policies | ChatAgentMode · ChatToolsAutoApprove · ChatMCP | ❓ unknown — confirm with device-management administrator | ⚠️ available but not set — all three are in the non-applied policy inventory; this does not establish their current user-setting values |
| Repository | preToolUse guardrail hook (`.github/hooks/`) — Step 4 | me (this lab) | ⚠️ available but not set — no `.github/hooks/` directory in this worktree |
| Repository | Branch ruleset on `main` — Step 5 | me (this lab) | ❓ unknown — rulesets API returned HTTP 403 with a plan/visibility restriction |
| Repository | CI check `Test` (`.github/workflows/ci.yml`) | ❓ unknown — confirm with repository maintainers | ✅ configured and latest `main` CI run passed; required-check enforcement is ❓ unknown |

## Evidence and gaps

- Assessed on 2026-11-18 using the supplied **VS Code Policy Diagnostics** report generated at 09:32:35 UTC and the supplied organisation-managed GitHub Copilot settings-page text. Individual control owners were not supplied; administrator roles identify responsibilities to confirm, not named assignments. Only relevant policy findings are recorded here, not raw reports or account, authentication and usage details.
- The settings page shows IDE chat, IDE agent mode, Copilot in the cloud, code review and MCP servers enabled. It explicitly describes Copilot in the cloud as replacing the previous GitHub Chat, Mobile Chat and Cloud Agent policies. Here, ✅ for an enabled policy means centrally configured availability, not mandatory feature use or proof of a successful agent run.
- Both web-search options are disabled. Editor preview features, CLI and bring-your-own-model-key support are enabled. These are additional observed feature settings, not evidence that every tool or external connection is allowed.
- Per-model policy is visible: examples enabled include Claude Haiku 4.5/5.5, Claude Opus 5/5.5, Claude Sonnet 5/5.5, GPT-5.6 Luna/Sol, GPT-6 Astra/Luna/Sol, GPT-6.1 Sol/Terra and MAI-Code-1.1-Flash. Examples disabled include Claude Fable 5/5.1/5.2, the listed Gemini models, GPT-6.2 Astra/Sol, MAI Code 2/2 Flash and Kimi K3. This is a snapshot, not an exhaustive or permanent allowlist. GPT-5.3-Codex is not listed in the supplied settings excerpt; its policy cannot be inferred from that omission.
- "Default availability" for future models is not shown and remains unknown. Observed model availability does not establish a managed default model or `fusionTier`.
- Account diagnostics also report `chat_enabled: true`, `chat_agent_enabled: true` and `mcp: true`, consistent with the settings page. Account availability alone does not establish organisation-wide server restrictions.
- The account policy gate is inactive because no approved organisations are configured. This does not disable account policies: the report explicitly says policies behave as account data dictates.
- Managed settings have no active sources, zero supplied/effective keys and zero parse issues. The Copilot runtime snapshot also reports `source: none` and no managed keys. The server managed-settings channel has never fetched a response; this snapshot is not proof that no central configuration exists elsewhere.
- `ChatAgentMode`, `ChatToolsAutoApprove` and `ChatMCP` are listed as non-applied policies, not enforced restrictions. In particular, absence of `ChatToolsAutoApprove` policy does not prove automatic tool approval is enabled or disabled.
- The only applied policy is account-sourced `CopilotSessionSync`: `chat.sessionSync.enabled` is enforced as `false`. This is not a device-management policy.
- Chat harness selection is **not enforced**, and no enterprise-required Agent Host sandbox is active. These observations do not establish that sandboxing is disabled or that session-specific permissions are unrestricted. The readiness check does not cover remote hosts or other agent providers, and the runtime snapshot excludes session-specific client contributions.
- Enterprise administration settings were not inspected. Content-exclusion configuration, audit-log coverage, server-specific MCP restrictions and individual owners remain unverified. Unknown entries do not mean disabled or unset; admin-only access was not established.
- No `.github/hooks/` directory exists in this worktree. This observation concerns the repository hook only, not hooks supplied at other scopes.
- `gh api repos/Sander-PGGM/sanders-copilot-advanced/rulesets` failed with HTTP 403: "Upgrade to GitHub Pro or make this repository public to enable this feature." This does not establish whether other branch-protection controls exist.
- [CI workflow](../../.github/workflows/ci.yml) defines the `Test` job for pushes to `main`, pull requests and manual dispatch. The [latest main CI run inspected](https://github.com/Sander-PGGM/sanders-copilot-advanced/actions/runs/44271397485) completed successfully. A passing workflow does not establish that merging requires it.
