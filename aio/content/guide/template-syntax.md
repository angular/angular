# Template Syntax

## Prerequisites

You should already be familiar with:

* HTML basics.
* JavaScript basics.
* Angular [Architecture](guide/architecture).

<hr/>

A template in Angular is a chunk of HTML associated with a 
component, also known as a component class instance. It can be of two different types. 
The first is the inline template, 
meaning it is completely written out in the component between backticks as follows:

<!--KW-- title="src/app/item-detail.component.ts" -->
```typescript
@Component({
  selector: 'item-detail',
  template: `
    <h1>The HTML between the backticks comprises the template.</h1>
    `
})

```

An inline template is good for a simple demonstration, but for a real world app, 
a template in its own file is easier to manage. This second kind of template is 
simply called a template but the `@Component` metadata, or information 
about it, is a little different. The above example can be refactored 
into two files; the component and the template as follows:

<!-- KW-- title="src/app/item-detail.component.ts" -->
```typescript
@Component({
  selector: 'item-detail',
  templateUrl: './item-detail.component.html',
})

```

Now the component points to another file that ends in `.html`. 
Notice that instead of `template` 
in the metadata, it now uses `templateUrl` followed by the location of the 
file where the HTML resides. The HTML file would look like this:

<!-- KW--need live example so we can have names of files -->
<!-- title="src/app/item-detail.component.html" -->

```html
<h1>This whole html file comprises the template.</h1>

```

You use these chunks of HTML to put them where you need them. For example, you could 
have one for your header, another for your footer, another for a widget, 
another for an product page, search results, and so on. 


## HTML in templates

Since HTML is the language of the Angular template,
almost all HTML syntax is valid template syntax.
The `<script>` element is a notable exception, 
which eliminates the risk of script injection attacks.
In practice, `<script>` is ignored and a warning appears in the browser console.
See the [Security](guide/security) page for details.

While legal, some HTML doesn't make much sense in a template; for example,
the `<html>`, `<body>`, and `<base>` elements have no useful role. This is 
because templates are generally contained within a complete HTML file 
such as an app's `index.html`, so things like `<html>` and `<body>` are 
already in the page.



## Custom elements


You can extend the HTML vocabulary of your templates with components and directives that appear as new elements and attributes.



 You still create a structure and initialize attribute values this way in Angular templates, but you also create new elements with components that encapsulate HTML
and drop them into templates as if they were native HTML elements. 

```html 
<!-- Normal HTML -->
<div class="special">HTML with a new element</div> -->
<!-- Wow! A new element! -->
<item-detail></item-detail>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="hero-detail-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

## Dynamic structure

Angular templates give you the flexibility of programmatically 
determining the structure of your HTML, from generating lists with 
[built-in directives](guide/built-in-directives) to 
[featuring dynamic content](guide/dynamic-component-loader). 
And when the structure of your templates 
changes, you can use Angular 
[attribute, class, and style bindings](guide/attribute-class-style-bindings) to 
maintain the usability, accessibility, and integrity of your app's design.

## Interpolation and binding

One of Angular's most well known features is 
[interpolation](guide/interpolation), or the capacity to read data 
from within your code and display it to the user. This straightforward 
syntax lets you easily do things like make sure a customer's name 
appears throughout your app, when and where you want it.

Similarly, [data binding](guide/data-binding), [two-way binding](guide/two-way-binding), and [event binding](guide/event-binding) in your templates are powerful 
ways to communicate data to and receive data from your users. For example, 
data binding allows you to instantaneously update item quantities in a shopping cart or update contact information in multiple places at once.

## More information on template syntax

If you're new to Angular's template syntax, start with the fundamental 
concepts:

* [Interpolation](guide/interpolation).
* [Template Statements](guide/template-statements).
* [Binding Syntax](binding-syntax).

Each document walks you through the details of a 
template syntax feature and suggests related topics to 
help you build on your foundation.

