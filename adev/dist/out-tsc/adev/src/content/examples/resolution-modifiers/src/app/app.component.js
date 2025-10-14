import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HostComponent} from './host/host.component';
import {OptionalComponent} from './optional/optional.component';
import {SelfComponent} from './self/self.component';
import {HostParentComponent} from './host-parent/host-parent.component';
import {HostChildComponent} from './host-child/host-child.component';
import {SelfNoDataComponent} from './self-no-data/self-no-data.component';
import {SkipselfComponent} from './skipself/skipself.component';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css'],
      imports: [
        HostComponent,
        HostChildComponent,
        HostParentComponent,
        OptionalComponent,
        SelfComponent,
        SelfNoDataComponent,
        SkipselfComponent,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
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
    flower;
    leaf;
    name = 'Angular';
    constructor(flower, leaf) {
      this.flower = flower;
      this.leaf = leaf;
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
