import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FlyingHeroesPipe, FlyingHeroesImpurePipe} from './flying-heroes.pipe';
import {HEROES} from './heroes';
let FlyingHeroesComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-flying-heroes',
      templateUrl: './flying-heroes.component.html',
      imports: [CommonModule, FormsModule, FlyingHeroesPipe],
      styles: [
        `
    #flyers, #all {font-style: italic}
    button {display: block}
    input {margin: .25rem .25rem .5rem 0;}
  `,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FlyingHeroesComponent = class {
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
      FlyingHeroesComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroes = [];
    canFly = true;
    // #enddocregion v1
    mutate = true;
    title = 'Flying Heroes (pure pipe)';
    // #docregion v1
    constructor() {
      this.reset();
    }
    addHero(name) {
      name = name.trim();
      if (!name) {
        return;
      }
      const hero = {name, canFly: this.canFly};
      // #enddocregion v1
      if (this.mutate) {
        // Pure pipe won't update display because heroes array reference is unchanged
        // Impure pipe will display
        // #docregion v1
        // #docregion push
        this.heroes.push(hero);
        // #enddocregion push
        // #enddocregion v1
      } else {
        // Pipe updates display because heroes array is a new object
        this.heroes = this.heroes.concat(hero);
      }
      // #docregion v1
    }
    reset() {
      this.heroes = HEROES.slice();
    }
  };
  return (FlyingHeroesComponent = _classThis);
})();
export {FlyingHeroesComponent};
// #enddocregion v1
////// Identical except for impure pipe //////
let FlyingHeroesImpureComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-flying-heroes-impure',
      templateUrl: './flying-heroes-impure.component.html',
      imports: [CommonModule, FormsModule, FlyingHeroesImpurePipe],
      styles: [
        '#flyers, #all {font-style: italic}',
        'button {display: block}',
        'input {margin: .25rem .25rem .5rem 0;}',
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = FlyingHeroesComponent;
  var FlyingHeroesImpureComponent = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FlyingHeroesImpureComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    title = 'Flying Heroes (impure pipe)';
  };
  return (FlyingHeroesImpureComponent = _classThis);
})();
export {FlyingHeroesImpureComponent};
//# sourceMappingURL=flying-heroes.component.js.map
