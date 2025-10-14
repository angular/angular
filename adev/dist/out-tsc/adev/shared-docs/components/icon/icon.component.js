/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
let IconComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-icon',
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        'class': 'material-symbols-outlined',
        '[style.font-size.px]': 'fontSize()',
        'aria-hidden': 'true',
        'translate': 'no',
      },
      template: '<ng-content />',
      styleUrl: './icon.component.scss',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IconComponent = class {
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
      IconComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
    }
    static isFontLoaded = signal(false);
    fontSize = computed(() => (IconComponent.isFontLoaded() ? null : 0));
    /** Share the same promise across different instances of the component */
    static whenFontLoad;
    constructor() {
      if (IconComponent.isFontLoaded()) {
        return;
      }
      const document = inject(DOCUMENT);
      afterNextRender(async () => {
        IconComponent.whenFontLoad ??= document.fonts.load(
          'normal 1px "Material Symbols Outlined"',
        );
        await IconComponent.whenFontLoad;
        IconComponent.isFontLoaded.set(true);
      });
    }
    static {
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (IconComponent = _classThis);
})();
export {IconComponent};
//# sourceMappingURL=icon.component.js.map
