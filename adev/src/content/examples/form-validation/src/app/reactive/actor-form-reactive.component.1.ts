// #docplaster
// #docregion
import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {forbiddenNameValidator} from '../shared/forbidden-name.directive';

@Component({
  selector: 'app-actor-form-reactive',
  templateUrl: './actor-form-reactive.component.html',
  styleUrls: ['./actor-form-reactive.component.css'],
  imports: [ReactiveFormsModule],
})
export class HeroFormReactiveComponent {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};

  // #docregion form-group
  // #docregion custom-validator
  actorForm: FormGroup = new FormGroup({
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
  // #enddocregion form-group
}
// #enddocregion
