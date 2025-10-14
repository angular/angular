import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {Home} from './home/home';
import {RouterLink, RouterOutlet} from '@angular/router';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [Home, RouterLink, RouterOutlet],
      template: `
    <main>
      <a [routerLink]="['/']">
        <header class="brand-name">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true" />
        </header>
      </a>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
      styleUrls: ['./app.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var App = class {
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
      App = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    title = 'homes';
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
