# Agent Rules — Hard Constraints

These rules are non-negotiable. Any agent (human or AI) operating in this repo
must follow them at all times.

---

## 1. Containment

- All file operations **must remain inside the repo root** (`ops-lab/`).
- **No absolute paths allowed** — always use paths relative to repo root.
- No writes outside repo root, ever.

## 2. Git Discipline

- **All changes must be committed via git.** No loose, uncommitted work left behind.
- Every commit message must describe *what* changed and *why*.

## 3. No Duplicates or Shadow Copies

- Never create files named `*_v2`, `new_*`, `final_*`, `backup_*`, `copy of *`, etc.
- If replacing something, **modify the original** or create a clearly named new
  module and **delete/retire the old one in the same PR**.
- Never create duplicate directories.

## 4. Always List Before Writing

- Before modifying any file, **list the files to be modified** explicitly.
- No silent writes.

## 5. No Destructive Commands

- No destructive shell commands (`rm -rf`, `truncate`, `dd`, etc.) unless
  **explicitly requested** by the operator.

---

# Decision Discipline — Pre-Flight Checklist

Before writing *anything*, the agent must complete all of the following:

## A. Orient

```bash
pwd
ls
find . -maxdepth 2 -type f | sort
```

Know where you are. Know what exists.

## B. Search Before Creating

Before adding any file or function:

```bash
rg -n "keyword|name|function"
```

Confirm it doesn't already exist. If it does, modify in place — don't duplicate.

## C. Plan First (for anything > 3 steps)

1. Write a plan.
2. List the **exact files** to modify or create.
3. State **why** each file is needed.
4. Get approval before executing.

## D. Repo-Root-Only Enforcement

- No absolute paths.
- No writes outside repo root.
- Validate with `pwd` if uncertain.

## E. Validate Before Commit

- Run the repo's test command(s) inside Docker:
  ```bash
  docker compose run --rm app npm test
  ```
- If tests don't exist yet, create a minimal smoke test or sanity-check script
  before committing.

## F. Changelog Note

- Update `notes/CHANGELOG.md` (or the PR description) with:
  - **What** changed
  - **Why** it changed
  - Timestamp (ISO 8601)
