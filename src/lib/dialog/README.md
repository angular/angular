# MdDialog

MdDialog is a service, which opens dialogs components in the view.

### Methods

| Name |  Description |
| --- | --- |
| `open(component: ComponentType<T>, config: MdDialogConfig): MdDialogRef<T>` | Creates and opens a dialog matching material spec. |

### Config

| Key |  Description |
| --- | --- |
| `role: DialogRole = 'dialog'` | The ARIA role of the dialog element. Possible values are `dialog` and `alertdialog`. Defaults to `dialog`. |
| `disableClose: boolean = false` | Whether to prevent the user from closing a dialog by clicking on the backdrop or pressing escape. Defaults to `false`. |
| `viewContainerRef: ViewContainerRef` | The view container ref to attach the dialog to. Optional. |

## MdDialogRef

A reference to the dialog created by the MdDialog `open` method.

### Methods

| Name |  Description |
| --- | --- |
| `close(dialogResult?: any)` | Closes the dialog, pushing a value to the afterClosed observable. |
| `afterClosed(): Observable<any>` | Returns an observable which will emit the dialog result, passed to the `close` method above. |

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
  <button type="button" (click)="dialogRef.close('yes')">Yes</button>
  <button type="button" (click)="dialogRef.close('no')">No</button>
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
