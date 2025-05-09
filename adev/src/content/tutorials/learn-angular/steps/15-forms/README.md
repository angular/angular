# Forms Overview

Forms are a big part of many apps because they enable your app to accept user input. Let's learn about how forms are handled in Angular.

In Angular, there are two types of forms: template-driven and reactive. You'll learn about both over the next few activities.

Note: Learn more about [forms in Angular in the in-depth guide](/guide/forms).

In this activity, you'll learn how to set up a form using a template-driven approach.

<hr>

<docs-workflow>

<docs-step title="Create an input field">

In `user.ts`, update the template by adding a text input with the `id` set to `framework`, type set to `text`.

```angular-html
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" />
</label>
```

</docs-step>

<docs-step title="Import `FormsModule`">

For this form to use Angular features that enable data binding to forms, you'll need to import the `FormsModule`.

Import the `FormsModule` from `@angular/forms` and add it to the `imports` array of the `User`.

<docs-code language="ts" highlight="[2, 7]">
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
...
imports: [FormsModule],
})
export class User {}
</docs-code>

</docs-step>

<docs-step title="Add binding to the value of the input">

The `FormsModule` has a directive called `ngModel` that binds the value of the input to a property in your class.

Update the input to use the `ngModel` directive, specifically with the following syntax `[(ngModel)]="favoriteFramework"` to bind to the `favoriteFramework` property.

<docs-code language="html" highlight="[3]">
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
</label>
</docs-code>

After you've made changes, try entering a value in the input field. Notice how it updates on the screen (yes, very cool).

NOTE: The syntax `[()]` is known as "banana in a box" but it represents two-way binding: property binding and event binding. Learn more in the [Angular docs about two-way data binding](guide/templates/two-way-binding).

</docs-step>

</docs-workflow>

You've now taken an important first step towards building forms with Angular.

Nice work. Let's keep the momentum going!
