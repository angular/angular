import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, inject, signal} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {sharedImports} from '../shared/shared';
import {of} from 'rxjs';
import {catchError, startWith} from 'rxjs/operators';
import {TwainService} from './twain.service';
let TwainComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'twain-quote',
      // #docregion template
      template: ` <p class="twain">
      <i>{{ quote | async }}</i>
    </p>
    <button type="button" (click)="getQuote()">Next quote</button>
    @if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    }`,
      // #enddocregion template
      styles: ['.twain { font-style: italic; } .error { color: red; }'],
      imports: [AsyncPipe, sharedImports],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TwainComponent = class {
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
      TwainComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    errorMessage = signal('');
    quote;
    twainService = inject(TwainService);
    constructor() {
      this.getQuote();
    }
    // #docregion get-quote
    getQuote() {
      this.errorMessage.set('');
      this.quote = this.twainService.getQuote().pipe(
        startWith('...'),
        catchError((err) => {
          this.errorMessage.set(err.message || err.toString());
          return of('...'); // reset message to placeholder
        }),
      );
      // #enddocregion get-quote
    }
  };
  return (TwainComponent = _classThis);
})();
export {TwainComponent};
//# sourceMappingURL=twain.component.js.map
