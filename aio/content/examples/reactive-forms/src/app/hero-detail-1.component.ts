/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component }              from '@angular/core';
import { FormControl }            from '@angular/forms';
// #enddocregion

@Component({
  selector: 'app-hero-detail-1',
  templateUrl: './hero-detail-1.component.html'
})
// #docregion v1
export class HeroDetailComponent1 {
  name = new FormControl();
}
