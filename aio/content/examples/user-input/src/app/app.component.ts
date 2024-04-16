// #docregion
import {Component} from '@angular/core';
import {ClickMeComponent} from './click-me.component';
import {ClickMe2Component} from './click-me2.component';
import {
  KeyUpComponent_v1,
  KeyUpComponent_v2,
  KeyUpComponent_v3,
  KeyUpComponent_v4,
} from './keyup.components';
import {LittleTourComponent} from './little-tour.component';
import {LoopbackComponent} from './loop-back.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    ClickMeComponent,
    ClickMe2Component,
    KeyUpComponent_v1,
    KeyUpComponent_v2,
    KeyUpComponent_v3,
    KeyUpComponent_v4,
    LittleTourComponent,
    LoopbackComponent,
  ],
})
export class AppComponent {}
