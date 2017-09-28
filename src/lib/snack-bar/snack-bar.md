`MatSnackBar` is a service for displaying snack-bar notifications.

<!-- example(snack-bar-overview) -->

### Opening a snack-bar
A snack-bar can contain either a string message or a given component.
```ts
// Simple message.
let snackBarRef = snackBar.open('Message archived');

// Simple message with an action.
let snackBarRef = snackBar.open('Message archived', 'Undo');

// Load the given component into the snack-bar.
let snackBarRef = snackbar.openFromComponent(MessageArchivedComponent);
```

In either case, a `MatSnackBarRef` is returned. This can be used to dismiss the snack-bar or to
receive notification of when the snack-bar is dismissed. For simple messages with an action, the
`MatSnackBarRef` exposes an observable for when the action is triggered.
If you want to close a custom snack-bar that was opened via `openFromComponent`, from within the
component itself, you can inject the `MatSnackBarRef`.

```ts
snackBarRef.afterDismissed().subscribe(() => {
  console.log('The snack-bar was dismissed');
});


snackBarRef.onAction().subscribe(() => {
  console.log('The snack-bar action was triggered!');
});

snackBarRef.dismiss();
```

### Dismissal
A snack-bar can be dismissed manually by calling the `dismiss` method on the `MatSnackBarRef`
returned from the call to `open`.

Only one snack-bar can ever be opened at one time. If a new snackbar is opened while a previous
message is still showing, the older message will be automatically dismissed.

A snack-bar can also be given a duration via the optional configuration object:
```ts
snackbar.open('Message archived', 'Undo', {
  duration: 3000
});
```

### Sharing data with a custom snack-bar
You can share data with the custom snack-bar, that you opened via the `openFromComponent` method,
by passing it through the `data` property.

```ts
snackbar.openFromComponent(MessageArchivedComponent, {
  data: 'some data'
});
```

To access the data in your component, you have to use the `MAT_SNACK_BAR_DATA` injection token:

```ts
import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';

@Component({
  selector: 'your-snack-bar',
  template: 'passed in {{ data }}',
})
export class MessageArchivedComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
```
### Accessibility
Snack-bar messages are announced via an `aria-live` region. Focus is not moved to
the snack-bar element, as this would be disruptive to a user in the middle of a
workflow. For any action offered in the snack-bar, the application should offer the
user an alternative way to perform the action (typically via keyboard shortcut).
