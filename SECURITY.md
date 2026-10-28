# Security Policy

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues,
pull requests or discussions.

Instead, send an e-mail to info@fit.fraunhofer.de. Include as much of the
following as you can:

* A description of the vulnerability and its potential impact
* The affected component (for example a route, server action, database
  migration or row level security policy)
* Steps to reproduce, ideally with a minimal proof of concept
* The version or commit you tested against
* Any suggested fix or mitigation

We will acknowledge your report, investigate it and keep you informed about
the progress. Please give us reasonable time to release a fix before you
disclose the issue publicly.

## Supported Versions

Security fixes are applied to the latest state of the `main` branch. Older
versions or forks are not supported.

## Scope

This policy covers the code in this repository. Vulnerabilities in third-party
dependencies or services (for example Supabase or Next.js) should be reported
to the respective project. If such an issue affects news-flow in a specific
way, we still appreciate a report.

For background on how authentication, roles and row level security are set up,
see [docs/security-auth-rls.md](docs/security-auth-rls.md).
