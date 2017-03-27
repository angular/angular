/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component, Input, OnChanges }                   from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Address, Hero, states } from './data-model';
// #enddocregion imports

@Component({
  selector: 'hero-detail-8',
  templateUrl: './hero-detail-8.component.html'
})
// #docregion v8
export class HeroDetailComponent8 implements OnChanges {
  @Input() hero: Hero;

  heroForm: FormGroup;
  states = states;

  // #docregion ctor
  constructor(private fb: FormBuilder) {
    this.createForm();
    this.logNameChange();
  }
  // #enddocregion ctor

  createForm() {
    // #docregion secretLairs-form-array
    this.heroForm = this.fb.group({
      name: ['', Validators.required ],
      secretLairs: this.fb.array([]), // <-- secretLairs as an empty FormArray
      power: '',
      sidekick: ''
    });
    // #enddocregion secretLairs-form-array
  }

  logNameChange() {/* Coming soon */}

  // #docregion onchanges
  ngOnChanges() {
    this.heroForm.reset({
      name: this.hero.name
    });
    this.setAddresses(this.hero.addresses);
  }
  // #enddocregion onchanges

  // #docregion get-secret-lairs
  get secretLairs(): FormArray {
    return this.heroForm.get('secretLairs') as FormArray;
  };
  // #enddocregion get-secret-lairs

  // #docregion set-addresses
  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.fb.group(address));
    const addressFormArray = this.fb.array(addressFGs);
    this.heroForm.setControl('secretLairs', addressFormArray);
  }
  // #enddocregion set-addresses

  // #docregion add-lair
  addLair() {
    this.secretLairs.push(this.fb.group(new Address()));
  }
  // #enddocregion add-lair
}
