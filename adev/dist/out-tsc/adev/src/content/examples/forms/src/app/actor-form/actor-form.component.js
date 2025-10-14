import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion , v1, final
import {Component} from '@angular/core';
import {Actor} from '../actor';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
// #docregion imports
let ActorFormComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-actor-form',
      templateUrl: './actor-form.component.html',
      imports: [FormsModule, JsonPipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ActorFormComponent = class {
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
      ActorFormComponent = _classThis = _classDescriptor.value;
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
    skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];
    model = new Actor(18, 'Tom Cruise', this.skills[3], 'CW Productions');
    // #docregion submitted
    submitted = false;
    onSubmit() {
      this.submitted = true;
    }
    // #enddocregion submitted
    // #enddocregion final
    // #enddocregion v1
    // #docregion final, new-actor
    newActor() {
      this.model = new Actor(42, '', '');
    }
    // #enddocregion final, new-actor
    heroine() {
      // #docregion Marilyn
      const myActress = new Actor(42, 'Marilyn Monroe', 'Singing');
      console.log('My actress is called ' + myActress.name); // "My actress is called Marilyn"
      // #enddocregion Marilyn
      return myActress;
    }
    //////// NOT SHOWN IN DOCS ////////
    // Reveal in html:
    //   Name via form.controls = {{showFormControls(actorForm)}}
    showFormControls(form) {
      return form && form.controls.name && form.controls.name.value; // Tom Cruise
    }
  };
  return (ActorFormComponent = _classThis);
})();
export {ActorFormComponent};
//# sourceMappingURL=actor-form.component.js.map
