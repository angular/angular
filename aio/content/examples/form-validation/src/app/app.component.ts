// #docregion
import { Component } from '@angular/core';
import { HeroFormReactiveComponent } from './reactive/hero-form-reactive.component';
import { HeroFormTemplateComponent } from './template/hero-form-template.component';

@Component({
  selector: 'app-root',
  template: `
    <h1>Form validation example</h1>
    <app-hero-form-template></app-hero-form-template>
    <hr />
    <app-hero-form-reactive></app-hero-form-reactive>
  `,
  standalone: true,
  imports: [HeroFormTemplateComponent, HeroFormReactiveComponent],
})
export class AppComponent {}
