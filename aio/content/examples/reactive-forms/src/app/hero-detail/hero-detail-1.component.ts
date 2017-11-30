/* tslint:disable:component-class-suffix */

import { Component } from '@angular/core';
// #docregion import
import { FormControl } from '@angular/forms';
// #enddocregion import

@Component({
  selector: 'app-hero-detail-1',
  templateUrl: './hero-detail-1.component.html'
})
// #docregion v1
export class HeroDetailComponent1 {
  name = new FormControl();
}
