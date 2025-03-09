// #docplaster
// #docregion , v1, final
import {Component} from '@angular/core';

import {Actor} from '../actor';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';

// #docregion imports
@Component({
  selector: 'app-actor-form',
  templateUrl: './actor-form.component.html',
  imports: [FormsModule, JsonPipe],
})
export class ActorFormComponent {
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

  heroine(): Actor {
    // #docregion Marilyn
    const myActress = new Actor(42, 'Marilyn Monroe', 'Singing');
    console.log('My actress is called ' + myActress.name); // "My actress is called Marilyn"
    // #enddocregion Marilyn
    return myActress;
  }

  //////// NOT SHOWN IN DOCS ////////

  // Reveal in html:
  //   Name via form.controls = {{showFormControls(actorForm)}}
  showFormControls(form: any) {
    return form && form.controls.name && form.controls.name.value; // Tom Cruise
  }

  /////////////////////////////

  // #docregion v1, final
}
