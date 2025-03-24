# Tracking expression caused re-creation of the DOM structure.

The identity track expression specified in the `@for` loop caused re-creation of the DOM corresponding to _all_ items. This is a very expensive operation that commonly occurs when working with immutable data structures. For example:

```typescript
@Component({
  template: `
    <button (click)="toggleAllDone()">All done!</button>
    <ul>
    @for (todo of todos; track todo) {
      <li>{{todo.task}}</li>
    }
    </ul>
  `,
})
export class App {
  todos = [
    { id: 0, task: 'understand trackBy', done: false },
    { id: 1, task: 'use proper tracking expression', done: false },
  ];

  toggleAllDone() {
    this.todos = this.todos.map(todo => ({ ...todo, done: true }));
  }
}
```

In the provided example, the entire list with all the views (DOM nodes, Angular directives, components, queries, etc.) are re-created (!) after toggling the "done" status of items. Here, a relatively inexpensive binding update to the `done` property would suffice. 

Apart from having a high performance penalty, re-creating the DOM tree results in loss of state in the DOM elements (ex.: focus, text selection, sites loaded in an iframe, etc.).

## Fixing the error

Change the tracking expression such that it uniquely identifies an item in a collection, regardless of its object identity. In the discussed example, the correct track expression would use the unique `id` property (`item.id`):

```typescript
@Component({
  template: `
    <button (click)="toggleAllDone()">All done!</button>
    <ul>
    @for (todo of todos; track todo.id) {
      <li>{{todo.task}}</li>
    }
    </ul>
  `,
})
export class App {
  todos = [
    { id: 0, task: 'understand trackBy', done: false },
    { id: 1, task: 'use proper tracking expression', done: false },
  ];

  toggleAllDone() {
    this.todos = this.todos.map(todo => ({ ...todo, done: true }));
  }
}
```
