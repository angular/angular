# Debugging tests

If your tests aren't working as you expect them to, you can inspect and debug them in the browser.

<div class="alert is-helpful">

  For the sample app that the testing guides describe, see the <live-example name="testing" embedded-style noDownload>sample app</live-example>.

  For the tests features in the testing guides, see <live-example name="testing" stackblitz="specs" noDownload>tests</live-example>.

</div>


Debug specs in the browser in the same way that you debug an application.

1. Reveal the Karma browser window. See [Set up testing](guide/testing#set-up-testing) if you need help with this step.
1. Click the **DEBUG** button; it opens a new browser tab and re-runs the tests.
1. Open the browser's “Developer Tools” (`Ctrl-Shift-I` on Windows; `Command-Option-I` in macOS).
1. Pick the "sources" section.
1. Open the `1st.spec.ts` test file (Control/Command-P, then start typing the name of the file).
1. Set a breakpoint in the test.
1. Refresh the browser, and it stops at the breakpoint.

<div class="lightbox">
  <img src='generated/images/guide/testing/karma-1st-spec-debug.png' alt="Karma debugging">
</div>
