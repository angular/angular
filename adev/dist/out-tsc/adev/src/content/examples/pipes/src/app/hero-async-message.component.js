import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import {map, startWith, take} from 'rxjs/operators';
let HeroAsyncMessageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-async-message',
      template: `
    <h2>Async Messages and AsyncPipe</h2>
    <p>{{ message$ | async }}</p>
    <button type="button" (click)="resend()">Resend Messages</button>`,
      imports: [AsyncPipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroAsyncMessageComponent = class {
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
      HeroAsyncMessageComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    message$;
    messages = ['You are my hero!', 'You are the best hero!', 'Will you be my hero?'];
    constructor() {
      this.message$ = this.getResendObservable();
    }
    resend() {
      this.message$ = this.getResendObservable();
    }
    getResendObservable() {
      return interval(1000).pipe(
        map((i) => `Message #${i + 1}: ${this.messages[i]}`),
        take(this.messages.length),
        startWith('Waiting for messages...'),
      );
    }
  };
  return (HeroAsyncMessageComponent = _classThis);
})();
export {HeroAsyncMessageComponent};
//# sourceMappingURL=hero-async-message.component.js.map
