# Warp Agent Action — Quick Reference

Notes for using Warp agents in GitHub Actions workflows.

---

## Requirements

1. **WARP_API_KEY** stored as a GitHub Actions secret
   - Settings → Secrets and variables → Actions → New repository secret
   - Name: `WARP_API_KEY`
   - Value: Your Warp API key

2. **Workflow permissions** matching your intended actions:
   - `contents: read` — to read repo files
   - `pull-requests: write` — to comment on PRs
   - `issues: write` — to comment on issues

---

## Basic Usage

```yaml
- name: Run Warp Agent
  uses: warpdotdev/warp-agent-action@main
  with:
    warp_api_key: ${{ secrets.WARP_API_KEY }}
    prompt: |
      Review the code changes and post feedback.
```

---

## Common Patterns

### PR Review
```yaml
on:
  pull_request:
    types: [opened, ready_for_review, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: warpdotdev/warp-agent-action@main
        with:
          warp_api_key: ${{ secrets.WARP_API_KEY }}
          prompt: |
            Review the PR and post inline suggestions.
```

### Respond to Comments
Trigger on `@warpdotdev` mentions in PR/issue comments.

### Fix Failing CI
Trigger when a workflow fails, attempt automated fix.

---

## Output

Access agent output in subsequent steps:
```yaml
steps.<step_id>.outputs.agent_output
```

For structured output:
```yaml
with:
  output_format: json
```

---

## Debugging

Enable session sharing for live debugging:
```yaml
with:
  share: true
```

This posts a link to inspect the agent's execution.

---

## More Info

- [warp-agent-action repo](https://github.com/warpdotdev/warp-agent-action)
- [Warp docs](https://docs.warp.dev)
