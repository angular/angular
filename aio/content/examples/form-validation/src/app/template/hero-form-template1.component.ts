/* tslint:disable: member-ordering */
// #docplaster
// #docregion
import { Component } from '@angular/core';


import { Hero }      from '../shared/hero';

@Component({
  selector: 'hero-form-template1',
  templateUrl: './hero-form-template1.component.html'
})
// #docregion class
export class HeroFormTemplate1Component {

  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];

  hero = new Hero(18, 'Dr. WhatIsHisWayTooLongName', this.powers[0], 'Dr. What');

  submitted = false;

  onSubmit() {
    this.submitted = true;
  }

  // #docregion add-hero
  addHero() {
    this.hero = new Hero(42, '', '');
  }
  // #enddocregion add-hero

}
// #enddocregion class
// #enddocregion
