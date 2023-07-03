import {Component, viewChild} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `<button #button></button>`,
})
export class SimpleViewChildWithName {
  buttonEl = viewChild('button');
}


@Component({selector: 'button-comp', template: '', standalone: true})
export class ButtonComp {
}

@Component({
  selector: 'app',
  signals: true,
  standalone: true,
  imports: [ButtonComp],
  template: `<button-comp></button-comp>`,
})
export class SimpleViewChildWithType {
  buttonEl = viewChild(ButtonComp);
}
