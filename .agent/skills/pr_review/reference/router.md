# Router PR Review Guidelines

When reviewing pull requests that modify the Angular Router (`packages/router`), pay special attention to the following:

- **Timing Sensitivity**: The router is extremely sensitive to timing changes. Any changes that alter the asynchronous timing of navigations, resolvers, or guards are almost always breaking changes and must be scrutinized carefully.
- **Testing Practices**: Tests should usually use the `RouterTestingHarness`. Many existing tests are older and do not use this harness. Do not blindly follow the shape of existing tests when writing or reviewing new ones; encourage the use of modern testing utilities.
- **Feature Justification**: Changes to router core code should be well-justified. Consider whether the change is proven to be a core developer ask, such as resolving a highly upvoted GitHub issue or addressing a critical bug.
