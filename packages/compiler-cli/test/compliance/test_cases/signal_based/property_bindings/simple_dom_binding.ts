import {Component} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `<button [disabled]="true"></button>`,
})
export class LiteralValueBinding {
}

@Component({
  selector: 'app',
  signals: true,
  template: `<button [disabled]="isDisabled"></button>`,
})
export class FromContextBindingStatic {
  isDisabled = true;
}

@Component({
  selector: 'app',
  signals: true,
  template: `<button [disabled]="isDisabled()"></button>`,
})
export class FromContextBindingSignal {
  isDisabled = () => true;  // TODO
}
