// #docregion
import {Component} from '@angular/core';
import {ActorFormReactiveComponent} from './reactive/actor-form-reactive.component';
import {ActorFormComponent} from '../../../forms/src/app/actor-form/actor-form.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `<h1>Form validation example</h1>
             <app-actor-form-template/>
             <hr>
             <app-actor-form-reactive/>`,
  imports: [ActorFormComponent, ActorFormReactiveComponent, FormsModule, ReactiveFormsModule],
})
export class AppComponent {}
