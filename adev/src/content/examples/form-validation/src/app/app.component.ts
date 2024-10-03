// #docregion
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<h1>Form validation example</h1>
             <app-actor-form-template/>
             <hr>
             <app-actor-form-reactive/>`,
  standalone: false,
})
export class AppComponent {}
