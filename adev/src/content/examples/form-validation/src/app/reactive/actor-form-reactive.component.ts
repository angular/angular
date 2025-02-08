// #docregion
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {forbiddenNameValidator} from '../shared/forbidden-name.directive';
import {unambiguousRoleValidator} from '../shared/identity-revealed.directive';
import {UniqueRoleValidator} from '../shared/role.directive';

@Component({
  selector: 'app-actor-form-reactive',
  templateUrl: './actor-form-reactive.component.html',
  styleUrls: ['./actor-form-reactive.component.css'],
  standalone: false,
})
export class ActorFormReactiveComponent implements OnInit {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};

  actorForm!: FormGroup;

  ngOnInit(): void {
    this.actorForm = new FormGroup(
      {
        name: new FormControl(this.actor.name, [
          Validators.required,
          Validators.minLength(4),
          forbiddenNameValidator(/bob/i),
        ]),
        role: new FormControl(this.actor.role, {
          asyncValidators: [this.roleValidator.validate.bind(this.roleValidator)],
          updateOn: 'blur',
        }),
        skill: new FormControl(this.actor.skill, Validators.required),
      },
      {validators: unambiguousRoleValidator},
    ); // <-- add custom validator at the FormGroup level
  }

  get name() {
    return this.actorForm.get('name')!;
  }

  get skill() {
    return this.actorForm.get('skill')!;
  }

  get role() {
    return this.actorForm.get('role')!;
  }

  constructor(private roleValidator: UniqueRoleValidator) {}
}
