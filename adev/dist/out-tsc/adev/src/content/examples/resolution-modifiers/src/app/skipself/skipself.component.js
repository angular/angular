import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {LeafService} from '../leaf.service';
// #docregion skipself-component
let SkipselfComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-skipself',
      templateUrl: './skipself.component.html',
      styleUrls: ['./skipself.component.css'],
      // Angular would ignore this LeafService instance
      providers: [{provide: LeafService, useValue: {emoji: '🍁'}}],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SkipselfComponent = class {
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
      SkipselfComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    leaf;
    // Use @SkipSelf() in the constructor
    constructor(leaf) {
      this.leaf = leaf;
    }
  };
  return (SkipselfComponent = _classThis);
})();
export {SkipselfComponent};
// #enddocregion skipself-component
// @SkipSelf(): Specifies that the dependency resolution should start from the parent injector, not here.
//# sourceMappingURL=skipself.component.js.map
