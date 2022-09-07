The `MatDialog` service can be used to open modal dialogs with Material Design styling and
animations.

<!-- example(dialog-overview) -->

A dialog is opened by calling the `open` method with a component to be loaded and an optional
config object. The `open` method will return an instance of `MatDialogRef`:

```ts
let dialogRef = dialog.open(UserProfileComponent, {
  height: '400px',
  width: '600px',
});
```

The `MatDialogRef` provides a handle on the opened dialog. It can be used to close the dialog and to
receive notifications when the dialog has been closed. Any notification Observables will complete when the dialog closes.

```ts
dialogRef.afterClosed().subscribe(result => {
  console.log(`Dialog result: ${result}`); // Pizza!
});

dialogRef.close('Pizza!');
```

Components created via `MatDialog` can _inject_ `MatDialogRef` and use it to close the dialog
in which they are contained. When closing, an optional result value can be provided. This result
value is forwarded as the result of the `afterClosed` Observable.

```ts
@Component({/* ... */})
export class YourDialog {
  constructor(public dialogRef: MatDialogRef<YourDialog>) { }

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
}
```

### Specifying global configuration defaults
Default dialog options can be specified by providing an instance of `MatDialogConfig` for
MAT_DIALOG_DEFAULT_OPTIONS in your application's root module.

```ts
@NgModule({
  providers: [
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ]
})
```

### Sharing data with the Dialog component.
If you want to share data with your dialog, you can use the `data`
option to pass information to the dialog component.

```ts
let dialogRef = dialog.open(YourDialog, {
  data: { name: 'austin' },
});
```

To access the data in your dialog component, you have to use the MAT_DIALOG_DATA injection token:

```ts
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'your-dialog',
  template: 'passed in {{ data.name }}',
})
export class YourDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {name: string}) { }
}
```

Note that if you're using a template dialog (one that was opened with a `TemplateRef`), the data
will be available implicitly in the template:

```html
<ng-template let-data>
  Hello, {{data.name}}
</ng-template>
```

<!-- example(dialog-data) -->

### Dialog content
Several directives are available to make it easier to structure your dialog content:

| Name                   | Description                                                                                                   |
|------------------------|---------------------------------------------------------------------------------------------------------------|
| `mat-dialog-title`     | \[Attr] Dialog title, applied to a heading element (e.g., `<h1>`, `<h2>`)                                     |
| `<mat-dialog-content>` | Primary scrollable content of the dialog.                                                                     |
| `<mat-dialog-actions>` | Container for action buttons at the bottom of the dialog. Button alignment can be controlled via the `align` attribute which can be set to `end` and `center`.                                                      |
| `mat-dialog-close`     | \[Attr] Added to a `<button>`, makes the button close the dialog with an optional result from the bound value.|

For example:
```html
<h2 mat-dialog-title>Delete all elements?</h2>
<mat-dialog-content>This will delete all elements that are currently on this page and cannot be undone.</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button mat-dialog-close>Cancel</button>
  <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
  <button mat-button [mat-dialog-close]="true">Delete</button>
</mat-dialog-actions>
```

Once a dialog opens, the dialog will automatically focus the first tabbable element.

You can control which elements are tab stops with the `tabindex` attribute

```html
<button mat-button tabindex="-1">Not Tabbable</button>
```

<!-- example(dialog-content) -->

### Controlling the dialog animation
You can control the duration of the dialog's enter and exit animations using the
`enterAnimationDuration` and `exitAnimationDuration` options. If you want to disable the dialog's
animation completely, you can do so by setting the properties to `0ms`.

<!-- example(dialog-animations) -->

### Accessibility

`MatDialog` creates modal dialogs that implements the ARIA `role="dialog"` pattern by default.
You can change the dialog's role to `alertdialog` via `MatDialogConfig`.

You should provide an accessible label to this root dialog element by setting the `ariaLabel` or
`ariaLabelledBy` properties of `MatDialogConfig`. You can additionally specify a description element
ID via the `ariaDescribedBy` property of `MatDialogConfig`.

#### Keyboard interaction
By default, the escape key closes `MatDialog`. While you can disable this behavior via
the `disableClose` property of `MatDialogConfig`, doing this breaks the expected interaction
pattern for the ARIA `role="dialog"` pattern.

#### Focus management

When opened, `MatDialog` traps browser focus such that it cannot escape the root
`role="dialog"` element. By default, the first tabbable element in the dialog receives focus.
You can customize which element receives focus with the `autoFocus` property of
`MatDialogConfig`, which supports the following values.

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

When closed, `MatDialog` restores focus to the element that previously held focus when the
dialog opened. However, if that previously focused element no longer exists, you must
add additional handling to return focus to an element that makes sense for the user's workflow.
Opening a dialog from a menu is one common pattern that causes this situation. The menu
closes upon clicking an item, thus the focused menu item is no longer in the DOM when the bottom
sheet attempts to restore focus.

You can add handling for this situation with the `afterClosed()` observable from `MatDialogRef`.

<!-- example({"example":"dialog-from-menu",
              "file":"dialog-from-menu-example.ts",
              "region":"focus-restoration"}) -->
