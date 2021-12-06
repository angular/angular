# Browser support

Angular supports most recent browsers. This includes the following specific versions:

<table>
  <tr>
    <th>Browser</th>
    <th>Supported versions</th>
  </tr>
  <tr>
    <td>Chrome</td>
    <td>latest</td>
  </tr>
  <tr>
    <td>Firefox</td>
    <td>latest and extended support release (ESR)</td>
  </tr>
  <tr>
    <td>Edge</td>
    <td>2 most recent major versions</td>
  </tr>
  <tr>
    <td>Safari</td>
    <td>2 most recent major versions</td>
  </tr>
  <tr>
    <td>iOS</td>
    <td>2 most recent major versions</td>
  </tr>
  <tr>
    <td>Android</td>
    <td>2 most recent major versions</td>
  </tr>
</table>


<div class="alert is-helpful">

Angular's continuous integration process runs unit tests of the framework on all of these browsers for every pull request,
using [Sauce Labs](https://saucelabs.com/).

</div>

## Polyfills

Angular is built on the latest standards of the web platform.
Targeting such a wide range of browsers is challenging because they do not support all features of modern browsers.
You compensate by loading polyfill scripts ("polyfills") for the browsers that you must support.
See instructions on how to include polyfills into your project below.

<div class="alert is-important">

The suggested polyfills are the ones that run full Angular applications.
You might need additional polyfills to support features not covered by this list.
Note that polyfills cannot magically transform an old, slow browser into a modern, fast one.

</div>

## Enabling polyfills with CLI projects

The [Angular CLI](cli) provides support for polyfills.
If you are not using the CLI to create your projects, see [Polyfill instructions for non-CLI users](#non-cli).

When you create a project with the `ng new` command, a `src/polyfills.ts` configuration file is created as part of your project folder.
This file incorporates the mandatory and many of the optional polyfills as JavaScript `import` statements.

* The npm packages for the mandatory polyfills (such as `zone.js`) are installed automatically for you when you create your project with `ng new`, and their corresponding `import` statements are already enabled in the `src/polyfills.ts` configuration file.

* If you need an _optional_ polyfill, you must install its npm package, then uncomment or create the corresponding import statement in the `src/polyfills.ts` configuration file.


{@a non-cli}

## Polyfills for non-CLI users

If you are not using the CLI, add your polyfill scripts directly to the host web page (`index.html`).

For example:

<code-example header="src/index.html" language="html">
  &lt;!-- pre-zone polyfills -->
  &lt;script src="node_modules/core-js/client/shim.min.js">&lt;/script>
  &lt;script>
    /**
     * you can configure some zone flags which can disable zone interception for some
     * asynchronous activities to improve startup performance - use these options only
     * if you know what you are doing as it could result in hard to trace down bugs..
     */
    // __Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
    // __Zone_disable_on_property = true; // disable patch onProperty such as onclick
    // __zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
    /*
     * in Edge developer tools, the addEventListener will also be wrapped by zone.js
     * with the following flag, it will bypass `zone.js` patch for Edge
     */
    // __Zone_enable_cross_context_check = true;
  &lt;/script>
  &lt;!-- zone.js required by Angular -->
  &lt;script src="node_modules/zone.js/bundles/zone.umd.js">&lt;/script>
  &lt;!-- application polyfills -->
</code-example>
