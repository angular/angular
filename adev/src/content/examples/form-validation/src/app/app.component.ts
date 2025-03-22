// #docregion
import {Component} from '@angular/core';
import {ActorFormReactiveComponent} from './reactive/actor-form-reactive.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FormsModule} from '@angular/forms';
import {ActorFormTemplateComponent} from './template/actor-form-template.component';

@Component({
  selector: 'app-root',
  template: `<h1>Form validation example</h1>
             <app-actor-form-template/>
             <hr>
             <app-actor-form-reactive/>`,
  imports: [
    ActorFormReactiveComponent,
    FormsModule,
    ReactiveFormsModule,
    ActorFormTemplateComponent,
  ],
})
export class AppComponent {}
