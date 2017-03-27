@description

Angular applications are made up of _components_.
  A _component_ is the combination of an HTML template and a component class that controls a portion of the screen. Here is an example of a component that displays a simple string:


<code-example path="quickstart/src/app/app.component.ts" linenums="false">

</code-example>




~~~ {.l-sub-section}

Try this **<live-example noDownload>QuickStart example on Plunker</live-example>** without installing anything.
Try it locally with the [***QuickStart seed***](guide/setup)
and prepare for development of a real Angular application.


~~~

Every component begins with an `@Component` [!{_decorator}](glossary)
<span if-docs="ts">function</span> that
<span if-docs="ts">takes a _metadata_ object. The metadata object</span> describes how the HTML template and component class work together.

The `selector` property tells Angular to display the component inside a custom `<my-app>` tag in the `index.html`.

<code-example path="quickstart/src/index.html" region="my-app" linenums="false">

</code-example>

The `template` property defines a message inside an `<h1>` header.
The message starts with "Hello" and ends with `{{name}}`,
which is an Angular [interpolation binding](guide/displaying-data) expression.
At runtime, Angular replaces `{{name}}` with the value of the component's `name` property.
Interpolation binding is one of many Angular features you'll discover in this documentation.


~~~ {.l-sub-section}

### Next step

Start [**learning Angular**](guide/learning-angular).

~~~

