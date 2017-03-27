/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component }              from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
// #enddocregion imports

@Component({
  selector: 'hero-detail-2',
  templateUrl: './hero-detail-2.component.html'
})
// #docregion v2
export class HeroDetailComponent2 {
  heroForm = new FormGroup ({
    name: new FormControl()
  });
}
// #enddocregion v2
