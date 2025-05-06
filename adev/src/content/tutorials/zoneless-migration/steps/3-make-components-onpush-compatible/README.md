# Make components OnPush compatible

An "OnPush compatible" component can is one that can use
`ChangeDetectionStrategy.OnPush`. If the component uses `OnPush` and doesn't indicate it needs to be updated, the
application skips it during synchronization, which improves performance. See
[Skipping subtrees](https://angular.dev/best-practices/skipping-subtrees) for more information.

You might want to delay this change for the following reasons:

*   Your component is part of a library that creates and attaches child
    components. These child components might rely on
    `ChangeDetectionStrategy.Default`. The current component's template bindings
    might be compatible with `OnPush`, but child components might not be.
*   You might want to defer switching to `OnPush` until after more rigorous
    application testing.

This tutorial covers the two common tools for making a component work with
`OnPush` and zoneless. Although you can always use one of these two methods,
application code style, public API constraints, or other factors might
restrict your choice.

A previous section of this tutorial added the `provideZoneChangeDetection`
provider to disable ZoneJS for this test suite. Removing this provider
re-enables zoneless for the tests and resolves the failures. The demo application
also uses zoneless, so you can see the fixes take effect outside of the tests.

<hr>

<docs-workflow>

<docs-step title="Review state of the world">

```shell
ng test --watch
```

There should be 3 failures. Also notice that the application never appears to
finish loading.

</docs-step>

<docs-step title="Use ChangeDetectorRef.markForCheck()">

You will notice that the application never transitions from the initial loading state. Often, the
quickest option for a spot fix is to use `ChangeDetectorRef.markForCheck()`
after updating the state variable in order to notify Angular of the change.

`ChangeDetectorRef` is already injected.

To inform Angular that template variables changed in
`loadTodos`, add the following code:

```typescript
this.changeDetectorRef.markForCheck();
```

The "should display data once loaded" test should now pass, with only two
remaining failures.

</docs-step>

<docs-step title="Update remainingTodos to be a signal">

The most straightforward, reliable, and performant way to
ensure component compatibility with `OnPush` and zoneless is to use
[signals](https://angular.dev/essentials/signals) for any state that the
template or host bindings read. Angular automatically tracks these signals. When the values change, Angular 
schedules synchronization and identifies the components that require updates.

Return to the `app/app.spec.ts` file and review the failing test, "can remove an
incomplete item from the list".

Change the `remainingTodos` component property to a signal:

```typescript
remainingTodos = signal(0);
```

Then, modify the `updateRemainingTodos` method to set the signal value:

```typescript
const incompleteTodos = this.todos.filter((todo) => !todo.completed);
this.remainingTodos.set(incompleteTodos.length);
```

Finally, update the template to read the signal value:

```html
<span>{{ remainingTodos() }} remaining</span>
```

</docs-step>

<docs-step title="Fix the test: 'can remove a completed item from the list'">

The `remainingTodos` variable was changed to a signal, but a failing test occurs
when a completed item is removed. Even though the value of `remainingTodos` is
recomputed whenever an item is removed, the number of remaining items does not
change if an already completed todo is removed.

Make the `todos` array a signal:

```typescript
  todos = signal<Todo[]>([]);
```

Update all instances of `todos` in the template to `todos()` (5 instances).

Use the `set` or `update` method for every signal mutation:

```typescript
// loadTodos
this.todos.set(await this.todoService.getTodos());
// addTodo
const newTodo = await this.todoService.addTodo(text);
this.todos.update((todos) => [...todos, newTodo]);
// toggleComplete
this.todos.update((todos) => {
  todos[index] = updatedTodo;
  return [...todos];
});
// removeTodo
this.todos.update((todos) => todos.filter((todo) => todo.id !== todoToRemove.id));
```

</docs-step>

<docs-step title="[Optional] Review final state and clean up">

The `todos` array, now a `signal`, eliminates the need for
`ChangeDetectorRef.markForCheck`.

NOTE: Reverting the previous step highlights the iterative nature of this migration.
Changes can be deployed incrementally, unlike enabling
`ChangeDetectionStrategy.OnPush` at the outset, which requires full component
compatibility beforehand.

The `remainingTodos` value, currently manually recomputed with the
`updateRemainingTodos` function, can be converted to a `computed` value for
automatic recomputation upon array mutation:

```typescript
remainingTodos = computed(() => this.todos().filter((todo) => !todo.completed).length);
```

Consider also converting `isLoading` to a signal. While not strictly necessary
due to its update with the `todos` array, this conversion improves
long-term maintainability as the component evolves.

 </docs-step>

</docs-workflow>

Congratulations! All your tests should be passing again and your app now works
with `OnPush` and zoneless.

HELPFUL: This solution ended with the component using signals everywhere, but this
approach may not be feasible for libraries or large applications.
`ChangeDetectorRef.markForCheck` helps make the component compatible with
`OnPush` without requiring updates everywhere the value is read to invoke the
signal value getter.
