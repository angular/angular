# Event handling

Event handling enables interactive features on web apps. It gives you the ability as a developer to respond to user actions like button presses, form submissions and more.

Note: Learn more about [handling user interaction in the essentials guide](/essentials/templates#handling-user-interaction).

In this activity, you'll learn how to add an event handler.

<hr />

In Angular you bind to events with the parentheses syntax `()`. On a given element, wrap the event you want to bind to with parentheses and set an event handler. Consider this `button` example:

```angular-ts
@Component({
    ...
    template: `<button (click)="greet()">`
})
class App {
    greet() {
        console.log('Hello, there 👋');
    }
}
```

In this example, the `greet()` function will run every time the button is clicked. Take note that the `greet()` syntax includes the trailing parenthesis.

Alright, your turn to give this a try:

<docs-workflow>

<docs-step title="Add an event handler">
Add the `onMouseOver` event handler function in the `App` class. Use the following code as the implementation:

```ts
onMouseOver() {
    this.message = 'Way to go 🚀';
}
```

</docs-step>

<docs-step title="Bind to the template event">
Update the template code in `app.ts` to bind to the `mouseover` event of the `section` element.

```angular-html
<section (mouseover)="onMouseOver()">
```

</docs-step>

</docs-workflow>

And with a few steps in the code you've created your first event handler in Angular. Seems like you are getting pretty good at this, keep up the good work.
