import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
  group,
  query,
  animateChild,
  keyframes,
} from '@angular/animations';
import {HEROES} from './mock-heroes';
let QueryingComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-querying',
      template: `
    <nav>
      <button type="button" class="toggle" (click)="show = !show" [disabled]="toggleDisabled">Toggle View</button>
    </nav>
    @if (show) {
      <section @query (@query.start)="toggleDisabled = true" (@query.done)="toggleDisabled = false">
        <p>I am a simple child element</p>
        @if (show) {
          <p>I am a child element that enters and leaves with its parent</p>
        }
        <p @animateMe>I am a child element with an animation trigger</p>
        <div class="hero">
          <span class="badge">{{ hero.id }}</span>
          <span class="name">{{ hero.name }} <small>(heroes are always animated!)</small></span>
        </div>
      </section>
    }
  `,
      styleUrls: ['./querying.component.css'],
      animations: [
        trigger('query', [
          transition(':enter', [
            style({height: 0}),
            group([
              animate(500, style({height: '*'})),
              query(':enter', [
                style({opacity: 0, transform: 'scale(0)'}),
                animate(2000, style({opacity: 1, transform: 'scale(1)'})),
              ]),
              query('.hero', [
                style({transform: 'translateX(-100%)'}),
                animate('.7s 500ms ease-in', style({transform: 'translateX(0)'})),
              ]),
            ]),
            query('@animateMe', animateChild()),
          ]),
          transition(':leave', [
            style({height: '*'}),
            query('@animateMe', animateChild()),
            group([
              animate('500ms 500ms', style({height: '0', padding: '0'})),
              query(':leave', [
                style({opacity: 1, transform: 'scale(1)'}),
                animate('1s', style({opacity: 0, transform: 'scale(0)'})),
              ]),
              query('.hero', [
                style({transform: 'translateX(0)'}),
                animate('.7s ease-out', style({transform: 'translateX(-100%)'})),
              ]),
            ]),
          ]),
        ]),
        trigger('animateMe', [
          transition(
            '* <=> *',
            animate(
              '500ms cubic-bezier(.68,-0.73,.26,1.65)',
              keyframes([
                style({backgroundColor: 'transparent', color: '*', offset: 0}),
                style({backgroundColor: 'blue', color: 'white', offset: 0.2}),
                style({backgroundColor: 'transparent', color: '*', offset: 1}),
              ]),
            ),
          ),
        ]),
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var QueryingComponent = class {
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
      QueryingComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    toggleDisabled = false;
    show = true;
    hero = HEROES[0];
  };
  return (QueryingComponent = _classThis);
})();
export {QueryingComponent};
//# sourceMappingURL=querying.component.js.map
