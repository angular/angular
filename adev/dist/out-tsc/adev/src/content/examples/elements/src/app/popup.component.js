import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, computed, input, output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
let PopupComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'my-popup',
      template: `
    <span>Popup: {{ message }}</span>
    <button type="button" (click)="closed.next()">&#x2716;</button>
  `,
      animations: [
        trigger('state', [
          state('opened', style({transform: 'translateY(0%)'})),
          state('void, closed', style({transform: 'translateY(100%)', opacity: 0})),
          transition('* => *', animate('100ms ease-in')),
        ]),
      ],
      styles: [
        `
      :host {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: #009cff;
        height: 48px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid black;
        font-size: 24px;
      }

      button {
        border-radius: 50%;
      }
    `,
      ],
      host: {
        '[@state]': 'state()',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PopupComponent = class {
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
      PopupComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    message = input('');
    closed = output();
    state = computed(() => (this.message() ? 'opened' : 'closed'));
  };
  return (PopupComponent = _classThis);
})();
export {PopupComponent};
//# sourceMappingURL=popup.component.js.map
