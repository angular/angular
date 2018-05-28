/* tslint:disable:component-class-suffix */
import { Component }                          from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { states } from '../data-model';

@Component({
  selector: 'app-hero-detail-5',
  templateUrl: './hero-detail-5.component.html'
})
// #docregion v5
export class HeroDetailComponent5 {
  heroForm: FormGroup;
  states = states;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.heroForm = this.fb.group({ // <-- 부모 FormGroup
      name: ['', Validators.required ],
      address: this.fb.group({ // <-- 자식 FormGroup
        street: '',
        city: '',
        state: '',
        zip: ''
      }),
      power: '',
      sidekick: ''
    });
  }
}
// #enddocregion v5

