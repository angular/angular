// #docplaster
// #docregion
import { Component, Input, OnChanges }       from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Address, Hero, states } from './data-model';
// #docregion import-service
import { HeroService }           from './hero.service';
// #enddocregion import-service

// #docregion metadata
@Component({
  selector: 'hero-detail',
  templateUrl: './hero-detail.component.html'
})
// #enddocregion metadata
export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;

  heroForm: FormGroup;
  // #docregion log-name-change
  nameChangeLog: string[] = [];
  // #enddocregion log-name-change
  states = states;

  // #docregion ctor
  constructor(
    private fb: FormBuilder,
    private heroService: HeroService) {

    this.createForm();
    this.logNameChange();
  }
  // #enddocregion ctor

  createForm() {
    this.heroForm = this.fb.group({
      name: '',
      secretLairs: this.fb.array([]),
      power: '',
      sidekick: ''
    });
  }

  ngOnChanges() {
    this.heroForm.reset({
      name: this.hero.name
    });
    this.setAddresses(this.hero.addresses);
  }

  get secretLairs(): FormArray {
    return this.heroForm.get('secretLairs') as FormArray;
  };

  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.fb.group(address));
    const addressFormArray = this.fb.array(addressFGs);
    this.heroForm.setControl('secretLairs', addressFormArray);
  }

  addLair() {
    this.secretLairs.push(this.fb.group(new Address()));
  }

  // #docregion on-submit
  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.ngOnChanges();
  }
  // #enddocregion on-submit

  // #docregion prepare-save-hero
  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name as string,
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };
    return saveHero;
  }
  // #enddocregion prepare-save-hero

  // #docregion revert
  revert() { this.ngOnChanges(); }
  // #enddocregion revert

  // #docregion log-name-change
  logNameChange() {
    const nameControl = this.heroForm.get('name');
    nameControl.valueChanges.forEach(
      (value: string) => this.nameChangeLog.push(value)
    );
  }
  // #enddocregion log-name-change
}
