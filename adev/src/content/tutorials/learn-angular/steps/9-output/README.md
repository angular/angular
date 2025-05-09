# Component Communication with `@Output`

When working with components it may be required to notify other components that something has happened. Perhaps a button has been clicked, an item has been added/removed from a list or some other important update has occurred. In this scenario components need to communicate with parent components.

Angular uses the `@Output` decorator to enable this type of behavior.

Note: Learn more about [custom events in the outputs guide](/guide/components/outputs).

In this activity, you'll learn how to use the `@Output` decorator and `EventEmitter` to communicate with components.

<hr />

To create the communication path from child to parent components, use the `@Output` decorator on a class property and assign it a value of type `EventEmitter`:

<docs-code header="child.ts" language="ts">
@Component({...})
class Child {
    @Output() incrementCountEvent = new EventEmitter<number>();
}
</docs-code>

Now the component can generate events that can be listened to by the parent component. Trigger events by calling the `emit` method:

<docs-code header="child.ts" language="ts">
class Child {
    ...

    onClick() {
        this.count++;
        this.incrementCountEvent.emit(this.count);
    }

}
</docs-code>

The emit function will generate an event with the same type as the `EventEmitter` instance.

Alright, your turn to give this a try. Complete the code by following these tasks:

<docs-workflow>

<docs-step title="Add an `@Output` property">
Update `child.ts` by adding an output property called `addItemEvent`, be sure to set the EventEmitter type to be `string`.
</docs-step>

<docs-step title="Complete `addItem` method">
In `child.ts` update the `addItem` method; use the following code as the logic:

<docs-code header="child.ts" highlight="[2]" language="ts">
addItem() {
  this.addItemEvent.emit('🐢');
}
</docs-code>

</docs-step>

<docs-step title="Update the `App` template">
In `app.ts` update the template to listen to the emitted event by adding the following code:

```angular-html
<app-child (addItemEvent)="addItem($event)" />
```

Now, the "Add Item" button adds a new item to the list every time the button is clicked.

</docs-step>

</docs-workflow>

Wow, at this point you've completed the component fundamentals - impressive 👏

Keep learning to unlock more of Angular's great features.
