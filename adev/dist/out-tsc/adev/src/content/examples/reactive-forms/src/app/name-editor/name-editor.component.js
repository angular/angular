import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion create-control
import {Component} from '@angular/core';
// #docregion imports
import {FormControl, ReactiveFormsModule} from '@angular/forms';
let NameEditorComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-name-editor',
      templateUrl: './name-editor.component.html',
      styleUrls: ['./name-editor.component.css'],
      imports: [ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NameEditorComponent = class {
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
      NameEditorComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // #enddocregion imports
    name = new FormControl('');
    // #enddocregion create-control
    // #docregion update-value
    updateName() {
      this.name.setValue('Nancy');
    }
  };
  return (NameEditorComponent = _classThis);
})();
export {NameEditorComponent};
// #enddocregion create-control
//# sourceMappingURL=name-editor.component.js.map
