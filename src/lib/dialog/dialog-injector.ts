import {Injector, OpaqueToken} from '@angular/core';
import {MdDialogRef} from './dialog-ref';

export const MD_DIALOG_DATA = new OpaqueToken('MdDialogData');

/** Custom injector type specifically for instantiating components with a dialog. */
export class DialogInjector implements Injector {
  constructor(
    private _parentInjector: Injector,
    private _dialogRef: MdDialogRef<any>,
    private _data: any) { }

  get(token: any, notFoundValue?: any): any {
    if (token === MdDialogRef) {
      return this._dialogRef;
    }

    if (token === MD_DIALOG_DATA && this._data) {
      return this._data;
    }

    return this._parentInjector.get(token, notFoundValue);
  }
}
