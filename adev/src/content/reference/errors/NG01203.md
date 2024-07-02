# Missing value accessor

For all custom form controls, you must register a value accessor.

Here's an example of how to provide one:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyInputField),
    multi: true,
  }
]
```

## Debugging the error

As described above, your control was expected to have a value accessor, but was missing one. However, there are many different reasons this can happen in practice. Here's a listing of some known problems leading to this error.

1. If you **defined** a custom form control, did you remember to provide a value accessor?
1. Did you put `ngModel` on an element with no value, or an **invalid element** (e.g. `<div [(ngModel)]="foo">`)?
1. Are you using a custom form control declared inside an `NgModule`? if so, make sure you are **importing** the `NgModule`.
1. Are you using `ngModel` with a third-party custom form control? Check whether that control provides a value accessor. If not, use **`ngDefaultControl`** on the control's element.
1. Are you **testing** a custom form control? Be sure to configure your testbed to know about the control. You can do so with `Testbed.configureTestingModule`.
1. Are you using **Nx and Module Federation** with webpack? Your `webpack.config.js` may require [extra configuration](https://github.com/angular/angular/issues/43821#issuecomment-1054845431) to ensure the forms package is shared.
