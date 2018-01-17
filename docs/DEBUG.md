# Debugging Angular

The Angular project has comprehensive unit tests for the core packages and the tools.
The core packages are tested both in the browser (via Karma) and on the server (via Node.js).

## Debugging in Karma

Run the unit tests as normal using via the `./test.sh` script. For example:

```bash
./test.sh browserNoRouter
```

Once the initial build has completed and the Karma server has started up, you can go to the
Chrome browser that is automatically opened, usually pointing to `http://localhost:9876`.
The script will sit watching for code changes, recompiling the changed files and triggering
further runs of the unit tests in the browser.

In this browser there is a "DEBUG" link (in the top right corner). Clicking this link will
open up a new tab that will run the unit tests and will not timeout, giving you time to
step through the code.

Open up this tab's developer console to access the source code viewer where you can set
breakpoints and interrogate the current stack and variables.

It is useful to focus your debugging on one test at a time by changing that test to be
defined using the `fit(...)` function, rather than `it(...)`. Moreover it can be helpful
to place a `debugger` statement in this `fit` clause to cause the debugger to stop when
it hits this test.

## Debugging in Node

Run the unit tests as normal using the `./test.sh` script, but add the `--debug` flag to
the command. For example:

```bash
./test.sh node --debug
```

Once the initial building has completed, the script will watch for code changes, recompiling
and running the unit tests via a tool call `cjs-jasmine`. Due to the `--debug` flag, each
test run will create a debugging server listening on a port (such as 9229), which can be
connected to by a debugger.

You can use Chrome as the debugger by navigating to `chrome://inspect` then clicking the
"Open dedicated DevTools for Node" link. This will open up a Developer console, which will
automatically connect to the debugging server.

It is useful to focus your debugging on one test at a time by changing that test to be
defined using the `fit(...)` function, rather than `it(...)`. Moreover it can be helpful
to place a `debugger` statement in this `fit` clause to cause the debugger to stop when
it hits this test.

**Problem with node 6:** at the time of writing, the node process does not tell the Chrome
debugger when it has completed, and so the debugger is not able to automatically disconnect
from listening to the debugging server. To solve this, just close the developer tools window
after each run of the unit tests, before making changes to the code.  This is fixed in node 8
and may be backported to node 6. This issue is tracked in
https://github.com/nodejs/node/pull/12814#issuecomment-309908579.
