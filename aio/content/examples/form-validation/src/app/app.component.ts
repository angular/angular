// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<h1>Form validation example</h1>
             <app-hero-form-template></app-hero-form-template>
             <hr>
             <app-hero-form-reactive></app-hero-form-reactive>`
})
export class AppComponent { }
