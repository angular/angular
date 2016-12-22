`MdSnackBar` is a service for displaying snack-bar notifications.

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

In either case, an `MdSnackBarRef` is returned. This can be used to dismiss the snack-bar or to 
recieve notification of when the snack-bar is dismissed. For simple messages with an action, the 
`MdSnackBarRef` exposes an observable for when the action is triggered.

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
A snack-bar can be dismissed manually by calling the `dismiss` method on the `MdSnackBarRef` 
returned from the call to `open`.

Only one snack-bar can ever be opened at one time. If a new snackbar is opened while a previous
message is still showing, the older message will be automatically dismissed.

A snack-bar can also be given a duration via the optional configuration object:
```ts
snackbar.open('Message archived', 'Undo', {
  duration: 3000
});
```
