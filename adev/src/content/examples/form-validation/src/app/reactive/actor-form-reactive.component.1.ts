// #docplaster
// #docregion
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {forbiddenNameValidator} from '../shared/forbidden-name.directive';

@Component({
  selector: 'app-actor-form-reactive',
  templateUrl: './actor-form-reactive.component.html',
  styleUrls: ['./actor-form-reactive.component.css'],
  standalone: false,
})
export class HeroFormReactiveComponent implements OnInit {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};

  actorForm!: FormGroup;

  // #docregion form-group
  ngOnInit(): void {
    // #docregion custom-validator
    this.actorForm = new FormGroup({
      name: new FormControl(this.actor.name, [
        Validators.required,
        Validators.minLength(4),
        forbiddenNameValidator(/bob/i), // <-- Here's how you pass in the custom validator.
      ]),
      role: new FormControl(this.actor.role),
      skill: new FormControl(this.actor.skill, Validators.required),
    });
    // #enddocregion custom-validator
  }

  get name() {
    return this.actorForm.get('name');
  }

  get skill() {
    return this.actorForm.get('skill');
  }
  // #enddocregion form-group
}
// #enddocregion
