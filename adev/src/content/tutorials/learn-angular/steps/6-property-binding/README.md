# Property Binding in Angular

Property binding in Angular enables you to set values for properties of HTML elements, Angular components and more.

Use property binding to dynamically set values for properties and attributes. You can do things such as toggle button features, set image paths programmatically, and share values between components.

Note: Learn more about [setting dynamic properties and attributes in the essentials guide](/essentials/templates#setting-dynamic-properties-and-attributes).

In this activity, you'll learn how to use property binding in templates.

<hr />

To bind to an element's attribute, wrap the attribute name in square brackets. Here's an example:

```angular-html
<img alt="photo" [src]="imageURL">
```

In this example, the value of the `src` attribute will be bound to the class property `imageURL`. Whatever value `imageURL` has will be set as the `src` attribute of the `img` tag.

<docs-workflow>

<docs-step title="Add a property called `isEditable`" header="app.ts" language="ts">
Update the code in `app.ts` by adding a property to the `App` class called `isEditable` with the initial value set to `true`.

<docs-code highlight="[2]">
export class App {
    isEditable = true;
}
</docs-code>
</docs-step>

<docs-step title="Bind to `contentEditable`" header="app.ts" language="ts">
Next, bind the `contentEditable` attribute of the `div` to the `isEditable` property by using the <code aria-label="square brackets">[]</code> syntax.

<docs-code highlight="[3]" language="angular-ts">
@Component({
    ...
    template: `<div [contentEditable]="isEditable"></div>`,
})
</docs-code>
</docs-step>

</docs-workflow>

The div is now editable. Nice work 👍

Property binding is one of Angular's many powerful features. If you'd like to learn more checkout [the Angular documentation](guide/templates/property-binding).
