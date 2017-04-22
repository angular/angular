/* tslint:disable: member-ordering forin */
// #docplaster
// #docregion
import { Component, AfterViewChecked, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Hero }      from '../shared/hero';

@Component({
  selector: 'hero-form-template2',
  templateUrl: './hero-form-template2.component.html'
})
export class HeroFormTemplate2Component implements AfterViewChecked {

  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];

  hero = new Hero(18, 'Dr. WhatIsHisWayTooLongName', this.powers[0], 'Dr. What');

  submitted = false;

  onSubmit() {
    this.submitted = true;
  }
// #enddocregion

  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;
// #docregion

  addHero() {
    this.hero = new Hero(42, '', '');
// #enddocregion

    this.active = false;
    setTimeout(() => this.active = true, 0);
// #docregion
  }

  // #docregion view-child
  heroForm: NgForm;
  @ViewChild('heroForm') currentForm: NgForm;

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.heroForm) { return; }
    this.heroForm = this.currentForm;
    if (this.heroForm) {
      this.heroForm.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }
  // #enddocregion view-child

  // #docregion handler
  onValueChanged(data?: any) {
    if (!this.heroForm) { return; }
    const form = this.heroForm.form;

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
  // #enddocregion handler

  // #docregion messages
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
  // #enddocregion messages
}
// #enddocregion
