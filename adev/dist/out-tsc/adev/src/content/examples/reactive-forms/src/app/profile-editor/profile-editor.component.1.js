import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion formgroup, nested-formgroup
import {Component} from '@angular/core';
// #docregion imports
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
let ProfileEditorComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-profile-editor',
      templateUrl: './profile-editor.component.html',
      styleUrls: ['./profile-editor.component.css'],
      imports: [ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ProfileEditorComponent = class {
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
      ProfileEditorComponent = _classThis = _classDescriptor.value;
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
    // #docregion formgroup-compare
    profileForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      // #enddocregion formgroup
      address: new FormGroup({
        street: new FormControl(''),
        city: new FormControl(''),
        state: new FormControl(''),
        zip: new FormControl(''),
      }),
      // #docregion formgroup
    });
    // #enddocregion formgroup, nested-formgroup, formgroup-compare
    // #docregion patch-value
    updateProfile() {
      this.profileForm.patchValue({
        firstName: 'Nancy',
        address: {
          street: '123 Drew Street',
        },
      });
    }
  };
  return (ProfileEditorComponent = _classThis);
})();
export {ProfileEditorComponent};
// #enddocregion formgroup
//# sourceMappingURL=profile-editor.component.1.js.map
