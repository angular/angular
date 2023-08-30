// #docplaster
// #docregion, v1, v2, hero-property, uppercasepipe-import
import {Component} from '@angular/core';
// #enddocregion v1, hero-property
import {UpperCasePipe} from '@angular/common';
// #enddocregion uppercasepipe-import
// #docregion formsmodule-import
import {FormsModule} from '@angular/forms'; // <-- NgModel lives here
// #enddocregion formsmodule-import
// #docregion hero-property, uppercasepipe-import
import {Hero} from '../hero';
// #docregion v1, formsmodule-import-array

@Component({
  standalone: true,
  // #enddocregion formsmodule-import-array
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  // #enddocregion, v1, hero-property
  // #docregion formsmodule-import-array
  imports: [
    // #enddocregion uppercasepipe-import
    FormsModule,
    // #enddocregion formsmodule-import-array
    // #docregion uppercasepipe-import
    UpperCasePipe,
    // #docregion formsmodule-import-array
  ],
  // #docregion, v1, hero-property
})
// #enddocregion uppercasepipe-import, formsmodule-import-array
export class HeroesComponent {
  // #enddocregion v1, v2
  /*
  // #docregion add-hero
  hero = 'Windstorm';
  // #enddocregion add-hero
  */
  // #docregion v2
  hero: Hero = {
    id: 1,
    name: 'Windstorm',
  };
  // #docregion v1
}
// #enddocregion v1, v2, hero-property
