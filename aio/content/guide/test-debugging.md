# Debugging tests

If your tests aren't working as you expect them to, you can inspect and debug them in the browser.

Debug specs in the browser in the same way that you debug an application.

1.  Reveal the Karma browser window.
    See [Set up testing](guide/testing#set-up-testing) if you need help with this step.

1.  Click the **DEBUG** button to open a new browser tab and re-run the tests.
2.  Open the browser's **Developer Tools**. On Windows, press `Ctrl-Shift-I`. On macOS, press `Command-Option-I`.
3.  Pick the **Sources** section.
4.  Press `Control/Command-P`, and then start typing the name of your test file to open it.
5.  Set a breakpoint in the test.
6.  Refresh the browser, and notice how it stops at the breakpoint.

<div class="lightbox">

<img alt="Karma debugging" src="generated/images/guide/testing/karma-1st-spec-debug.png">

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
