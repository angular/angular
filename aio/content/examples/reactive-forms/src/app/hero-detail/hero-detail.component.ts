// #docplaster
// #docregion
import { Component, Input, OnChanges }       from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Address, Hero, states } from '../data-model';
// #docregion import-service
import { HeroService }           from '../hero.service';
// #enddocregion import-service

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})

// #docregion onchanges-implementation
export class HeroDetailComponent implements OnChanges {
// #enddocregion onchanges-implementation
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
    this.rebuildForm();
  }

  rebuildForm() {
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
    this.heroService.updateHero(this.hero).subscribe(/* 에러 처리 */);
    this.rebuildForm();
  }
  // #enddocregion on-submit

  // #docregion prepare-save-hero
  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // 폼 모델 deep copy
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // 히어로의 이전 데이터에 새로운 데이터를 반영해서 반환합니다.
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name as string,
      // addresses: formModel.secretLairs // <-- 이러면 안됩니다!
      addresses: secretLairsDeepCopy
    };
    return saveHero;
  }
  // #enddocregion prepare-save-hero

  // #docregion revert
  revert() { this.rebuildForm(); }
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
