/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarRef} from '@angular/material/snack-bar';
let ErrorSnackBar = (() => {
  let _classDecorators = [
    Component({
      selector: 'error-snack-bar',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    {{ message }}
    <button
      class="docs-primary-btn"
      type="button"
      matSnackBarAction
      [attr.text]="actionText"
      (click)="snackBarRef.dismissWithAction()"
    >
      {{ actionText }}
    </button>
  `,
      imports: [MatSnackBarAction],
      styles: `:host { display: flex; align-items: center; button { margin-left: 16px }}`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ErrorSnackBar = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ErrorSnackBar = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    snackBarRef = inject(MatSnackBarRef);
    message;
    actionText;
    constructor() {
      const data = inject(MAT_SNACK_BAR_DATA);
      this.message = data.message;
      this.actionText = data.actionText;
    }
  };
  return (ErrorSnackBar = _classThis);
})();
export {ErrorSnackBar};
//# sourceMappingURL=error-snack-bar.js.map
