# Saucelabs testing with Bazel

## Local testing

1. Set up your `SAUCE_USERNAME`, `SAUCE_ACCESS_KEY` & `SAUCE_TUNNEL_IDENTIFIER` environment variables.
These are required. You can find the values for `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` on your Saucelabs account. `SAUCE_TUNNEL_IDENTIFIER` can be set to any unique value.

If you are having trouble running Saucelabs tests locally you can contact [Joey Perrott](https://github.com/josephperrott) or [Paul Gschwendtner](https://github.com/devversion) for support.

2. Once you have your environment variables set up, run the setup task in the root of the repo:

``` bash
yarn bazel run //tools/saucelabs-daemon/background-service -- <number_of_browsers>
```

This will start a daemon process that will connect to Saucelabs and provision browsers
once you start running your first test target.

3. In another terminal, you can run a particular test target through SauceLabs by suffixing the target name with "_saucelabs".

For example, `packages/core/test:test_web` becomes `packages/core/test:test_web_saucelabs`.

```
yarn bazel test //packages/core/test:test_web_saucelabs
```

## Additional test features

To see the test output while the tests are running (as these are long tests), add the `--test_output=streamed` option. 
Note, this option will also prevent bazel from using the test cache and will force the test to run.

For running all Saucelabs tests in the project, `bazel query` is used to gather up all karma Saucelabs test labels because they are otherwise hidden by the `manual` tag.

Running all karma tests in Saucelabs:

``` bash
./scripts/test/run-saucelabs-tests.sh
```

to override the default number of parallel browsers to acquire on Saucelabs you
pass an optional configuration parameters. For example,

``` bash
./scripts/test/run-saucelabs-tests.sh 5
```

## Under the hood

The `//tools/saucelabs-daemon/background-service` target does not start the Sauce Connect proxy at start-up, but instead listens for the start signal from the saucelabs karma launcher. 
This signal is sent by saucelabs-daemon custom karma launcher `tools/saucelabs-daemon/launcher/launcher.ts`. 
This is necessary as the Sauce Connect Proxy process must be started outside of `bazel test` as Bazel will automatically kill any processes spawned during a test when that tests completes, which would prevent the tunnel & provisioned browsers from being shared by multiple tests.

The karma_web_test rule for saucelabs must have a few important tags:

*  `no-remote-exec` as they cannot be executed remotely since tests need to communicate with the daemon.
*  `manual` so they are not automatically tested with `//...`
*  `saucelabs` so that they can be easily gathered up for testing in a `bazel query`

These are added automatically the by `karma_web_test_suite` macro in `tools/defaults.bzl`.

## Debugging

**Q: How do I get the tests to run on IE? I only see Chromium.**

If you see something like this at the end of your test output, it means you're not actually running SauceLabs: 

```
INFO: Build completed successfully, 43 total actions
/packages/core/test:test_web_chromium
``` 

This is a common error caused by forgetting to suffix your test target with "_saucelabs".

For example, `/packages/core/test:test_web` becomes `/packages/core/test:test_web_saucelabs`.

**Q: How can I tell that the SauceLabs connection was successfully made?**

There is a dashboard at saucelabs.com where you can see active tunnel connections (Angular has an account).
As soon as you actually run the test target (not after the setup task), you should see an active tunnel connection under the SAUCE_TUNNEL_IDENTIFICATION_KEY you entered. 
If a tunnel connection is not there, you are not actually connecting with SauceLabs.

Note: It may *look* like the tests are running because of the Bazel output. 
The progress Bazel is showing does not mean that SauceLabs is connected.
If the tests are actually running, you should see the "..." test report for passing tests.
