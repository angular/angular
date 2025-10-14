import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, input} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';
// #docregion component, events1
let OpenCloseComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close',
      // #docregion trigger-wildcard1, trigger-transition
      animations: [
        trigger('openClose', [
          // #docregion state1
          // ...
          // #enddocregion events1
          state(
            'open',
            style({
              height: '200px',
              opacity: 1,
              backgroundColor: 'yellow',
            }),
          ),
          // #enddocregion state1
          // #docregion state2
          state(
            'closed',
            style({
              height: '100px',
              opacity: 0.8,
              backgroundColor: 'blue',
            }),
          ),
          // #enddocregion state2, trigger-wildcard1
          // #docregion transition1
          transition('open => closed', [animate('1s')]),
          // #enddocregion transition1
          // #docregion transition2
          transition('closed => open', [animate('0.5s')]),
          // #enddocregion transition2, component
          // #docregion trigger-wildcard1
          transition('* => closed', [animate('1s')]),
          transition('* => open', [animate('0.5s')]),
          // #enddocregion trigger-wildcard1
          // #docregion trigger-wildcard2
          transition('open <=> closed', [animate('0.5s')]),
          // #enddocregion trigger-wildcard2
          // #docregion transition4
          transition('* => open', [animate('1s', style({opacity: '*'}))]),
          // #enddocregion transition4
          transition('* => *', [animate('1s')]),
          // #enddocregion trigger-transition
          // #docregion component, trigger-wildcard1, events1
        ]),
      ],
      // #enddocregion trigger-wildcard1
      templateUrl: 'open-close.component.html',
      styleUrls: ['open-close.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseComponent = class {
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
      OpenCloseComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // #enddocregion events1, events, component
    logging = input(false);
    // #docregion component
    isOpen = true;
    toggle() {
      this.isOpen = !this.isOpen;
    }
    // #enddocregion component
    // #docregion events1, events
    onAnimationEvent(event) {
      // #enddocregion events1, events
      if (!this.logging) {
        return;
      }
      // #docregion events
      // openClose is trigger name in this example
      console.warn(`Animation Trigger: ${event.triggerName}`);
      // phaseName is "start" or "done"
      console.warn(`Phase: ${event.phaseName}`);
      // in our example, totalTime is 1000 (number of milliseconds in a second)
      console.warn(`Total time: ${event.totalTime}`);
      // in our example, fromState is either "open" or "closed"
      console.warn(`From: ${event.fromState}`);
      // in our example, toState either "open" or "closed"
      console.warn(`To: ${event.toState}`);
      // the HTML element itself, the button in this case
      console.warn(`Element: ${event.element}`);
      // #docregion events1
    }
  };
  return (OpenCloseComponent = _classThis);
})();
export {OpenCloseComponent};
// #enddocregion component
//# sourceMappingURL=open-close.component.js.map
