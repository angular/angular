# DevTools Overview

Angular DevTools is a browser extension that provides debugging and profiling capabilities for Angular applications.

<docs-video src="https://www.youtube.com/embed/bavWOHZM6zE"/>

Install Angular DevTools from the [Chrome Web Store](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh) or from [Firefox Addons](https://addons.mozilla.org/firefox/addon/angular-devtools/).

You can open Chrome or Firefox DevTools on any web page by pressing <kbd>F12</kbd> or <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></kbd> (Windows or Linux) and <kbd><kbd>Fn</kbd>+<kbd>F12</kbd></kbd> or <kbd><kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd></kbd> (Mac).
Once browser DevTools is open and Angular DevTools is installed, you can find it under the "Angular" tab.

HELPFUL: Chrome's new tab page does not run installed extensions, so the Angular tab will not appear in DevTools. Visit any other page to see it.

<img src="assets/images/guide/devtools/devtools.png" alt="An overview of Angular DevTools showing a tree of components for an application.">

## Open your application

When you open the extension, you'll see two additional tabs:

| Tabs                                     | Details |
|:---                                      |:---     |
| [Components](tools/devtools/component) | Lets you explore the components and directives in your application and preview or edit their state.                    |
| [Profiler](tools/devtools/profiler)     | Lets you profile your application and understand what the performance bottleneck is during change detection execution. |

<!-- TODO: Add new sections like signals, router etc. -->


<img src="assets/images/guide/devtools/devtools-tabs.png" alt="A screenshot of the top of Angular DevTools illustrating two tabs in the upper-left corner, one labeled 'Components' and another labeled 'Profiler'.">

In the top-right corner of Angular DevTools you'll find which version of Angular is running on the page as well as the latest commit hash for the extension.

### Angular application not detected

If you see an error message "Angular application not detected" when opening Angular DevTools, this means it is not able to communicate with an Angular app on the page.
The most common reason for this is because the web page you are inspecting does not contain an Angular application.
Double check that you are inspecting the right web page and that the Angular app is running.

### We detected an application built with production configuration

If you see an error message "We detected an application built with production configuration. Angular DevTools only supports development builds.", this means that an Angular application was found on the page, but it was compiled with production optimizations.
When compiling for production, Angular CLI removes various debug features to minimize the amount of the JavaScript on the page to improve performance. This includes features needed to communicate with DevTools.

To run DevTools, you need to compile your application with optimizations disabled. `ng serve` does this by default.
If you need to debug a deployed application, disable optimizations in your build with the [`optimization` configuration option](reference/configs/workspace-config#optimization-configuration) (`{"optimization": false}`).

