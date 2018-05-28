/* tslint:disable:component-class-suffix */
// #docregion imports
import { Component }              from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// #enddocregion imports

@Component({
  selector: 'app-hero-detail-3',
  templateUrl: './hero-detail-3.component.html'
})
// #docregion v3a
export class HeroDetailComponent3 {
  heroForm: FormGroup; // <--- heroForm은 FormGroup 타입으로 선언합니다.

  constructor(private fb: FormBuilder) { // <--- FormBuilder를 의존성으로 주입합니다.
    this.createForm();
  }

  createForm() {
    this.heroForm = this.fb.group({
      name: '', // <--- 이 폼 컨트롤의 이름은 "name" 입니다.
    });
  }
}
// #enddocregion v3a
