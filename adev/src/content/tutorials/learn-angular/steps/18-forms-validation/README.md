# Validating forms

Another common scenario when working with forms is the need to validate the inputs to ensure the correct data is submitted.

In this activity, you'll learn how to validate forms with reactive forms.

<hr>

<docs-workflow>

<docs-step title="Import Validators">

Angular provides a set of validation tools. To use them, first update the component to import `Validators` from `@angular/forms`.

<docs-code language="ts" highlight="[1]">
import {ReactiveFormsModule, Validators} from '@angular/forms';

@Component({...})
export class AppComponent {}
</docs-code>

</docs-step>

<docs-step title="Add validation to form">

Every `FormControl` can be passed the `Validators` you want to use for validating the `FormControl` values. For example, if you want to make the fields for the `profileForm` required then use `Validators.required`. Update the `name` and `email` `FormControl` to be required:

```ts
profileForm = new FormGroup({
  name: new FormControl('', Validators.required),
  email: new FormControl('', Validators.required),
});
```

</docs-step>

<docs-step title="Check form validation in template">

To determine if a form is valid, the `FormGroup` class has a `valid` property.
You can use this property to dynamically bind attributes. Update the submit `button` to be enabled based on the validity of the form.

```html
<button type="submit" [disabled]="!profileForm.valid">Submit</button>
```

</docs-step>

</docs-workflow>

You now know the basics around how validation works with reactive forms.

Great job learning these core concepts of working with forms in Angular. If you want to learn more, be sure to refer to the [Angular forms documentation](guide/forms/form-validation).
