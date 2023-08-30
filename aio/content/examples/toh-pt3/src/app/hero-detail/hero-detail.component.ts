// #docregion
// #docregion import-input
import {Component, Input} from '@angular/core';
// #enddocregion import-input
import {NgIf, UpperCasePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
// #docregion import-hero
import {Hero} from '../hero';
// #enddocregion import-hero

@Component({
  standalone: true,
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css'],
  imports: [FormsModule, NgIf, UpperCasePipe],
})
export class HeroDetailComponent {
  // #docregion input-hero
  @Input() hero?: Hero;
  // #enddocregion input-hero
}
