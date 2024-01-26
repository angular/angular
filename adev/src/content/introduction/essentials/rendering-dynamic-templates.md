<docs-decorative-header title="Rendering Dynamic Templates" imgSrc="adev/src/assets/images/templates.svg"> <!-- markdownlint-disable-line -->
Use Angular's template syntax to create dynamic HTML.
</docs-decorative-header>

What you've learned so far enables you to break an application up into components of HTML, but this limits you to static templates (i.e., content that doesn't change). The next step is to learn how to make use of Angular's template syntax to create dynamic HTML.

## Rendering Dynamic Data

When you need to display dynamic content in your template, Angular uses the double curly brace syntax in order to distinguish between static and dynamic content.

Here is a simplified example from a `TodoListItem` component.

```ts
@Component({
  selector: 'todo-list-item',
  template: `
    <p>Title: {{ taskTitle }}</p>
  `,
})
export class TodoListItem {
  taskTitle = 'Read cup of coffee';
}
```

When Angular renders the component you'll see the output:

```html
<p>Title: Read cup of coffee</p>
```

This syntax declares an **interpolation** between the dynamic data property inside of the HTML. As a result, whenever the data changes, Angular will automatically update the DOM reflecting the new value of the property.

## Dynamic Properties

When you need to dynamically set the value of standard DOM properties on an HTML element, the property is wrapped in square brackets to inform Angular that the declared value should be interpreted as a JavaScript-like statement ([with some Angular enhancements](guide/templates/interpolation)) instead of a plain string.

For example, a common example of dynamically updating properties in your HTML is determining whether the form submit button should be disabled based on whether the form is valid or not.

Wrap the desired property in square brackets to tell Angular that the assigned value is dynamic (i.e., not a static string).

```ts
@Component({
  selector: 'sign-up-form',
  template: `
    <button type="submit" [disabled]="formIsInvalid">Submit</button>
  `,
})
export class SignUpForm {
  formIsInvalid = true;
}
```

In this example, because `formIsInvalid` is true, the rendered HTML would be:

```html
<button type="submit" disabled>Submit</button>
```

## Dynamic Attributes

In the event you want to dynamically bind custom HTML attributes (e.g., `aria-`, `data-`, etc.), you might be inclined to wrap the custom attributes with the same square brackets.

```ts
@Component({
  standalone: true,
  template: `
    <button [data-test-id]="testId">Primary CTA</button>
  `,
})
export class AppBanner {
  testId = 'main-cta';
}
```

Unfortunately, this will not work because custom HTML attributes are not standard DOM properties. In order for this to work as intended, we need to prepend the custom HTML attribute with the `attr.` prefix.

```ts
@Component({
  standalone: true,
  template: `
    <button [attr.data-test-id]="testId">Primary CTA</button>
  `,
})
export class AppBanner {
  testId = 'main-cta';
}
```

## Next Step

Now that you have dynamic data and templates in the application, it's time to learn how to enhance templates by conditionally hiding or showing certain elements, looping over elements, and more.

<docs-pill-row>
  <docs-pill title="Conditionals and Loops" href="essentials/conditionals-and-loops" />
</docs-pill-row>
