# Debugging tests

If your tests aren't working as you expect them to, you can inspect and debug them in the browser.

Debug specs in the browser in the same way that you debug an application.

1. Reveal the Karma browser window.
    See [Set up testing](guide/testing#set-up-testing) if you need help with this step.

1. Click the **DEBUG** button to open a new browser tab and re-run the tests.
1. Open the browser's **Developer Tools**. On Windows, press `Ctrl-Shift-I`. On macOS, press `Command-Option-I`.
1. Pick the **Sources** section.
1. Press `Control/Command-P`, and then start typing the name of your test file to open it.
1. Set a breakpoint in the test.
1. Refresh the browser, and notice how it stops at the breakpoint.

<img alt="Karma debugging" src="assets/images/guide/testing/karma-1st-spec-debug.png">
