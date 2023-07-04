import {Component, contentChildren} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `{{buttonEls().length}}`,
})
export class SimpleContentChildrenWithName {
  buttonEls = contentChildren('button');
}


@Component({selector: 'button-comp', template: '', standalone: true})
export class ButtonComp {
}

@Component({
  selector: 'app',
  signals: true,
  template: `{{buttonComps().length}}`,
})
export class SimpleContentChildrenWithType {
  buttonComps = contentChildren(ButtonComp);
}
