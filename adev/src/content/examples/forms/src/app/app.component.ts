// #docregion
import {Component} from '@angular/core';
import {ActorFormComponent} from './actor-form/actor-form.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ActorFormComponent],
})
export class AppComponent {}
