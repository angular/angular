import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {UnambiguousRoleValidatorDirective} from '../shared/unambiguous-role.directive';
import {ForbiddenValidatorDirective} from '../shared/forbidden-name.directive';
import {UniqueRoleValidatorDirective} from '../shared/role.directive';
let ActorFormTemplateComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-actor-form-template',
      templateUrl: './actor-form-template.component.html',
      styleUrls: ['./actor-form-template.component.css'],
      imports: [
        UnambiguousRoleValidatorDirective,
        FormsModule,
        ForbiddenValidatorDirective,
        UniqueRoleValidatorDirective,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ActorFormTemplateComponent = class {
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
      ActorFormTemplateComponent = _classThis = _classDescriptor.value;
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
  };
  return (ActorFormTemplateComponent = _classThis);
})();
export {ActorFormTemplateComponent};
//# sourceMappingURL=actor-form-template.component.js.map
