import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion imports
import {Component, HostBinding, inject} from '@angular/core';
// #enddocregion imports
import {ChildrenOutletContexts, RouterLink, RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations';
// #docregion decorator, toggle-app-animations, define
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      templateUrl: 'app.component.html',
      styleUrls: ['app.component.css'],
      imports: [RouterLink, RouterOutlet],
      animations: [
        // #enddocregion decorator
        slideInAnimation,
        // #docregion decorator
        // #enddocregion toggle-app-animations, define
        // animation triggers go here
        // #docregion toggle-app-animations, define
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _animationsDisabled_decorators;
  let _animationsDisabled_initializers = [];
  let _animationsDisabled_extraInitializers = [];
  var AppComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _animationsDisabled_decorators = [HostBinding('@.disabled')];
      __esDecorate(
        null,
        null,
        _animationsDisabled_decorators,
        {
          kind: 'field',
          name: 'animationsDisabled',
          static: false,
          private: false,
          access: {
            has: (obj) => 'animationsDisabled' in obj,
            get: (obj) => obj.animationsDisabled,
            set: (obj, value) => {
              obj.animationsDisabled = value;
            },
          },
          metadata: _metadata,
        },
        _animationsDisabled_initializers,
        _animationsDisabled_extraInitializers,
      );
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
    animationsDisabled = __runInitializers(this, _animationsDisabled_initializers, false);
    // #enddocregion toggle-app-animations
    // #docregion get-route-animations-data
    contexts =
      (__runInitializers(this, _animationsDisabled_extraInitializers),
      inject(ChildrenOutletContexts));
    getRouteAnimationData() {
      return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }
    // #enddocregion get-route-animations-data
    toggleAnimations() {
      this.animationsDisabled = !this.animationsDisabled;
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
// #enddocregion toggle-app-animations
//# sourceMappingURL=app.component.js.map
