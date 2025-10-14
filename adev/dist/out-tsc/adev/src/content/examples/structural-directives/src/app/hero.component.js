import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {IfLoadedDirective} from './if-loaded.directive';
import {heroes} from './hero';
let HeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero',
      template: `
    <button (click)="onLoadHero()">Load Hero</button>
    <p *appIfLoaded="heroLoadingState">{{ heroLoadingState.data | json }}</p>
  `,
      imports: [IfLoadedDirective, JsonPipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroComponent = class {
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
      HeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroLoadingState = {type: 'loading'};
    onLoadHero() {
      this.heroLoadingState = {type: 'loaded', data: heroes[0]};
    }
  };
  return (HeroComponent = _classThis);
})();
export {HeroComponent};
//# sourceMappingURL=hero.component.js.map
