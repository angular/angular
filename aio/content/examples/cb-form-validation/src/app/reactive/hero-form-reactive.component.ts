/* tslint:disable: member-ordering forin */
// #docplaster
// #docregion
import { Component, OnInit }                  from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Hero }                   from '../shared/hero';
import { forbiddenNameValidator } from '../shared/forbidden-name.directive';

@Component({
  selector: 'hero-form-reactive3',
  templateUrl: './hero-form-reactive.component.html'
})
export class HeroFormReactiveComponent implements OnInit {

  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];

  hero = new Hero(18, 'Dr. WhatIsHisName', this.powers[0], 'Dr. What');

  submitted = false;

  // #docregion on-submit
  onSubmit() {
    this.submitted = true;
    this.hero = this.heroForm.value;
  }
  // #enddocregion on-submit
// #enddocregion

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;
// #docregion class
  // #docregion add-hero
  addHero() {
    this.hero = new Hero(42, '', '');
    this.buildForm();
  // #enddocregion add-hero
// #enddocregion class

    this.active = false;
    setTimeout(() => this.active = true, 0);
// #docregion
  // #docregion add-hero
  }
  // #enddocregion add-hero

  // #docregion form-builder
  heroForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.heroForm = this.fb.group({
      // #docregion name-validators
      'name': [this.hero.name, [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(24),
          forbiddenNameValidator(/bob/i)
        ]
      ],
      // #enddocregion name-validators
      'alterEgo': [this.hero.alterEgo],
      'power':    [this.hero.power, Validators.required]
    });

    this.heroForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  // #enddocregion form-builder

  onValueChanged(data?: any) {
    if (!this.heroForm) { return; }
    const form = this.heroForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'name': '',
    'power': ''
  };

  validationMessages = {
    'name': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 4 characters long.',
      'maxlength':     'Name cannot be more than 24 characters long.',
      'forbiddenName': 'Someone named "Bob" cannot be a hero.'
    },
    'power': {
      'required': 'Power is required.'
    }
  };
}
// #enddocregion
