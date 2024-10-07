# Whitespace in templates

By default, Angular templates do not preserve whitespace that the framework considers unnecessary. This commonly occurs in two situations: whitespace between elements, and collapsible whitespace inside of text.

## Whitespace between elements

Most developers prefer to format their templates with newlines and indentation to make the template readable:

```angular-html
<section>
  <h3>User profile</p>
  <label>
    User name
    <input>
  </label>
</section>
```

This template contains whitespace between all of the elements. The following snippet shows the same HTML with each whitespace character replaced with the hash (`#`) character to highlight how much whitespace is present:

```angular-html
<!-- Total Whitespace: 20 -->
<section>###<h3>User profile</p>###<label>#####User name#####<input>###</label>#</section>
```

Preserving the whitespace as written in the template would result in many unnecessary [text nodes](https://developer.mozilla.org/en-US/docs/Web/API/Text) and increase page rendering overhead. By ignoring this whitespace between elements, Angular performs less work when rendering the template on the page, improving overall performance.

## Collapsible whitespace inside text

When your web browser renders HTML on a page, it collapses multiple consecutive whitespace characters to a single character:

```angular-html
<!-- What it looks like in the template -->
<p>Hello         world</p>
```

In this example, the browser displays only a single space between "Hello" and "world".

```angular-html
<!-- What shows up in the browser -->
<p>Hello world</p>
```

See [How whitespace is handled by HTML, CSS, and in the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace) for more context on how this works.

Angular avoids sending these unnecessary whitespace characters to the browser in the first place by collapsing them to a single character when it compiles the template.

## Preserving whitespace

You can tell Angular to preserve whitespace in a template by specifying `preserveWhitespaces: true` in the `@Component` decorator for a template.

```angular-ts
@Component({
  /* ... */,
  preserveWhitespaces: true,
  template: `
    <p>Hello         world</p>
  `
})
```

Avoid setting this option unless absolutely necessary. Preserving whitespace can cause Angular to produce significantly more nodes while rendering, slowing down your application.

You can additionally use a special HTML entity unique to Angular, `&ngsp;`. This entity produces a single space character that's preserved in the compiled output.
