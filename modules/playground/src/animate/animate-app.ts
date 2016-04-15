import {Component} from 'angular2/core';
import {animation, group, animate, style, sequence} from 'angular2/animate';

@Component({
  selector: 'animate-app',
  styleUrls: ['css/animate-app.css'],
  templateUrl: './animate-app.html',
  animations: [
    animation("boxAnimation(void => start)", [
      style({"height": 0, "opacity": 0}),
      style({"background": "gold"}),
      animate({"height": 100, "opacity": 1, "background":"red"}, 500)
    ]),
    animation("boxAnimation(start => active)", [
      style({"background": "red"}),
      animate({"background": "green"}, 1000)
    ]),
    animation("boxAnimation(active => start)", [
      style({"background": "green"}),
      animate({"background": "red"}, 1000)
    ]),
    animation("boxAnimation(* => void)", [
      style({"height": 100, "opacity": 1}),
      animate({"height": 0, "opacity": 0}, 500)
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
