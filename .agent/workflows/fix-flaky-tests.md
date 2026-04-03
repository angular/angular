---
description: Find and fix flaky tests in the repository
---

Investigate flaky tests in the repo and propose fixes to improve stability.
High-level process:

1.  Run tests in the repo to look for flakes.
    - Consider using Bazel's `--runs_per_test` flag to easily find
      flakes.
    - Be cognizant of not exhausting all the resources on the current
      machine, run a subset of tests at a time such as
      `bazel test //packages/core/...`.
2.  Once you find some flakes, focus on one at a time.
3.  Create a new branch named `flakes/${relevantNameFromTest}`.
4.  Reproduce the flake to the best of your ability.
    - Consider using `--test_env JASMINE_RANDOM_SEED=1234` to
      replicate the broken test ordering.
5.  Debug the test to understand the failure mode.
    - Consider temporarily disabling / skipping other tests with `xit`
      and `fit` to narrow down where the flake might be coming from if
      multiple tests are influencing each other.
    - Consider temporarily ignoring Firefox tests with
      `--test_tag_filters -firefox` if the flake does not appear to be
      browser specific.
    - Consider using `--test_sharding_strategy disabled` to run the
      test in a single shard.
    - Try to understand why the test was _flaky_, not just why it
      _failed_. Understanding the inconsistency is important to
      finding the correct fix.
6.  Attempt a fix and validate with `--runs_per_test`.
    - Iterate on the fix until you have something which appears to
      work.
    - If you find yourself stuck and not making meaningful progress,
      note down what you've learned/where you're struggling, commit
      what you have, look for another flake to fix, and continue. At
      the end, surface to the user what you failed to fix.
    - Don't try to make significant changes to Angular's runtime
      behavior, focus just on making the test pass/fail consistently.
7.  Commit the change with relevant details in the commit message and
    move on to the next test.
    - Be sure to include your theory of why the test was flaky and
      how this fix eliminates or reduces that flakiness.
8.  Iterate as many times as the user requests you to (default 5
    branches if not otherwise specified).
9.  Once you can't find any flaky tests or have iterated as many times
    as requested, stop and inform the user what you found and fixed.

Additional notes:

- Multiple fixes including the same/related files can go in the same
  commit or multiple commits on the same branch.
- Distinct test fixes should go in different branches, make a new one
  for each investigation.
- You may push these branches to `origin`, but do not create PRs for
  them.
