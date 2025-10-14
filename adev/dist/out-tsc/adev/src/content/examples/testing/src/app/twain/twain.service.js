import {__esDecorate, __runInitializers} from 'tslib';
// Mark Twain Quote service gets quotes from server
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {concat, map, retryWhen, switchMap, take} from 'rxjs/operators';
let TwainService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TwainService = class {
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
      TwainService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    http = inject(HttpClient);
    nextId = 1;
    getQuote() {
      return Observable.create((observer) => observer.next(this.nextId++)).pipe(
        // tap((id: number) => console.log(id)),
        // tap((id: number) => { throw new Error('Simulated server error'); }),
        switchMap((id) => this.http.get(`api/quotes/${id}`)),
        // tap((q : Quote) => console.log(q)),
        map((q) => q.quote),
        // `errors` is observable of http.get errors
        retryWhen((errors) =>
          errors.pipe(
            switchMap((error) => {
              if (error.status === 404) {
                // Queried for quote that doesn't exist.
                this.nextId = 1; // retry with quote id:1
                return of(null); // signal OK to retry
              }
              // Some other HTTP error.
              console.error(error);
              return throwError('Cannot get Twain quotes from the server');
            }),
            take(2),
            // If a second retry value, then didn't find id:1 and triggers the following error
            concat(throwError('There are no Twain quotes')),
          ),
        ),
      );
    }
  };
  return (TwainService = _classThis);
})();
export {TwainService};
//# sourceMappingURL=twain.service.js.map
