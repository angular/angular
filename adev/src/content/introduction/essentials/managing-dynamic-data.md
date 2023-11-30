<docs-decorative-header title="Managing Dynamic Data" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Define component state and behavior to manage dynamic data.
</docs-decorative-header>

Now that we have learned the basic structure for a component, let’s learn how you can define the component’s data (i.e., state) and behavior.

## What is state?

Components let you neatly encapsulate responsibility for discrete parts of your application. For example, a `SignUpForm` component might need to keep track of whether the form is valid or not before allowing users to take a specific action. As a result, the various properties that a component needs to track is often referred to as "state."

## Defining state

To define state, you use [class fields syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) inside of your component.

For example, using the `TodoListItem` component, create two properties that you want to track:

1. `taskTitle` — What the title of the task is
2. `isComplete` — Whether or not the task is complete

```ts
// todo-list-item.component.ts
@Component({ ... })
export class TodoListItem {
  taskTitle = '';
  isComplete = false;
}
```

## Updating state

When you want to update state, this is typically accomplished by defining methods in the component class that can access the various class fields with the `this` keyword.

```ts
// todo-list-item.component.ts
@Component({ ... })
export class TodoListItem {
  taskTitle = '';
  isComplete = false;

  completeTask() {
    this.isComplete = true;
  }

  updateTitle(newTitle: string) {
    this.taskTitle = newTitle;
  }
}
```

## Next Step

Now that you have learned how to declare and manage dynamic data, it's time to learn how to use that data inside of templates.

<docs-pill-row>
  <docs-pill title="Rendering Dynamic Templates" href="essentials/rendering-dynamic-templates" />
</docs-pill-row>
