# Reactive Forms

When you want to manage your forms programmatically instead of relying purely on the template, reactive forms are the answer.

Note: Learn more about [reactive forms in the in-depth guide](/guide/forms/reactive-forms).

In this activity, you'll learn how to set up reactive forms.

<hr>

<docs-workflow>

<docs-step title="Import `ReactiveForms` module">

In `app.ts`, import `ReactiveFormsModule` from `@angular/forms` and add it to the `imports` array of the component.

```angular-ts
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
    <form>
      <label>Name
        <input type="text" />
      </label>
      <label>Email
        <input type="email" />
      </label>
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [ReactiveFormsModule],
})
```

</docs-step>

<docs-step title="Create the `FormGroup` object with FormControls">

Reactive forms use the `FormControl` class to represent the form controls (e.g., inputs). Angular provides the `FormGroup` class to serve as a grouping of form controls into a helpful object that makes handling large forms more convenient for developers.

Add `FormControl` and `FormGroup` to the import from `@angular/forms` so that you can create a FormGroup for each form, with the properties `name` and `email` as FormControls.

```ts
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
...
export class App {
  profileForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
  });
}
```

</docs-step>

<docs-step title="Link the FormGroup and FormControls to the form">

Each `FormGroup` should be attached to a form using the `[formGroup]` directive.

In addition, each `FormControl` can be attached with the `formControlName` directive and assigned to the corresponding property. Update the template with the following form code:

```angular-html
<form [formGroup]="profileForm">
  <label>
    Name
    <input type="text" formControlName="name" />
  </label>
  <label>
    Email
    <input type="email" formControlName="email" />
  </label>
  <button type="submit">Submit</button>
</form>
```

</docs-step>

<docs-step title="Handle update to the form">

When you want to access data from the `FormGroup`, it can be done by accessing the value of the `FormGroup`. Update the `template` to display the form values:

```angular-html
...
<h2>Profile Form</h2>
<p>Name: {{ profileForm.value.name }}</p>
<p>Email: {{ profileForm.value.email }}</p>
```

</docs-step>

<docs-step title="Access FormGroup values">
Add a new method to the component class called `handleSubmit` that you'll later use to handle the form submission.
This method will display values from the form, you can access the values from the FormGroup.

In the component class, add the `handleSubmit()` method to handle the form submission.

<docs-code language="ts">
handleSubmit() {
  alert(
    this.profileForm.value.name + ' | ' + this.profileForm.value.email
  );
}
</docs-code>
</docs-step>

<docs-step title="Add `ngSubmit` to the form">
You have access to the form values, now it is time to handle the submission event and use the `handleSubmit` method.
Angular has an event handler for this specific purpose called `ngSubmit`. Update the form element to call the `handleSubmit` method when the form is submitted.

<docs-code language="angular-html" highlight="[3]">
<form
  [formGroup]="profileForm"
  (ngSubmit)="handleSubmit()">
</docs-code>

</docs-step>

</docs-workflow>

And just like that, you know how to work with reactive forms in Angular.

Fantastic job with this activity. Keep going to learn about form validation.
