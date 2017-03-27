/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component }                          from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { states } from './data-model';
// #enddocregion imports

@Component({
  selector: 'hero-detail-4',
  templateUrl: './hero-detail-4.component.html'
})
// #docregion v4
export class HeroDetailComponent4 {
  heroForm: FormGroup;
  states = states;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.heroForm = this.fb.group({
      name: ['', Validators.required ],
      street: '',
      city: '',
      state: '',
      zip: '',
      power: '',
      sidekick: ''
    });
  }
}
// #enddocregion v4
