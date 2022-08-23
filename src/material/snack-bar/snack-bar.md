`MatSnackBar` is a service for displaying snack-bar notifications.

<!-- example(snack-bar-overview) -->

### Opening a snackbar
A snackbar can contain either a string message or a given component.
```ts
// Simple message.
let snackBarRef = snackBar.open('Message archived');

// Simple message with an action.
let snackBarRef = snackBar.open('Message archived', 'Undo');

// Load the given component into the snackbar.
let snackBarRef = snackBar.openFromComponent(MessageArchivedComponent);
```

In either case, a `MatSnackBarRef` is returned. This can be used to dismiss the snackbar or to
receive notification of when the snackbar is dismissed. For simple messages with an action, the
`MatSnackBarRef` exposes an observable for when the action is triggered.
If you want to close a custom snackbar that was opened via `openFromComponent`, from within the
component itself, you can inject the `MatSnackBarRef`.

```ts
snackBarRef.afterDismissed().subscribe(() => {
  console.log('The snackbar was dismissed');
});


snackBarRef.onAction().subscribe(() => {
  console.log('The snackbar action was triggered!');
});

snackBarRef.dismiss();
```

### Dismissal
A snackbar can be dismissed manually by calling the `dismiss` method on the `MatSnackBarRef`
returned from the call to `open`.

Only one snackbar can ever be opened at one time. If a new snackbar is opened while a previous
message is still showing, the older message will be automatically dismissed.

A snackbar can also be given a duration via the optional configuration object:
```ts
snackBar.open('Message archived', 'Undo', {
  duration: 3000
});
```

### Sharing data with a custom snackbar
You can share data with the custom snackbar, that you opened via the `openFromComponent` method,
by passing it through the `data` property.

```ts
snackBar.openFromComponent(MessageArchivedComponent, {
  data: 'some data'
});
```

To access the data in your component, you have to use the `MAT_SNACK_BAR_DATA` injection token:

```ts
import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'your-snackbar',
  template: 'passed in {{ data }}',
})
export class MessageArchivedComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) { }
}
```

### Annotating custom snackbar content
When opening a custom snackbar via the `snackBar.openFromComponent` method, you can use the
following directives to annotate the content and ensure that it is styled consistently compared to
snackbars  opened via `snackBar.open`.

* `matSnackBarLabel` - Marks the text of the snackbar shown to users
* `matSnackBarActions` - Marks the container element containing any action buttons
* `matSnackBarAction` - Marks an individual action button

If no annotations are used, all the content will be treated as text content.

<!-- example({
  "example": "snack-bar-annotated-component-example",
  "file": "snack-bar-annotated-component-example-snack.html"
}) -->

### Setting the global configuration defaults
If you want to override the default snack bar options, you can do so using the
`MAT_SNACK_BAR_DEFAULT_OPTIONS` injection token.

```ts
@NgModule({
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
  ]
})
```

### Accessibility

`MatSnackBar` announces messages via an `aria-live` region. While announcements use the `polite`
setting by default, you can customize this by setting the `politeness` property of
`MatSnackBarConfig`.

`MatSnackBar` does not move focus to the snackbar element. Moving focus like this would disrupt
users in the middle of a workflow. For any action offered in the snackbar, your application should
provide an alternative way to perform the action. Alternative interactions are typically keyboard
shortcuts or menu options. You should dismiss the snackbar once the user performs its corresponding
action. A snackbar can contain a single action with an additional optional "dismiss" or "cancel"
action.

Avoid setting a `duration` for snackbars that have an action available, as screen reader users may
want to navigate to the snackbar element to activate the action. If the user has manually moved
their focus within the snackbar, you should return focus somewhere that makes sense in the context
of the user's workflow.
