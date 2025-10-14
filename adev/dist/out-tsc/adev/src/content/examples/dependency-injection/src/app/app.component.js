import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HeroesComponent} from './heroes/heroes.component';
import {HeroesTspComponent} from './heroes/heroes-tsp.component';
import {ProvidersComponent} from './providers.component';
import {CarComponent} from './car/car.component';
import {InjectorComponent} from './injector.component';
import {TestComponent} from './test.component';
import {NgIf} from '@angular/common';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <h1>{{title}}</h1>
    <app-car></app-car>
    <app-injectors></app-injectors>
    <app-tests></app-tests>
    <h2>User</h2>
    <p id="user">
      {{userInfo}}
      <button type="button" (click)="nextUser()">Next User</button>
    <p>
    @if (isAuthorized) {
      <app-heroes id="authorized"></app-heroes>
    }
    @if (!isAuthorized) {
      <app-heroes id="unauthorized"></app-heroes>
    }
    @if (isAuthorized) {
      <app-heroes-tsp id="tspAuthorized"></app-heroes-tsp>
    }
    <app-providers></app-providers>
  `,
      imports: [
        HeroesComponent,
        HeroesTspComponent,
        ProvidersComponent,
        CarComponent,
        InjectorComponent,
        TestComponent,
        NgIf,
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
    userService;
    title;
    constructor(config, userService) {
      this.userService = userService;
      this.title = config.title;
    }
    get isAuthorized() {
      return this.user.isAuthorized;
    }
    nextUser() {
      this.userService.getNewUser();
    }
    get user() {
      return this.userService.user;
    }
    get userInfo() {
      return (
        `Current user, ${this.user.name}, is ` + `${this.isAuthorized ? '' : 'not'} authorized. `
      );
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
