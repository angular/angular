# Component Communication with `@Input`

Sometimes app development requires you to send data into a component. This data can be used to customize a component or perhaps send information from a parent component to a child component.

Angular uses a concept called `Input`. This is similar to `props` in other frameworks. To create an `Input` property, use the `@Input` decorator.

Note: Learn more about [accepting data with input properties in the inputs guide](/guide/components/inputs).

In this activity, you'll learn how to use the `@Input` decorator to send information to components.

<hr>

To create an `Input` property, add the `@Input` decorator to a property of a component class:

<docs-code header="user.ts" language="ts">
class User {
  @Input() occupation = '';
}
</docs-code>

When you are ready to pass in a value through an `Input`, values can be set in templates using the attribute syntax. Here's an example:

<docs-code header="app.ts" language="angular-ts" highlight="[3]">
@Component({
  ...
  template: `<app-user occupation="Angular Developer"></app-user>`
})
class App {}
</docs-code>

Make sure you bind the property `occupation` in your `User`.

<docs-code header="user.ts" language="angular-ts">
@Component({
  ...
  template: `<p>The user's occupation is {{occupation}}</p>`
})
</docs-code>

<docs-workflow>

<docs-step title="Define an `@Input` property">
Update the code in `user.ts` to define an `Input` property on the `User` called `name`. For now, set the initial value to `empty string`. Be sure to update the template to interpolate the `name` property at the end of the sentence.
</docs-step>

<docs-step title="Pass a value to the `@Input` property">
Update the code in `app.ts` to send in the `name` property with a value of `"Simran"`.
<br>

When the code has been successfully updated, the app will display `The user's name is Simran`.
</docs-step>

</docs-workflow>

While this is great, it is only one direction of the component communication. What if you want to send information and data to a parent component from a child component? Check out the next lesson to find out.

P.S. you are doing great - keep going 🎉
