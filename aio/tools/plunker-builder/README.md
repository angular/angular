# Overview

In the AIO application, we can embed a running version of the example as a [Plunker](http://plnkr.co/). We can also provide a
link to create a runnable version of the example in the [Plunker](http://plnkr.co/edit) editor.

This folder contains three utilities:

* regularPlunker.js - generates an HTML file for each example that will post to Plunker to create a new editable project, when rendered.
* embeddedPlunker.js - generates an HTML file for each example that can be used in an iframe to render an embedded Plunker project.
* generatePlunkers.js - executes each of the `regularPlunker.js` and `embeddedPlunker.js` utilities to generate all the example plunker files.
