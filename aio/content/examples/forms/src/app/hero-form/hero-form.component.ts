// #docplaster
// #docregion , v1, final
import { Component } from '@angular/core';

import { Hero } from '../hero';

@Component({
  selector: 'app-hero-form',
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.css']
})
export class HeroFormComponent {

  powers = ['Really Smart', 'Super Flexible',
            'Super Hot', 'Weather Changer'];

  model = new Hero(18, 'Dr. IQ', this.powers[0], 'Chuck Overstreet');

  // #docregion submitted
  submitted = false;

  onSubmit() { this.submitted = true; }
  // #enddocregion submitted

  // #enddocregion final
  // #enddocregion v1

  // #docregion final, new-hero
  newHero() {
    this.model = new Hero(42, '', '');
  }
  // #enddocregion final, new-hero

  skyDog(): Hero {
    // #docregion SkyDog
    const myHero =  new Hero(42, 'SkyDog',
                           'Fetch any object at any distance',
                           'Leslie Rollover');
    console.log('My hero is called ' + myHero.name); // "My hero is called SkyDog"
    // #enddocregion SkyDog
    return myHero;
  }

  //////// NOT SHOWN IN DOCS ////////

  // Reveal in html:
  //   Name via form.controls = {{showFormControls(heroForm)}}
  showFormControls(form: any) {
    return form && form.controls.name &&
    form.controls.name.value; // Dr. IQ
  }

  /////////////////////////////

  // #docregion v1, final
}
