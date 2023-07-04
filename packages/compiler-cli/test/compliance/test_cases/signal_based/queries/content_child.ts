import {Component, contentChild} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `{{buttonEl() !== undefined}}`,
})
export class SimpleContentChildWithName {
  buttonEl = contentChild('button');
}


@Component({selector: 'button-comp', template: '', standalone: true})
export class ButtonComp {
}

@Component({
  selector: 'app',
  signals: true,
  template: `{{buttonComp() !== undefined}}`,
})
export class SimpleContentChildWithType {
  buttonComp = contentChild(ButtonComp);
}
