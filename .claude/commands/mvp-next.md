Read plan.md, CLAUDE.md, and the current repository state.

Determine the next highest-impact MVP task.

Return:
1. Current phase
2. What is already done
3. The next task to implement
4. Files likely involved
5. Acceptance criteria
6. Suggested agent to use

Rules:
- Do not write code unless I explicitly ask.
- Do not suggest stretch features.
- Favor the smallest step that moves the app toward:
  auth → profile → post → feed → deploy.