# Browser support

Angular supports most recent browsers. This includes the following specific versions:


<table>

  <tr>

    <th>
      Chrome
    </th>

    <th>
      Firefox
    </th>

    <th>
      Edge
    </th>

    <th>
      IE
    </th>

    <th>
      Safari
    </th>

    <th>
      iOS
    </th>

    <th>
      Android
    </th>

    <th>
      IE Mobile
    </th>

  </tr>

  <tr>

    <td>
      latest
    </td>

    <td>
      latest
    </td>

    <td>
      14
    </td>

    <td>
      11
    </td>

    <td>
      10
    </td>

    <td>
      10
    </td>

    <td>
      Nougat (7.0)<br>Marshmallow (6.0)
    </td>

    <td>
      11
    </td>

  </tr>

  <tr>

    <td>

    </td>

    <td>

    </td>

    <td>
      13
    </td>

    <td>
      10
    </td>

    <td>
      9
    </td>

    <td>
      9
    </td>

    <td>
      Lollipop<br>(5.0, 5.1)
    </td>

    <td>

    </td>

  </tr>

  <tr>

    <td>

    </td>

    <td>

    </td>

    <td>

    </td>

    <td>
      9
    </td>

    <td>
      8
    </td>

    <td>
      8
    </td>

    <td>
      KitKat<br>(4.4)
    </td>

    <td>

    </td>

  </tr>

  <tr>

    <td>

    </td>

    <td>

    </td>

    <td>

    </td>

    <td>

    </td>

    <td>
      7
    </td>

    <td>
      7
    </td>

    <td>
      Jelly Bean<br>(4.1, 4.2, 4.3)
    </td>

    <td>

    </td>

  </tr>

</table>

<div class="l-sub-section">

Angular's continuous integration process runs unit tests of the framework on all of these browsers for every pull request,
using <a href="https://saucelabs.com/">SauceLabs</a> and
<a href="https://www.browserstack.com">Browserstack</a>.

</div>


## Polyfills

Angular is built on the latest standards of the web platform.
Targeting such a wide range of browsers is challenging because they do not support all features of modern browsers.

You compensate by loading polyfill scripts ("polyfills") for the browsers that you must support.
The [table below](#polyfill-libs) identifies most of the polyfills you might need.

<div class="alert is-important">

The suggested polyfills are the ones that run full Angular applications.
You may need additional polyfills to support features not covered by this list.
Note that polyfills cannot magically transform an old, slow browser into a modern, fast one.

</div>

## Enabling polyfills

[Angular CLI](https://github.com/angular/angular-cli/wiki) users enable polyfills through the `src/polyfills.ts` file that
the CLI created with your project.

This file incorporates the mandatory and many of the optional polyfills as JavaScript `import` statements.

The npm packages for the _mandatory_ polyfills (such as `zone.js`) were installed automatically for you when you created your project and 
their corresponding `import` statements are ready to go.
You probably won't touch these.

But if you need an optional polyfill, you'll have to install its npm package with `npm` or `yarn`.
For example, [if you need the web animations polyfill](http://caniuse.com/#feat=web-animation),
you could install it with either of the following commands:

<code-example language="sh" class="code-shell">
  npm install --save web-animations-js
  yarn add web-animations-js
</code-example>

Then open the `polyfills.ts` file and un-comment the corresponding `import` statement
as in the following example:

<code-example title="src/polyfills.ts">
  /**
  * Required to support Web Animations `@angular/platform-browser/animations`.
  * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
  **/
  import 'web-animations-js';  // Run `npm install --save web-animations-js`.
</code-example>

If you can't find the polyfill you want in `polyfills.ts`, 
add it yourself, following the same pattern:

1. install the npm package
1. `import` the file in `polyfills.ts`

<div class="l-sub-section">

Non-CLI users should follow the instructions [below](#non-cli).
</div>

{@a polyfill-libs}

### Mandatory polyfills
These are the polyfills required to run an Angular application on each supported browser:


<table>

  <tr style="vertical-align: top">

    <th>
      Browsers (Desktop & Mobile)
    </th>

    <th>
      Polyfills Required
    </th>

  </tr>

  <tr style="vertical-align: top">

    <td>
      Chrome, Firefox, Edge, Safari 9+
    </td>

    <td>

      [ES7/reflect](guide/browser-support#core-es7-reflect) (JIT only)
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>
      Safari 7 & 8, IE10 & 11, Android 4.1+
    </td>

    <td>


      [ES6](guide/browser-support#core-es6)
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>
      IE9
    </td>

    <td>


      [ES6<br>classList](guide/browser-support#classlist)

    </td>

  </tr>

</table>


### Optional browser features to polyfill

Some features of Angular may require additional polyfills.

For example, the animations library relies on the standard web animation API, which is only available in Chrome and Firefox today.
You'll need a polyfill to use animations in other browsers.

Here are the features which may require additional polyfills:


<table>

  <tr style="vertical-align: top">

    <th>
      Feature
    </th>

    <th>
      Polyfill
    </th>

    <th style="width: 50%">
       Browsers (Desktop & Mobile)
    </th>

  </tr>

  <tr style="vertical-align: top">

    <td>

      [JIT compilation](guide/aot-compiler). 
      Required to reflect for metadata.
    </td>

    <td>

      [ES7/reflect](guide/browser-support#core-es7-reflect)
    </td>

    <td>
      All current browsers.
      Enabled by default.
      Can remove If you always use AOT and only use Angular decorators.
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>

      [Animations](guide/animations)
    </td>

    <td>


      [Web Animations](guide/browser-support#web-animations)
    </td>

    <td>
      All but Chrome and Firefox<br>Not supported in IE9
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>

    If you use the following deprecated i18n pipes: [date](api/common/DeprecatedDatePipe), [currency](api/common/DeprecatedCurrencyPipe), [decimal](api/common/DeprecatedDecimalPipe) and [percent](api/common/DeprecatedPercentPipe)
    </td>

    <td>


      [Intl API](guide/browser-support#intl)
    </td>

    <td>
      All but Chrome, Firefox, Edge, IE11 and Safari 10
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>

       [NgClass](api/common/NgClass) on SVG elements
    </td>

    <td>


      [classList](guide/browser-support#classlist)
    </td>

    <td>
      IE10, IE11
    </td>

  </tr>

  <tr style="vertical-align: top">

    <td>

      [Http](guide/http) when sending and receiving binary data
    </td>

    <td>

      [Typed&nbsp;Array](guide/browser-support#typedarray)<br>
      [Blob](guide/browser-support#blob)<br>
      [FormData](guide/browser-support#formdata)
    </td>

    <td>
      IE 9
    </td>

  </tr>

</table>



### Suggested polyfills ##
Below are the polyfills which are used to test the framework itself. They are a good starting point for an application.


<table>

  <tr>

    <th>
      Polyfill
    </th>

    <th>
      License
    </th>

    <th>
      Size*
    </th>

  </tr>

  <tr>

    <td>

      <a id='core-es7-reflect' href="https://github.com/zloirock/core-js/blob/master/es7/reflect.js">ES7/reflect</a>
    </td>

    <td>
      MIT
    </td>

    <td>
      0.5KB
    </td>

  </tr>

  <tr>

    <td>
      <a id='core-es6' href="https://github.com/zloirock/core-js">ES6</a>
    </td>

    <td>
      MIT
    </td>

    <td>
      27.4KB
    </td>

  </tr>

  <tr>

    <td>
      <a id='classlist' href="https://github.com/eligrey/classList.js">classList</a>
    </td>

    <td>
      Public domain
    </td>

    <td>
      1KB
    </td>

  </tr>

  <tr>

    <td>
      <a id='intl' href="https://github.com/andyearnshaw/Intl.js">Intl</a>
    </td>

    <td>
      MIT / Unicode license
    </td>

    <td>
      13.5KB
    </td>

  </tr>

  <tr>

    <td>
       <a id='web-animations' href="https://github.com/web-animations/web-animations-js">Web Animations</a>
    </td>

    <td>
      Apache
    </td>

    <td>
      14.8KB
    </td>

  </tr>

  <tr>

    <td>
      <a id='typedarray' href="https://github.com/inexorabletash/polyfill/blob/master/typedarray.js">Typed Array</a>
    </td>

    <td>
      MIT
    </td>

    <td>
      4KB
    </td>

  </tr>

  <tr>

    <td>
       <a id='blob' href="https://github.com/eligrey/Blob.js">Blob</a>
    </td>

    <td>
      MIT
    </td>

    <td>
      1.3KB
    </td>

  </tr>

  <tr>

    <td>
       <a id='formdata' href="https://github.com/francois2metz/html5-formdata">FormData</a>
    </td>

    <td>
      MIT
    </td>

    <td>
      0.4KB
    </td>

  </tr>

</table>



\* Figures are for minified and gzipped code,
computed with the <a href="http://closure-compiler.appspot.com/home">closure compiler</a>.

{@a non-cli}
## Polyfills for non-CLI users

If you aren't using the CLI, you should add your polyfill scripts directly to the host web page (`index.html`), perhaps like this.

<code-example title="src/index.html">
  &lt;!-- pre-zone polyfills -->
  &lt;script src="node_modules/core-js/client/shim.min.js">&lt;/script>
  &lt;script src="node_modules/web-animations-js/web-animations.min.js">&lt;/script>

  &lt;!-- zone.js required by Angular -->
  &lt;script src="node_modules/zone.js/dist/zone.js">&lt;/script>

  &lt;!-- application polyfills -->
</code-example>

