/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DocViewer} from '@angular/docs';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
let DocsComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-docs',
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [DocViewer],
      styleUrls: ['./docs.component.scss'],
      templateUrl: './docs.component.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DocsComponent = class {
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
      DocsComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Based on current route, proper static content for doc page is fetched.
    // In case when exists example-viewer placeholders, then ExampleViewer
    // components are going to be rendered.
    docContent = input();
  };
  return (DocsComponent = _classThis);
})();
export default DocsComponent;
//# sourceMappingURL=docs.component.js.map
