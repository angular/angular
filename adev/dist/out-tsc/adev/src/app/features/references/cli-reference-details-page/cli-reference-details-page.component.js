/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DocViewer} from '@angular/docs';
let CliReferenceDetailsPage = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-cli-reference-page',
      imports: [DocViewer],
      templateUrl: './cli-reference-details-page.component.html',
      styleUrls: ['./cli-reference-details-page.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CliReferenceDetailsPage = class {
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
      CliReferenceDetailsPage = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    docContent = input();
  };
  return (CliReferenceDetailsPage = _classThis);
})();
export default CliReferenceDetailsPage;
//# sourceMappingURL=cli-reference-details-page.component.js.map
