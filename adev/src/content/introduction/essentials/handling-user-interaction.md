<docs-decorative-header title="Handling User Interaction" imgSrc="adev/src/assets/images/overview.svg"> <!-- markdownlint-disable-line -->
Handle user interaction in your application.
</docs-decorative-header>

The ability to handle user interaction and then work with - it is one of the key aspects of building dynamic applications. In this guide, we'll take a look at simple user interaction - event handling.

## Event Handling

You can add an event handler to an element by:

1. Adding an attribute with the events name inside of parentheses
2. Specify what JavaScript statement you want to run when it fires

```html
<button (click)="save()">Save</button>
```

For example, if we wanted to create a button that would run a `transformText` function when the `click` event is fired, it would look like the following:

```ts
// text-transformer.component.ts
@Component({
  standalone: true,
  selector: 'text-transformer',
  template: `
    <p>{{ announcement }}</p>
    <button (click)="transformText()">Abracadabra!</button>
  `,
})
export class TextTransformer {
  announcement = 'Hello again Angular!';

  transformText() {
    this.announcement = this.announcement.toUpperCase();
  }
}
```

Other common examples of event listeners include:

- `<input (keyup)="validateInput()" />`
- `<input (keydown)="updateInput()" />`

### $event

If you need to access the [event](https://developer.mozilla.org/en-US/docs/Web/API/Event) object, Angular provides an implicit `$event` variable that you can pass to a function:

```html
<button (click)="createUser($event)">Submit</button>
```

## Next Step

<docs-pill-row>
  <docs-pill title="Sharing Logic" href="essentials/sharing-logic" />
</docs-pill-row>
