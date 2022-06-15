The `Dialog` service can be used to open unstyled modal dialogs and to build your own dialog
services.

<!-- example(cdk-dialog-overview) -->

You can open a dialog by calling the `open` method either with a component or with a `TemplateRef`
representing the dialog content. The method additionally accepts an optional configuration object.
The `open` method returns a `DialogRef` instance:

```ts
const dialogRef = dialog.open(UserProfileComponent, {
  height: '400px',
  width: '600px',
  panelClass: 'my-dialog',
});
```

The `DialogRef` provides a reference to the opened dialog. You can use the `DialogRef` to close the
dialog, subscribe to dialog events, and modify dialog state. All `Observable` instances on the
`DialogRef` complete when the dialog closes.

```ts
dialogRef.closed.subscribe(result => {
  console.log(`Dialog result: ${result}`); // Pizza!
});

dialogRef.close('Pizza!');
```

Components created via `Dialog` can _inject_ `DialogRef` and use it to close the dialog
in which they are contained. When closing, an optional result value can be provided. This result
value is forwarded as the result of the `closed` Observable.

```ts
@Component({/* ... */})
export class YourDialog {
  constructor(public dialogRef: DialogRef<string>) {}

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
}
```

### Dialog styling

The `Dialog` service includes an intentionally limited set of structural styles. You can customize
the dialog's appearance using one of the following approaches.

#### `panelClass` option
The `panelClass` property of `DialogConfig` allows you to apply one or more CSS classes to the
overlay element that contains the custom dialog content. Any styles targeting these CSS classes
must be global styles.

#### Styling the dialog component
You can use the `styles` or `styleUrls` of a custom component to style the dialog content:

```ts
// MyDialog is rendered via `dialog.open(MyDialog)`
@Component({
  selector: 'my-dialog',
  styles: [`
    :host {
      display: block;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
    }
  `]
})
class MyDialog {}
```

<!-- example(cdk-dialog-styling) -->

#### Providing a custom dialog container
If you want more control over the dialog's behavior and styling, you can provide your own dialog
container component using the `container` option in `DialogConfig`. This approach requires more
code up-front, but it allows you to customize the DOM structure and behavior of the container
around the dialog content. Custom container components can optionally extend `CdkDialogContainer`
to inherit standard behaviors, such as accessible focus management.

```ts
import {CdkDialogContainer} from '@angular/cdk/dialog';

@Component({
  selector: 'my-dialog-container',
  styles: [`
    :host {
      display: block;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
    }
  `]
})
class MyDialogContainer extends CdkDialogContainer {}
```

### Specifying global configuration defaults
Default dialog options can be specified by providing an instance of `DialogConfig` for
`DEFAULT_DIALOG_CONFIG` in your application's root module.

```ts
@NgModule({
  providers: [
    {provide: DEFAULT_DIALOG_CONFIG, useValue: {hasBackdrop: false}}
  ]
})
```

### Sharing data with the Dialog component.
You can use the `data` option to pass information to the dialog component.

```ts
const dialogRef = dialog.open(YourDialog, {
  data: {name: 'frodo'},
});
```

Access the data in your dialog component with the `DIALOG_DATA` injection token:

```ts
import {Component, Inject} from '@angular/core';
import {DIALOG_DATA} from '@angular/cdk/dialog';

@Component({
  selector: 'your-dialog',
  template: 'passed in {{ data.name }}',
})
export class YourDialog {
  constructor(@Inject(DIALOG_DATA) public data: {name: string}) { }
}
```

If you're using a `TemplateRef` for your dialog content, the data is available in the template:

```html
<ng-template let-data>
  Hello, {{data.name}}
</ng-template>
```

<!-- example(cdk-dialog-data) -->

### Accessibility

`Dialog` creates modal dialogs that implement the ARIA `role="dialog"` pattern by default.
You can change the dialog's role to `alertdialog` via the `DialogConfig`.

You should provide an accessible label to this root dialog element by setting the `ariaLabel` or
`ariaLabelledBy` properties of `DialogConfig`. You can additionally specify a description element
ID via the `ariaDescribedBy` property of `DialogConfig`.

#### Keyboard interaction

By default, the escape key closes `Dialog`. While you can disable this behavior via the
`disableClose` property of `DialogConfig`, doing this breaks the expected interaction pattern
for the ARIA `role="dialog"` pattern.

#### Focus management

When opened, `Dialog` traps browser focus such that it cannot escape the root
`role="dialog"` element. By default, the first tabbable element in the dialog receives focus.
You can customize which element receives focus with the `autoFocus` property of
`DialogConfig`, which supports the following values.

| Value            | Behavior                                                                 |
|------------------|--------------------------------------------------------------------------|
| `first-tabbable` | Focus the first tabbable element. This is the default setting.           |
| `first-header`   | Focus the first header element (`role="heading"`, `h1` through `h6`)     |
| `dialog`         | Focus the root `role="dialog"` element.                                  |
| Any CSS selector | Focus the first element matching the given selector.                     |

While the default setting applies the best behavior for most applications, special cases may benefit
from these alternatives. Always test your application to verify the behavior that works best for
your users.

#### Focus restoration

When closed, `Dialog` restores focus to the element that previously held focus when the
dialog opened by default. You can customize the focus restoration behavior using the `restoreFocus`
property of `DialogConfig`. It supports the following values.

| Value type       | Behavior                                                                                                         |
|------------------|------------------------------------------------------------------------------------------------------------------|
| `boolean`        | When `true`, focus will be restored to the previously-focused element, otherwise focus won't be restored at all. |
| `string`         | Value is treated as a CSS selector. Focus will be restored to the element matching the selector.                 |
| `HTMLElement`    | Specific element that focus should be restored to.                                                               |
