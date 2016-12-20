# MdDialog

MdDialog is a service, which opens dialogs components in the view.

### Methods

| Name | Description |
| ---- | ----------- |
| `open(component: ComponentType<T>, config: MdDialogConfig): MdDialogRef<T>` | Creates and opens a dialog matching material spec. |
| `closeAll(): void` | Closes all of the dialogs that are currently open. |

### Config

| Key | Description  |
| --- | ------------ |
| `role: DialogRole = 'dialog'` | The ARIA role of the dialog element. Possible values are `dialog` and `alertdialog`. Optional. |
| `disableClose: boolean = false` | Whether to prevent the user from closing a dialog by clicking on the backdrop or pressing escape. Optional. |
| `width: string = ''` | Width of the dialog. Takes any valid CSS value. Optional. |
| `height: string = ''` | Height of the dialog. Takes any valid CSS value. Optional. |
| `position: { top?: string, bottom?: string, left?: string, right?: string }` | Position of the dialog that overrides the default centering in it's axis. Optional. |
| `viewContainerRef: ViewContainerRef` | The view container ref to attach the dialog to. Optional. |

## MdDialogRef

A reference to the dialog created by the MdDialog `open` method.

### Methods

| Name | Description |
| ---- | ----------- |
| `close(dialogResult?: any)` | Closes the dialog, pushing a value to the afterClosed observable. |
| `afterClosed(): Observable<any>` | Returns an observable which will emit the dialog result, passed to the `close` method above. |

### Directives
| Name | Description  |
| ---  | ------------ |
| `md-dialog-title`   | Marks the title of the dialog.
| `md-dialog-content` | Scrollable content of the dialog.
| `md-dialog-close`   | When added to a `button`, makes the element act as a close button for the dialog.
| `md-dialog-actions` | Wrapper for the set of actions at the bottom of a dialog. Typically contains buttons.

## Example
The service can be injected in a component.

```ts
@Component({
  selector: 'pizza-component',
  template: `
  <button type="button" (click)="openDialog()">Open dialog</button>
  `
})
export class PizzaComponent {

  dialogRef: MdDialogRef<PizzaDialog>;

  constructor(public dialog: MdDialog) { }

  openDialog() {
    this.dialogRef = this.dialog.open(PizzaDialog, {
      disableClose: false
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('result: ' + result);
      this.dialogRef = null;
    });
  }
}

@Component({
  selector: 'pizza-dialog',
  template: `
  <h1 md-dialog-title>Would you like to order pizza?</h1>

  <md-dialog-actions>
    <button (click)="dialogRef.close('yes')">Yes</button>
    <button md-dialog-close>No</button>
  </md-dialog-actions>
  `
})
export class PizzaDialog {
  constructor(public dialogRef: MdDialogRef<PizzaDialog>) { }
}
```

The dialog component should be declared in the list of entry components of the module:

```ts
@NgModule({
  declarations: [
    ...,
    PizzaDialog
  ],
  entryComponents: [
    ...,
    PizzaDialog
  ],
  ...
})
export class AppModule { }

```
