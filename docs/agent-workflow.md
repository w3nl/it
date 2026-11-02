# The agent workflow: from idea to pull request

Ideas for *Hello, IT* go through a small team of AI agents (Claude, running in GitHub Actions). You stay in charge at two points: **approving the plan** and **merging the pull request**.

```
 You            Refine agent        You             Build agent          Review + Playtest agents     You
 ───            ────────────        ───             ───────────          ────────────────────────     ───
 Open an   ──▶  investigates,  ──▶  discuss with ──▶ builds on a    ──▶  review the code, play the ──▶ merge
 "Idea"         replies with a      @claude, then    branch, runs         new feature, "Play the
 issue          plan (refined)      add the          all tests,           game" runs all tests
                                    ready-to-build   opens a PR
                                    label
```

| Step | Who | Starts when | What happens | Workflow |
|---|---|---|---|---|
| 1. Idea | you | | Open an issue with the **Idea** form. It gets the `idea` label. | |
| 2. Refine | refine agent | the `idea` label | Reads the code and replies with a plan: how it works, files to change, acceptance criteria, test plan, open questions. Adds `refined`. Changes no code. | `agent-refine.yml` |
| Discuss | you + Claude | `@claude …` in the issue | Ask questions, change the plan. Repeat until you're happy. | `claude.yml` |
| 3. Build | build agent | **you add `ready-to-build`** | Builds the plan on branch `agent/issue-N`, adds tests, runs `npm test` until it passes, updates the docs, opens a PR labelled `agent-pr` that closes the issue. | `agent-build.yml` |
| 4. Review | review agent | the PR | Checks the diff against AGENTS.md and the acceptance criteria. Leaves inline comments and a ✅/❌ summary. | `agent-review.yml` |
| 5. Test | "Play the game" + playtest agent | the PR | The full Playwright suite runs, and the playtest agent plays the changed parts on desktop and phone sizes and reports with screenshots. | `tests.yml`, `agent-playtest.yml` |
| Fix | you + Claude | `@claude …` on the PR | e.g. "@claude please fix the review comments". Claude pushes to the PR branch and starts the checks again. | `claude.yml` |
| Done | you | | Merge the PR. The issue closes itself. | |

## One-time setup

1. **Give the agents access to Claude.** Add **one** of these repository secrets (Settings → Secrets and variables → Actions → New repository secret):
   - `CLAUDE_CODE_OAUTH_TOKEN`: uses your Claude Pro or Max subscription. Create it on your computer with:
     ```bash
     claude setup-token
     ```
   - `ANTHROPIC_API_KEY`: pay per use, from https://console.anthropic.com.
2. **Let workflows open pull requests.** Settings → Actions → General → Workflow permissions: choose **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.
3. **Create the labels.** Actions → **Set up agent labels** → Run workflow. This creates `idea`, `refined`, `ready-to-build` and `agent-pr`.
4. **Optional, recommended: `AGENT_GITHUB_TOKEN`.** Pull requests opened with the default Actions token don't start other workflows (a GitHub safety rule). The build agent works around this by starting the review, playtest and tests itself. With a fine-grained personal access token as `AGENT_GITHUB_TOKEN` (this repository only; Contents, Pull requests and Issues: read and write), the PR is opened in your name and everything triggers the normal way. Every later push to the PR then re-runs the checks too.
5. **Optional: protect `main`.** Settings → Branches → add a rule for `main` that requires the **Play all chapters** check, so nothing merges with failing tests.

## Good to know

- **Who can start agents:** only the repository owner, members and collaborators. Issues and comments from anyone else are ignored, so strangers can't spend your Claude usage.
- **Cost:** each step is one Claude session. Refine and review are small; build can take a while for big ideas. Smaller, focused ideas work best.
- **The plan is the contract:** the build agent follows the refine agent's plan *plus everything decided in the issue discussion*. If you change your mind, say so in the issue before adding `ready-to-build`.
- **Redo a step:** remove and re-add a label (`idea` or `ready-to-build`), or start a workflow by hand from the Actions tab (review and playtest take a PR number).
- **Where things live:** the agents' instructions are the `prompt` in each workflow file. The project knowledge they rely on is in [AGENTS.md](../AGENTS.md); keep it up to date and every agent gets better.
