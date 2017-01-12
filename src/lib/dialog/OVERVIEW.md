The `MdDialog` service can be used to open modal dialogs with Material Design styling and 
animations.

<!-- example(dialog-overview) -->

A dialog is opened by calling the `open` method with a component to be loaded and an optional 
config object. The `open` method will return an instance of `MdDialogRef`:

```ts
let dialogRef = dialog.open(UserProfileComponent, {
  height: '400px',
  width: '600px',
});
```

The `MdDialogRef` provides a handle on the opened dialog. It can be used to close the dialog and to
receive notification when the dialog has been closed.

```ts
dialogRef.afterClosed.then(result => {
  console.log(`Dialog result: ${result}`); // Pizza!
});

dialogRef.close('Pizza!');

```

Components created via `MdDialog` can _inject_ `MdDialogRef` and use it to close the dialog
in which they are contained. When closing, an optional result value can be provided. This result
value is forwarded as the result of the `afterClosed` promise. 

### Dialog content
Several directives are available to make it easier to structure your dialog content:

| Name                  | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `md-dialog-title`     | \[Attr] Dialog title, applied to a heading element (e.g., `<h1>`, `<h2>`)|
| `<md-dialog-content>` | Primary scrollable content of the dialog                                 |
| `<md-dialog-actions>` | Container for action buttons at the bottom of the dialog                 |
| `md-dialog-close`     | \[Attr] Added to a `<button>`, makes the button close the dialog on click|

Once a dialog opens, the dialog will automatically focus the first tabbable element.

You can control which elements are tab stops with the `tabindex` attribute

```html
<button md-button tabindex="-1">Not Tabbable</button>
```
