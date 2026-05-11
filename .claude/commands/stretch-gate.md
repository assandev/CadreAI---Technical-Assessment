Review the current app state against the MVP checklist.

Decide whether stretch features are allowed.

MVP checklist:
- auth works
- profile creation/edit works
- post creation works
- feed works
- app builds
- deployment path is clear

Return:
1. Stretch allowed: yes/no
2. Evidence
3. If no, what must be fixed first
4. If yes, choose exactly one stretch feature:
   - likes
   - comments
   - follows
5. Smallest implementation plan for that feature

Rules:
- Be conservative.
- Do not implement anything.
- Likes should come before comments.
- Follows should only be considered if feed is already clean and stable.