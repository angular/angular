# Debugging tests

If your tests aren't working as you expect, you can debug them in both the default Node.js environment and in a real browser.

## Debugging in Node.js

Debugging in the default Node.js environment is often the quickest way to diagnose issues that are not related to browser-specific APIs or rendering.

1.  Run the `ng test` command with the `--debug` flag:
    ```shell
    ng test --debug
    ```
2.  The test runner will start in debug mode and wait for a debugger to attach.
3.  You can now attach your preferred debugger. For example, you can use the built-in Node.js debugger in VS Code or the Chrome DevTools for Node.js.

## Debugging in a browser

Debugging in a browser is recommended for tests that rely on the DOM or other browser-specific APIs. This approach allows you to use the browser's own developer tools.

1.  Ensure you have a browser provider installed. See [Running tests in a browser](guide/testing/overview#running-tests-in-a-browser) for setup instructions.
2.  Run the `ng test` command with both the `--browsers` and `--debug` flags:
    ```shell
    ng test --browsers=chromium --debug
    ```
3.  This command runs the tests in a headed browser and keeps it open after the tests finish, allowing you to inspect the output.
4.  Open the browser's **Developer Tools**. On Windows, press `Ctrl-Shift-I`. On macOS, press `Command-Option-I`.
5.  Go to the **Sources** tab.
6.  Use `Control/Command-P` to search for and open your test file.
7.  Set a breakpoint in your test.
8.  Reload the test runner UI in the browser. The execution will now stop at your breakpoint.
