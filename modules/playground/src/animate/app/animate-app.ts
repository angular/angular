import {Component} from '@angular/core';
import {
  animation,
  state,
  transition,
  group,
  animate,
  style,
  sequence
} from '@angular/animate';

@Component({
  selector: 'animate-app',
  styleUrls: ['css/animate-app.css'],
  templateUrl: './animate-app.html',
  animations: [
    animation("boxAnimation", [
      state("void", style({ "height": 0 })),
      state("start", style({ "background": "red", "height": "*" })),
      state("active", style({ "background": "orange", "color": "white", "font-size":"100px" })),
      transition("void => start", [
        animate(2000)
      ]),
      transition("start => active", [
        animate(1000)
      ]),
      transition("active => start", [
        animate(2000)
      ])
    ])
  ]
})
export class AnimateApp {
  public items = [];
  public _state;

  get state() { return this._state; }
  set state(s) {
    this._state = s;
    if (s == 'start' || s == 'active') {
      this.items = [
        1,2,3,4,5,
        6,7,8,9,10,
        11,12,13,14,15,
        16,17,18,19,20
      ];
    } else {
      this.items = [];
    }
  }
}
