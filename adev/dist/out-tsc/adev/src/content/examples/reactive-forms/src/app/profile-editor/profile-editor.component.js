import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
// #docregion validator-imports
import {Validators} from '@angular/forms';
import {JsonPipe} from '@angular/common';
let ProfileEditorComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-profile-editor',
      templateUrl: './profile-editor.component.html',
      styleUrls: ['./profile-editor.component.css'],
      imports: [ReactiveFormsModule, JsonPipe],
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
    // #docregion required-validator, aliases
    formBuilder = inject(FormBuilder);
    profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: [''],
      address: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        zip: [''],
      }),
      // #enddocregion required-validator
      aliases: this.formBuilder.array([this.formBuilder.control('')]),
      // #docregion required-validator
    });
    // #enddocregion required-validator, aliases
    // #docregion aliases-getter
    get aliases() {
      return this.profileForm.get('aliases');
    }
    // #enddocregion aliases-getter
    updateProfile() {
      this.profileForm.patchValue({
        firstName: 'Nancy',
        address: {
          street: '123 Drew Street',
        },
      });
    }
    // #docregion add-alias
    addAlias() {
      this.aliases.push(this.formBuilder.control(''));
    }
    // #enddocregion add-alias
    // #docregion on-submit
    onSubmit() {
      // TODO: Use EventEmitter with form value
      console.warn(this.profileForm.value);
    }
  };
  return (ProfileEditorComponent = _classThis);
})();
export {ProfileEditorComponent};
//# sourceMappingURL=profile-editor.component.js.map
