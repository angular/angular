/* tslint:disable:component-class-suffix */
// #docregion import-input
import { Component, Input, OnChanges }             from '@angular/core';
// #enddocregion import-input
import { FormBuilder, FormGroup, Validators }      from '@angular/forms';

// #docregion import-hero
import { Hero, states } from '../data-model';
// #enddocregion import-hero

////////// 6 ////////////////////

@Component({
  selector: 'app-hero-detail-6',
  templateUrl: './hero-detail-5.component.html'
})
// #docregion v6
export class HeroDetailComponent6 implements OnChanges {
  // #docregion hero
  @Input() hero: Hero;
  // #enddocregion hero

  heroForm: FormGroup;
  states = states;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    // #docregion hero-form-model
    this.heroForm = this.fb.group({
      name: ['', Validators.required ],
      address: this.fb.group({
        street: '',
        city: '',
        state: '',
        zip: ''
      }),
      power: '',
      sidekick: ''
    });
    // #enddocregion hero-form-model
  }

  // #docregion patch-value-on-changes
  ngOnChanges() { // <-- call rebuildForm in ngOnChanges
    this.rebuildForm();
  }
  // #enddocregion patch-value-on-changes

  // #docregion patch-value-rebuildform
  rebuildForm() { // <-- wrap patchValue in rebuildForm
    this.heroForm.reset();
    // #docregion patch-value
    this.heroForm.patchValue({
      name: this.hero.name
    });
    // #enddocregion patch-value
  }
  // #enddocregion patch-value-rebuildform
}



// #enddocregion v6
