import {Component, viewChildren} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `
    <button #buttons></button>
    <button #buttons></button>
  `,
})
export class SimpleViewChildrenWithName {
  buttonEls = viewChildren('buttons');
}


@Component({selector: 'button-comp', template: '', standalone: true})
export class ButtonComp {
}

@Component({
  selector: 'app',
  signals: true,
  standalone: true,
  imports: [ButtonComp],
  template: `
    <button-comp></button-comp>
    <button-comp></button-comp>
  `,
})
export class SimpleViewChildrenWithType {
  buttonEls = viewChildren(ButtonComp);
}
