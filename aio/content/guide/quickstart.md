@description

Angular applications are made up of _components_.
  A _component_ is the combination of an HTML template and a component class that controls a portion of the screen. Here is an example of a component that displays a simple string:


<code-example path="quickstart/src/app/app.component.ts" linenums="false">

</code-example>




~~~ {.l-sub-section}

Try this **<live-example noDownload>QuickStart example on Plunker</live-example>** without installing anything.
Try it locally with the [***QuickStart seed***](guide/guide/setup)
and prepare for development of a real Angular application.


~~~

Every component begins with an `@Component` [decorator](guide/glossary)
function that takes a _metadata_ object. The metadata object describes how the HTML template and component class work together.

The `selector` property tells Angular to display the component inside a custom `<my-app>` tag in the `index.html`.

<code-example path="quickstart/src/index.html" region="my-app" linenums="false">

</code-example>

The `template` property defines a message inside an `<h1>` header.
The message starts with "Hello" and ends with `{{name}}`,
which is an Angular [interpolation binding](guide/guide/displaying-data) expression.
At runtime, Angular replaces `{{name}}` with the value of the component's `name` property.
Interpolation binding is one of many Angular features you'll discover in this documentation.
In the example, change the component class's `name` property from `'Angular'` to `'World'` and see what happens.


~~~ {.callout.is-helpful}



<header>
  A word about TypeScript
</header>



<p>
  This example is written in <a href="http://www.typescriptlang.org/" target="_blank" title="TypeScript">TypeScript</a>, a superset of JavaScript. Angular  
    uses TypeScript because its types make it easy to support developer productivity with tooling. You can also write Angular code in JavaScript; <a href="cookbook/ts-to-js.html">this guide</a> explains how.  
    
</p>



~~~



~~~ {.l-sub-section}

### Next step

Start [**learning Angular**](guide/guide/learning-angular).

~~~

