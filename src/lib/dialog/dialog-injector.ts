import {Injector, InjectionToken} from '@angular/core';
import {MdDialogRef} from './dialog-ref';

export const MD_DIALOG_DATA = new InjectionToken<any>('MdDialogData');

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

    if (token === MD_DIALOG_DATA) {
      return this._data;
    }

    return this._parentInjector.get<any>(token, notFoundValue);
  }
}
