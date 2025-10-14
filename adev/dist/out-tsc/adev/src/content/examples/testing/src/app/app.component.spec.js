import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, NO_ERRORS_SCHEMA} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter, Router, RouterLink, RouterOutlet} from '@angular/router';
import {AppComponent} from './app.component';
import {appConfig} from './app.config';
import {UserService} from './model';
import {WelcomeComponent} from './welcome/welcome.component';
// #docregion component-stubs
let BannerStubComponent = (() => {
  let _classDecorators = [Component({selector: 'app-banner', template: ''})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BannerStubComponent = class {
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
      BannerStubComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (BannerStubComponent = _classThis);
})();
let RouterOutletStubComponent = (() => {
  let _classDecorators = [Component({selector: 'router-outlet', template: ''})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RouterOutletStubComponent = class {
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
      RouterOutletStubComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (RouterOutletStubComponent = _classThis);
})();
let WelcomeStubComponent = (() => {
  let _classDecorators = [Component({selector: 'app-welcome', template: ''})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var WelcomeStubComponent = class {
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
      WelcomeStubComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (WelcomeStubComponent = _classThis);
})();
// #enddocregion component-stubs
let comp;
let fixture;
describe('AppComponent & TestModule', () => {
  beforeEach(() => {
    // #docregion testbed-stubs
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      set: {
        imports: [BannerStubComponent, RouterLink, RouterOutletStubComponent, WelcomeStubComponent],
      },
    });
    // #enddocregion testbed-stubs
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});
//////// Testing w/ NO_ERRORS_SCHEMA //////
describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(() => {
    // #docregion no-errors-schema
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      set: {
        imports: [], // resets all imports
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    // #enddocregion no-errors-schema
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});
describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(() => {
    // #docregion mixed-setup
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [provideRouter([]), UserService],
      }),
    ).overrideComponent(AppComponent, {
      remove: {
        imports: [RouterOutlet, WelcomeComponent],
      },
      set: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    // #enddocregion mixed-setup
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  tests();
});
function tests() {
  let routerLinks;
  let linkDes;
  // #docregion test-setup
  beforeEach(() => {
    fixture.detectChanges(); // trigger initial data binding
    // find DebugElements with an attached RouterLinkStubDirective
    linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));
    // get attached link directive instances
    // using each DebugElement's injector
    routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
  });
  // #enddocregion test-setup
  it('can instantiate the component', () => {
    expect(comp).not.toBeNull();
  });
  // #docregion tests
  it('can get RouterLinks from template', () => {
    expect(routerLinks.length).withContext('should have 3 routerLinks').toBe(3);
    expect(routerLinks[0].href).toBe('/dashboard');
    expect(routerLinks[1].href).toBe('/heroes');
    expect(routerLinks[2].href).toBe('/about');
  });
  it('can click Heroes link in template', fakeAsync(() => {
    const heroesLinkDe = linkDes[1]; // heroes link DebugElement
    TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
    heroesLinkDe.triggerEventHandler('click', {button: 0});
    tick();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/heroes');
  }));
  // #enddocregion tests
}
//# sourceMappingURL=app.component.spec.js.map
