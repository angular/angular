import {Component} from '@angular/core';

@Component({
  selector: 'gestures-demo',
  templateUrl: 'demo-app/gestures/gestures-demo.html',
  styleUrls: ['demo-app/gestures/gestures-demo.css'],
  directives: []
})
export class GesturesDemo {
  dragCount: number = 0;
  panCount: number = 0;
  pressCount: number = 0;
  longpressCount: number = 0;
  swipeCount: number = 0;
}
