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

The same way you start a debugging session with in Node, you can use `ng test` with the `--debug` flag with Vitest and [browser mode](/guide/testing/migrating-to-vitest#5-configure-browser-mode-optional).

The test runner will start in debug mode and wait for you to open the browser devtools to debug the tests.
