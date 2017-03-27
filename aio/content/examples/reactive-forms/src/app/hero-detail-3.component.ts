/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component }                          from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// #enddocregion imports

@Component({
  selector: 'hero-detail-3',
  templateUrl: './hero-detail-3.component.html'
})
// #docregion v3
export class HeroDetailComponent3 {
  heroForm: FormGroup; // <--- heroForm is of type FormGroup

  constructor(private fb: FormBuilder) { // <--- inject FormBuilder
    this.createForm();
  }

  createForm() {
    // #docregion required
    this.heroForm = this.fb.group({
      name: ['', Validators.required ],
    });
    // #enddocregion required
  }
}
// #enddocregion v3
