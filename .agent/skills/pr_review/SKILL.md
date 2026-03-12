---
name: PR Review
description: Guidelines and tools for reviewing pull requests in the Angular repository.
---

# PR Review Guidelines

When reviewing a pull request for the `angular` repository, follow these essential guidelines to ensure high-quality contributions:

1. **Context & Ecosystem**:
   - Keep in mind that this is the core Angular framework. Changes here can impact millions of developers.
   - Be mindful of backwards compatibility. Breaking changes require strict approval processes and deprecation periods.

2. **Key Focus Areas**:
   - **Comprehensive Reviews**: You **MUST always** perform a deep, comprehensive review of the _entire_ pull request. If the user asks you to look into a specific issue, file, or area of concern, you must investigate that specific area _in addition to_ reviewing the rest of the PR's substantive changes. Do not terminate your review after addressing only the user's focal point.
   - **Package-Specific Guidelines**: Check if there are specific guidelines for the package being modified in the `reference/` directory (e.g., `reference/router.md`). Always prioritize these rules for their respective packages.
   - **Commit Messages**: Evaluate the quality of commit messages. They should explain the _why_ behind the change, not just the _what_. Someone should be able to look at the commit history years from now and clearly understand the context and reasoning for the change.
   - **Code Cleanliness**: Ensure the code is readable, maintainable, and follows Angular's project standards.
   - **Performance**: Look out for code that might negatively impact runtime performance or bundle size, particularly in hot paths like change detection or rendering.
   - **Testing**: Ensure all new logic has comprehensive tests, including edge cases. **Do NOT run tests locally** as part of your review process. CI handles this automatically, and running tests locally is redundant and inefficient.
   - **API Design**: Ensure new public APIs are well-designed, consistent with existing APIs, and properly documented.
   - **Payload Size**: Pay attention to the impact of changes on the final client payload size.

3. **Execution Workflow**:
   Determine the appropriate review method. If the user explicitly asks for a `local` or `remote` review in their request, that takes precedence. Otherwise, use the GitHub MCP or available scripts to determine if the review should be `local` or `remote`.

   **Common Review Practices (Applies to both Local and Remote)**
   - **Preparation & Checklist**:
     - First, create a task list (e.g., in `task.md`) that you can easily reference containing **all** the review requirements from the "Key Focus Areas" section (Commit Messages, Performance, Testing, etc.), along with any specific review notes or requests from the user.
     - Before doing an in-depth review, expand this list into more detailed items of what you plan to explore and verify in the PR.
     - As you conduct the review, check off items in this list, adding your assessment or findings underneath each item.
     - At the end of your review, refer back to the checklist to ensure every single requirement was completely verified.
   - **Fetch PR Metadata Safely**: When you need to read the PR description or context, do NOT use `gh pr view <PR_NUMBER>` by itself, as its default GraphQL query may fail due to lack of `read:org` and `read:discussion` token scopes. Instead, use `read_url_content` on the PR URL or use `gh pr view <PR_NUMBER> --json title,body,state,author`.
   - **Check Existing Comments First**: Before formulating feedback, use the GitHub MCP or available scripts to fetch existing comments on the PR. Review this feedback to avoid duplicate comments, and incorporate its insights into your own review process.
   - **Constructive Feedback**: Provide clear, actionable, and polite feedback. Explain the _why_ behind your suggestions or edits. Do **NOT** leave inline comments purely to praise, agree with, or acknowledge a correct implementation detail, as this clutters the review. If you want to praise the PR, do so in the single general PR comment.

   **A. Local Code Review (If the PR is owned by the author requesting the review)**
   - **Checkout**: Check out the PR branch locally (if it doesn't already exist, fetch it).
   - **Review & Edit**: Execute the review directly on the code. Instead of adding inline PR comments for suggestions, format the codebase or apply the edits directly to the files.
   - **Feedback**: Summarize the review findings and the concrete changes you made in a message to the user, referencing the completed items from your checklist.
   - **Do NOT Commit or Push**: Leave the changes uncommitted in the working directory so the user can easily review the pending edits locally. Let the user know the changes are ready for their review, but do not ask for approval to push.
   - **Resolve Comments**: Once the user confirms the changes are good and should be committed/pushed, respond to the existing comments as 'resolved' using the GitHub MCP or available scripts.

   **B. Remote Code Review (For all other PRs)**
   - **Batching Comments (MCP Server - Preferred)**: If you have the GitHub MCP Server configured, you **MUST** follow this workflow to avoid spamming the author with multiple notifications:
     1. Create a pending review using `mcp_github-mcp-server_pull_request_review_write` (method `create`).
     2. Add your inline comments to the pending review using `mcp_github-mcp-server_add_comment_to_pending_review`.
     3. Submit the review using `mcp_github-mcp-server_pull_request_review_write` (method `submit_pending`).
   - **Batching Comments (Scripts - Fallback)**: If you do **NOT** have access to the GitHub MCP Server (e.g., specific MCP tools are missing from your context), fallback to using the provided scripts. Use `post_inline_comment.sh` to stage your comments locally. Once all comments are staged, you **MUST** call `submit_pr_review.sh` to publish them as a single batched review (and send a single notification). Try to keep comments minimal or use a general comment if you have many suggestions.
   - **Use Suggested Changes**: Whenever appropriate (e.g., for simple code fixes, refactoring suggestions, or typo corrections), prefer using GitHub's **Suggested Changes** syntax (`suggestion ... `) in your inline comments. This allows the author to apply your suggested code improvements with a single click in the GitHub UI.
   - **Review Type**: Never mark an external PR review as an "approval" unless explicitly instructed by a repo maintainer. Always use "Request Changes" or "Comment". Note that some tools might only support commenting.
   - **Require User Approval Before Posting**: Prepare your review comments and present them to the user, alongside a summary of your completed checklist. Do NOT post comments to the PR without explicitly asking the user for permission first. Only post the review after the user approves.
   - **Prefix Agent Comments**: To make it clear when comments are generated and posted by an AI agent rather than a human user, **always** prefix your review comments with `AGENT: `.

## Available Tools

The following tools are available for remote interactions. We prefer using standard **GitHub MCP Server** tools when available. If you do not have the MCP server set up, you **MUST** fallback to using the custom bash scripts.

### GitHub MCP Tools (Preferred)

- `mcp_github-mcp-server_pull_request_review_write`
- `mcp_github-mcp-server_add_comment_to_pending_review`

### Custom Bash Scripts (Fallback)

The following scripts are provided as fallbacks if the MCP server is not available. Note that they rely on the `gh` CLI being correctly installed and authenticated in the local environment.

### `determine_review_type.sh`

Determines whether to use the Local or Remote review workflow by checking if the currently authenticated GitHub user via the `gh` CLI matches the author of the pull request.

**Usage:**

```bash
.agent/skills/pr_review/scripts/determine_review_type.sh <PR_NUMBER>
```

### `get_pr_comments.sh`

Fetches all existing inline comments on a PR using the GitHub API. This is crucial for reviewing other contributors' feedback and avoiding duplicate comments. It outputs JSON containing the `id`, `path`, `line`, `body`, and `user` for each comment.

**Usage:**

```bash
.agent/skills/pr_review/scripts/get_pr_comments.sh <PR_NUMBER>
```

### `reply_pr_comment.sh`

Replies to an existing PR comment thread. This is useful for marking comments as resolved after addressing them in a local code review. Note that the `COMMENT_ID` must be the ID of the top-level comment in the thread.

**Usage:**

```bash
.agent/skills/pr_review/scripts/reply_pr_comment.sh <PR_NUMBER> <COMMENT_ID> <REPLY_BODY>
```

### `post_inline_comment.sh`

The GitHub CLI `gh pr review` command does not natively support adding inline comments to specific lines of code via its standard flags. This script wraps the GitHub API to stage comments locally. They will not be published until you call `submit_pr_review.sh`.

**Usage:**

```bash
.agent/skills/pr_review/scripts/post_inline_comment.sh <PR_NUMBER> <FILE_PATH> <LINE_NUMBER> <COMMENT_BODY>
```

**Example:**

```bash
.agent/skills/pr_review/scripts/post_inline_comment.sh 12345 "packages/core/src/render3/instructions/element.ts" 42 "AGENT: Consider the performance implications here."
```

### `submit_pr_review.sh`

Submits all locally staged inline comments as a single batched review via the GitHub Pull Request Reviews API.

**Usage:**

```bash
.agent/skills/pr_review/scripts/submit_pr_review.sh <PR_NUMBER> <EVENT_TYPE> [BODY]
```

**Options:**

- `EVENT_TYPE`: Must be `COMMENT`, `APPROVE`, or `REQUEST_CHANGES`. Never use `APPROVE` for external PRs.
- `BODY`: (Optional) A general summary comment for the review.

**Example:**

```bash
.agent/skills/pr_review/scripts/submit_pr_review.sh 12345 COMMENT "AGENT: I have left a few inline suggestions for your consideration."
```
