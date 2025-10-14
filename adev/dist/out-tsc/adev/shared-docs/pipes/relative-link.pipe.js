/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
import {normalizePath, removeTrailingSlash} from '../utils/index';
let RelativeLink = (() => {
  let _classDecorators = [
    Pipe({
      name: 'relativeLink',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RelativeLink = class {
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
      RelativeLink = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(absoluteUrl, result = 'relative') {
      const url = new URL(normalizePath(absoluteUrl));
      if (result === 'hash') {
        return url.hash?.substring(1) ?? '';
      }
      if (result === 'pathname') {
        return `${removeTrailingSlash(normalizePath(url.pathname))}`;
      }
      return `${removeTrailingSlash(normalizePath(url.pathname))}${url.hash ?? ''}`;
    }
  };
  return (RelativeLink = _classThis);
})();
export {RelativeLink};
//# sourceMappingURL=relative-link.pipe.js.map
