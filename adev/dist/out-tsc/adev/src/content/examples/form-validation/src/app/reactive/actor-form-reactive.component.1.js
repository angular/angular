import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {forbiddenNameValidator} from '../shared/forbidden-name.directive';
let HeroFormReactiveComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-actor-form-reactive',
      templateUrl: './actor-form-reactive.component.html',
      styleUrls: ['./actor-form-reactive.component.css'],
      imports: [ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroFormReactiveComponent = class {
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
      HeroFormReactiveComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];
    actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};
    // #docregion form-group
    // #docregion custom-validator
    actorForm = new FormGroup({
      name: new FormControl(this.actor.name, [
        Validators.required,
        Validators.minLength(4),
        forbiddenNameValidator(/bob/i), // <-- Here's how you pass in the custom validator.
      ]),
      role: new FormControl(this.actor.role),
      skill: new FormControl(this.actor.skill, Validators.required),
    });
    // #enddocregion custom-validator
    get name() {
      return this.actorForm.get('name');
    }
    get skill() {
      return this.actorForm.get('skill');
    }
  };
  return (HeroFormReactiveComponent = _classThis);
})();
export {HeroFormReactiveComponent};
// #enddocregion
//# sourceMappingURL=actor-form-reactive.component.1.js.map
