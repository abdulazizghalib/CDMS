# Project TODO

- [x] Build Arabic RTL dealership dashboard shell with navy, teal, gold, and white design system.
- [x] Add persistent desktop sidebar navigation and top bar with search, notifications, branch selector, and user menu.
- [x] Add dashboard KPIs for inventory value, available cars, sales, profit, reservations, follow-ups, and alerts.
- [x] Add searchable and filterable vehicle inventory with photo cards, specifications, statuses, costs, sale prices, and expected profit.
- [x] Add vehicle-detail workspace with gallery, specifications, documents, expenses, activity history, reserve action, and share-offer action.
- [x] Add sales and contracts workflow views for leads, quotations, reservations, contracts, invoices, deposits, installments, delivery, and collections.
- [x] Add customer CRM views with profiles, interested vehicles, notes, appointments, and follow-up stages.
- [x] Add purchases, suppliers, and vehicle-preparation expense views with per-vehicle cost tracking.
- [x] Add financial and operational reports for profitability, inventory turnover, sales, receivables, expenses, and income summary.
- [x] Add users, branches, roles, permissions, and activity auditing screens.
- [x] Add authorized administrator logo upload, replace, preview, remove, and persisted branding behavior.
- [x] Add responsive behavior and accessible interaction states for the desktop dashboard.
- [x] Add or update Vitest coverage for the implemented feature behavior.
- [x] Verify the final UI with screenshots and run checks/tests before checkpoint.

## Follow-up implementation gaps

- [x] Implement a real branch selector in the top bar and wire it to dashboard state.
- [x] Wire inventory filters to actual filtering logic and expose full vehicle record fields.
- [x] Build the vehicle-detail workspace with gallery, specifications, documents, expenses, activity history, reserve, and share-offer actions.
- [x] Replace placeholder sales, customers, purchases, expenses, and reports screens with real views and interactions.
- [ ] Implement real users, branches, roles, permissions, and audit screens instead of static summary cards.
- [ ] Move logo management to an authenticated admin-only server/storage flow with persisted branding across sessions.
- [ ] Ensure Vitest discovery runs the new feature tests and add coverage for inventory, logo settings, and navigation states.

## Remaining behavior improvements

- [x] Wire the selected branch into dashboard and inventory data state.
- [x] Replace static mock table actions with functional local state flows for sales, CRM, purchases, expenses, and reports.
- [x] Add Vitest coverage for logo persistence and branch/navigation state.

## Oracle migration and legacy business requirements

- [x] Inspect the attached Oracle dump metadata without importing or modifying any database.
- [x] Document legacy business entities, workflows, reports, and reference data from the dump.
- [x] Map legacy entities and business rules to the new dealership dashboard modules.
- [x] Define an Oracle integration architecture and read-only discovery/migration plan.
- [x] Add Oracle connection configuration through secure environment variables only after user provides host, port, service name, and credentials.
- [x] Implement a safe Oracle adapter and migration validation workflow without destructive writes.
- [ ] Test the Oracle integration against a non-production schema before enabling production writes.
- [x] Create a concrete legacy-to-new mapping matrix linking Oracle tables, views, triggers, and business rules to dashboard modules and screens.

## Local Oracle development mode

- [x] Configure local Oracle development target as 127.0.0.1:1521/ORCL without changing production connection settings.
- [ ] Re-run the lightweight Oracle DUAL connectivity test against the local target.
- [x] Document that localhost works only when the app runs on the same machine as Oracle or through a local tunnel.

## Local Oracle access confirmed by user

- [x] Configure an execution path where the application runs on the same machine as Oracle ORCL or through an approved secure tunnel.
- [ ] Run the Oracle DUAL connectivity test from that same machine and capture the result.
- [ ] Extract and review the ORCL TNS connect descriptor before enabling application reads.

## Local desktop execution

- [x] Add a local Oracle configuration example for 127.0.0.1:1521/ORCL without committing secrets.
- [x] Add a local startup guide for running the web app beside Oracle Listener.
- [x] Keep cloud deployment configuration isolated from local Oracle settings.

## Local/cloud Oracle isolation

- [x] Add an explicit local-only Oracle configuration guard based on runtime environment.
- [x] Add a safe cloud fallback when Oracle is unavailable and prevent hosted use of 127.0.0.1.
- [x] Add a test proving localhost Oracle settings are rejected in hosted/production runtime.

## Oracle validation hardening

- [x] Implement read-only Oracle schema discovery for tables, views, columns, and triggers.
- [x] Implement non-destructive mapping verification against the legacy-to-new matrix.
- [x] Separate local Oracle configuration from managed cloud secrets.
- [x] Add graceful hosted fallback when Oracle is unavailable instead of throwing from application flows.
- [x] Expand Oracle mapping verification to cover the full legacy matrix, including tables, views, triggers, and preserved business rules.
- [x] Add tests proving the full matrix is consumed by the Oracle validation verifier.

## Final Oracle hardening gaps

- [x] Wire Oracle availability status into actual application/router flows with clear disabled-state responses.
- [x] Expand the legacy verifier to include every documented table, view, trigger family, sequence, and rule pattern.
- [x] Add a source-of-truth legacy matrix module and tests that compare verifier coverage to the documented matrix.

## Oracle configuration and matrix alignment hardening

- [x] Use separate LOCAL_ORACLE_* variables for local runtime and ORACLE_* variables only for production runtime.
- [x] Add a test proving production ignores LOCAL_ORACLE_* and local runtime ignores hosted ORACLE_* values.
- [x] Add an in-project legacy matrix document generated from the source-of-truth matrix.
- [x] Add a drift test that fails when the documented legacy matrix and source matrix diverge.

## Oracle isolation and documentation rigor

- [x] Add explicit local-only runtime configuration resolution and document that managed ORACLE_* values must not be used for localhost development.
- [x] Add unit coverage proving development resolves LOCAL_ORACLE_* while production resolves ORACLE_*.
- [x] Generate the in-project legacy matrix markdown from the TypeScript source of truth.
- [x] Strengthen matrix drift tests to compare normalized object, trigger, sequence, and rule sets bidirectionally.

## Final documentation and drift checks

- [x] Explicitly document that localhost development must use LOCAL_ORACLE_* only and managed ORACLE_* must never point to 127.0.0.1.
- [x] Replace the matrix drift test with normalized bidirectional comparison of every documented section.

## Project delivery package

- [x] Create a complete source ZIP excluding node_modules, build output, logs, secrets, and local caches.
- [x] Verify the ZIP contains the local Oracle setup guide, environment example, scripts, and source code.

## Package verification correction

- [x] Rebuild ZIP including .env.local.example while excluding real secret files.
- [x] Exclude and verify local cache directories such as .vite, coverage, and temporary build caches.
- [x] Confirm package contents after the corrected build.

## Windows PowerShell setup

- [x] Document the PowerShell execution-policy workaround and Windows pnpm command aliases.
- [x] Document PowerShell syntax for LOCAL_ORACLE_* environment variables.
- [x] Verify local startup and Oracle check commands on the user's Windows machine.

## Windows and Oracle runtime corrections

- [x] Make package scripts cross-platform so `pnpm.cmd dev` works on Windows.
- [x] Document the PowerShell form for setting local Oracle variables.
- [ ] Re-run the local Oracle check with credentials that successfully log in through the ORCL service.
- [x] Verify the development server starts successfully on Windows.

## Windows documentation correction

- [x] Add a checked-in PowerShell section with pnpm.cmd and LOCAL_ORACLE_* commands.
- [x] Rebuild and verify the ZIP includes the updated Windows documentation.

## Windows local run follow-up

- [x] Remove or guard analytics placeholder requests when local analytics variables are unavailable.
- [x] Document that local Manus OAuth variables are required for authenticated local login, while the dashboard server can still start.
- [x] Improve Oracle check error output for invalid credentials and service mismatch without exposing passwords.

## Windows path correction

- [ ] Document that commands must run inside the nested car-dealer-management folder containing package.json.
- [ ] Confirm the user can find package.json and scripts/check-oracle-local.mjs before rerunning commands.

## Purchases module

- [x] Define purchase records and purchase line/detail fields in the data model.
- [x] Add server procedures for listing and creating purchase records with validation.
- [x] Add a complete Arabic RTL purchases screen with search, filters, summary cards, and data table.
- [x] Add an add-purchase form for supplier, vehicle, purchase cost, preparation cost, payment, and notes.
- [x] Validate purchase calculations and UI flows with Vitest and browser verification.

## Purchases verification gaps

- [x] Add real purchases filters for status, payment status, branch, and source type.
- [ ] Add UI-focused tests for opening the purchase form, validation, submission, and rendering the saved record.
- [x] Perform browser verification of the purchases tab and add-purchase flow, then document the result.

## Branded login-first screen

- [x] Add pure auth-gate helpers that decide the splash, login, and workspace surfaces.
- [x] Detect missing Manus OAuth environment variables and surface a clear Arabic message instead of an opaque navigation error.
- [x] Add a branded Arabic RTL login screen matching the dealership navy, gold, and teal design system.
- [x] Add a branded splash shown while the session is still being resolved.
- [x] Wire the auth gate into the app shell so the login screen is the first surface a visitor sees and protected queries only fire once authenticated.
- [x] Cover the auth-gate and login-readiness logic with Vitest.
- [x] Verify the type check, Vitest suite, and production build all pass.

## Login-first local fallback

- [x] Never dead-end on the Manus login screen when Manus OAuth is not configured.
- [x] Fall through to the Oracle workspace (its own operation login) for offline/local development.
- [x] Guard the 401 auto-redirect so it only navigates when OAuth can actually start.
- [x] Document the optional Manus OAuth variables in `.env.local` and the local setup guide.
- [x] Cover the fallback surface resolution with Vitest.

## Dealer operator login screen (first screen)

- [x] Add a pure `resolveDealerLogin` resolver for the operator session state.
- [x] Build a full-screen, branded Arabic login screen for the workspace operator login (Oracle `APP_USERS`).
- [x] Support first-run bootstrap of the initial administrator from the same screen.
- [x] Make the operator login the first screen of the system in Oracle mode, before any workspace data renders.
- [x] Wire login/logout to the existing `oracleOperations.session/login/bootstrap` procedures and invalidate the session on success.
- [x] Reuse shared brand pane/glows/styles across both login surfaces.
- [x] Cover the operator login gate with Vitest and verify type check, tests, and build.
