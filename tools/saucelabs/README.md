# Saucelabs testing with Bazel

## Local testing

Setup your `SAUCE_USERNAME`, `SAUCE_ACCESS_KEY` & `SAUCE_TUNNEL_IDENTIFIER` environment variables. These are required. On OSX, also set `SAUCE_CONNECT` to the path of your `sc` binary.

To run tests use:

``` bash
yarn bazel run //tools/saucelabs:sauce_service_setup
yarn bazel test //path/to:saucelabs_test_target_1 --config=saucelabs [--config=ivy]
yarn bazel test //path/to:saucelabs_test_target_2 --config=saucelabs [--config=ivy]
```

`bazel query` is required gather up all karma saucelabs test labels so they can be run in one command as they are tagged `manual`.

Running all ViewEngine karma tests in Saucelabs:

``` bash
yarn bazel run //tools/saucelabs:sauce_service_setup
TESTS=$(./node_modules/.bin/bazel query --output label '(kind(karma_web_test, ...) intersect attr("tags", "saucelabs", ...)) except attr("tags", "ivy-only", ...) except attr("tags", "fixme-saucelabs-ve", ...)')
yarn bazel test --config=saucelabs ${TESTS}
```

Running all Ivy karma tests in Saucelabs:

``` bash
yarn bazel run //tools/saucelabs:sauce_service_setup
TESTS=$(./node_modules/.bin/bazel query --output label '(kind(karma_web_test, ...) intersect attr("tags", "saucelabs", ...)) except attr("tags", "no-ivy-aot", ...) except attr("tags", "fixme-saucelabs-ivy", ...)')
yarn bazel test --config=saucelabs --config=ivy ${TESTS}
```

To see the test output while the tests are running as these are long tests, add the `--test_output=streamed` option. Note, this option will also prevent bazel from using the test cache and will force the test to run.

The `//tools/saucelabs:sauce_service_setup` target does not start the Sauce Connect proxy but it does start process which will that then listens for the start signal from the service manager script. This signal is sent by the karma wrapper script `//tools/saucelabs:karma-saucelabs` which calls `./tools/saucelabs/sauce-service.sh start`. This is necessary as the Sauce Connect Proxy process must be started outside of `bazel test` as Bazel will automatically kill any processes spwaned during a test when that tests completes, which would prevent the tunnel from being shared by multiple tests.

# Under the hood

The karma_web_test rule is to test with saucelabs with a modified `karma` attribute set to
`//tools/saucelabs:karma-saucelabs`. This runs the `/tools/saucelabs/karma-saucelabs.js` wrapper
script which configures the saucelabs environment and starts Sauce Connect before running karma.

For example,

``` python
karma_web_test(
    name = "saucelabs_core_acceptance_tests",
    timeout = "long",
    karma = "//tools/saucelabs:karma-saucelabs",
    tags = [
        "exclusive",
        "manual",
        "no-remote-exec",
        "saucelabs",
    ],
    deps = [
        "//packages/core/test/acceptance:acceptance_lib",
    ],
)
```

These saucelabs targets must have a few important tags:
*  `no-remote-exec` as they cannot be executed remotely since they require a local Sauce Connect process
*  `manual` so they are not automatically tested with `//...`
*  `exclusive` as they must be run serially in order to not over-provision Saucelabs browsers
*  `saucelabs` so that they can be easily gathered up for testing in a `bazel query`
