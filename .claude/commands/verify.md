Use the qa-reviewer agent.

Run the available build checks and inspect the MVP flow.

Verify:
- auth flow exists
- profile flow exists
- post creation exists
- feed displays posts
- feed displays author information
- Supabase environment variables are documented
- deployment blockers are identified

Return:
1. Blockers
2. Important fixes
3. Nice-to-have
4. Commands run
5. Recommended next action

Rules:
- Do not implement fixes.
- Do not rewrite code.
- Prioritize issues that block demo or deploy.