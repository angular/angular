/* tslint:disable: member-ordering */
// #docplaster
// #docregion
import { Component } from '@angular/core';

// #docregion component
@Component({
  selector: 'app-hero-form-template',
  templateUrl: './hero-form-template.component.html',
  styleUrls: ['./hero-form-template.component.css'],
})
export class HeroFormTemplateComponent {

  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];

  hero = {name: 'Dr.', alterEgo: 'Dr. What', power: this.powers[0]};

}
// #enddocregion
