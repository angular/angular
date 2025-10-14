// #docplaster
import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject} from '@angular/core';
// #docregion form-builder-imports
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
// #enddocregion form-array-imports
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
    // #docregion inject-form-builder
    formBuilder = inject(FormBuilder);
    // #enddocregion inject-form-builder
    // #docregion formgroup-compare, form-builder
    profileForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      address: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        zip: [''],
      }),
      // #enddocregion form-builder, formgroup-compare
      aliases: this.formBuilder.array([this.formBuilder.control('')]),
      // #docregion form-builder, formgroup-compare
    });
    // #enddocregion form-builder, formgroup-compare
    get aliases() {
      return this.profileForm.get('aliases');
    }
    updateProfile() {
      this.profileForm.patchValue({
        firstName: 'Nancy',
        address: {
          street: '123 Drew Street',
        },
      });
    }
    addAlias() {
      this.aliases.push(this.formBuilder.control(''));
    }
  };
  return (ProfileEditorComponent = _classThis);
})();
export {ProfileEditorComponent};
//# sourceMappingURL=profile-editor.component.2.js.map
