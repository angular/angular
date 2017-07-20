<h1 class="no-toc">QuickStart</h1>

Angular applications are made up of _components_.
A _component_ is the combination of an HTML template and a component class that controls a portion of the screen. Here is an example of a component that displays a simple string:


<code-example path="quickstart/src/app/app.component.ts" title="src/app/app.component.ts" linenums="false">

</code-example>




<div class="l-sub-section">



Try this **<live-example noDownload>QuickStart example on Plunker</live-example>** without installing anything.
Try it locally with the [***QuickStart seed***](guide/setup "Setup for local development with the QuickStart seed")
and prepare for development of a real Angular application.


</div>



Every component begins with an `@Component` [decorator](guide/glossary#decorator '"decorator" explained')
function that takes a _metadata_ object. The metadata object describes how the HTML template and component class work together.

The `selector` property tells Angular to display the component inside a custom `<my-app>` tag in the `index.html`.

<code-example path="quickstart/src/index.html" region="my-app" title="index.html (inside &lt;body&gt;)" linenums="false">

</code-example>



The `template` property defines a message inside an `<h1>` header.
The message starts with "Hello" and ends with `{{name}}`,
which is an Angular [interpolation binding](guide/displaying-data) expression.
At runtime, Angular replaces `{{name}}` with the value of the component's `name` property.
Interpolation binding is one of many Angular features you'll discover in this documentation.


In the example, change the component class's `name` property from `'Angular'` to `'World'` and see what happens.


<div class="callout is-helpful">



<header>
  A word about TypeScript
</header>



<p>
  This example is written in <a href="http://www.typescriptlang.org/" title="TypeScript">TypeScript</a>, a superset of JavaScript. Angular
  uses TypeScript because its types make it easy to support developer productivity with tooling. You can also write Angular code in JavaScript; [this guide](guide/ts-to-js] explains how.

</p>



</div>



<div class="l-sub-section">



### Next step

Start the [**tutorial**](tutorial "Tour of Heroes tutorial").

</div>

