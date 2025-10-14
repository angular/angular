/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
export const ALLOWED_COMMAND_PREFIXES = [
  'ng serve',
  'ng s',
  'ng generate',
  'ng g',
  'ng version',
  'ng v',
  'ng update',
  'ng test',
  'ng t',
  'ng e2e',
  'ng e',
  'ng add',
  'ng config',
  'ng new',
];
let CommandValidator = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CommandValidator = class {
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
      CommandValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Method return true when the provided command is allowed to execute, otherwise return false.
    validate(command) {
      return ALLOWED_COMMAND_PREFIXES.some(
        (prefix) => prefix === command || command.startsWith(`${prefix} `),
      );
    }
  };
  return (CommandValidator = _classThis);
})();
export {CommandValidator};
//# sourceMappingURL=command-validator.service.js.map
