- NgOptimizedImage directive testing

This folder contains a simple application that can be used as a playground for the `NgOptimizedImage` directive testing. You can run the following command to start the dev server:

```
pnpm ibazel run packages/core/test/bundling/image-directive:devserver
```

There is also a set of e2e tests (powered by Selenium WebDriver), which can be invoked by running:

```
pnpm bazel test packages/core/test/bundling/image-directive:webdriver_tests
```
