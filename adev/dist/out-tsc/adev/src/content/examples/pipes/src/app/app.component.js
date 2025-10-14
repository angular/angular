import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {BirthdayComponent} from './birthday.component';
import {BirthdayFormattingComponent} from './birthday-formatting.component';
import {BirthdayPipeChainingComponent} from './birthday-pipe-chaining.component';
import {FlyingHeroesComponent, FlyingHeroesImpureComponent} from './flying-heroes.component';
import {HeroAsyncMessageComponent} from './hero-async-message.component';
import {PrecedenceComponent} from './precedence.component';
import {JsonPipeComponent} from './json-pipe.component';
import {PowerBoosterComponent} from './power-booster.component';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      imports: [
        // Example components
        BirthdayComponent,
        BirthdayFormattingComponent,
        BirthdayPipeChainingComponent,
        FlyingHeroesComponent,
        FlyingHeroesImpureComponent,
        HeroAsyncMessageComponent,
        PrecedenceComponent,
        JsonPipeComponent,
        PowerBoosterComponent,
      ],
      styles: [
        'a[href] {display: block; padding: 10px 0;}',
        'a:hover {text-decoration: none;}',
        'h2 {margin: 0;}',
        'code {font-family: monospace; background-color: #eee; padding: 0.5em;}',
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
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
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
