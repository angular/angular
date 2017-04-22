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
// #enddocregion class
// #enddocregion
  // Reset the form with a new hero AND restore 'pristine' class state
  // by toggling 'active' flag which causes the form
  // to be removed/re-added in a tick via NgIf
  // TODO: Workaround until NgForm has a reset method (#6822)
  active = true;
// #docregion
// #docregion class

  addHero() {
    this.hero = new Hero(42, '', '');
// #enddocregion class
// #enddocregion

    this.active = false;
    setTimeout(() => this.active = true, 0);
// #docregion
// #docregion class
  }
}
// #enddocregion class
// #enddocregion
