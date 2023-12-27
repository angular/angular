# Getting form control value

Now that your forms are setup with Angular, the next step is to access the values from the form controls.

In this activity, you'll learn how to get the value from your form input.

<hr>

<docs-workflow>

<docs-step title="Show the value of the input field in the template">

To display the input value in a template, you can the use interpolation syntax `{{}}` just like any other class property of the component:

<docs-code language="ts" highlight="[5]">
@Component({
  selector: 'app-user',
  template: `
    ...
    <p>Framework: {{ favoriteFramework }}</p>
    <label for="framework">
      Favorite Framework:
      <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
    </label>
  `,
})
export class UserComponent {
  favoriteFramework = '';
}
</docs-code>

</docs-step>

<docs-step title="Retrieve the value of an input field">

When you need to reference the input field value in the component class, you can do so by accessing the class property with the `this` syntax.

<docs-code language="ts" highlight="[15]">
...
@Component({
  selector: 'app-user',
  template: `
    ...
    <button (click)="showFramework()">Show Framework</button>
  `,
  ...
})
export class UserComponent {
  favoriteFramework = '';
  ...

  showFramework() {
    alert(this.favoriteFramework);
  }
}
</docs-code>

</docs-step>

</docs-workflow>

Great job learning how to display the input values in your template and access them programmatically.

Time to progress onto the next way of managing forms with Angular: reactive forms. If you'd like to learn more about template-driven forms, please refer to the [Angular forms documentation](guide/forms/reactive-forms).
