import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, signal, viewChild} from '@angular/core';
let IncrementDecrementComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-increment-decrement',
      templateUrl: 'increment-decrement.component.html',
      styleUrls: ['increment-decrement.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IncrementDecrementComponent = class {
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
      IncrementDecrementComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    num = signal(0);
    el = viewChild('el');
    ngOnInit() {
      this.el()?.nativeElement.addEventListener('animationend', (ev) => {
        if (ev.animationName.endsWith('decrement') || ev.animationName.endsWith('increment')) {
          this.animationFinished();
        }
      });
    }
    modify(n) {
      const targetClass = n > 0 ? 'increment' : 'decrement';
      this.num.update((v) => (v += n));
      this.el()?.nativeElement.classList.add(targetClass);
    }
    animationFinished() {
      this.el()?.nativeElement.classList.remove('increment', 'decrement');
    }
    ngOnDestroy() {
      this.el()?.nativeElement.removeEventListener('animationend', this.animationFinished);
    }
  };
  return (IncrementDecrementComponent = _classThis);
})();
export {IncrementDecrementComponent};
//# sourceMappingURL=increment-decrement.component.js.map
