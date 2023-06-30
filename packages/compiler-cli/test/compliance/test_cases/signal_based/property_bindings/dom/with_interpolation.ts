import {Component, signal} from '@angular/core';

@Component({
  selector: 'app',
  signals: true,
  template: `<button title="This is a {{'submit'}} button"></button>`,
})
export class LiteralValueBinding {
}

@Component({
  selector: 'app',
  signals: true,
  template: `<button title="This is a {{type}} button"></button>`,
})
export class FromContextBindingStatic {
  type = 'submit';
}

@Component({
  selector: 'app',
  signals: true,
  template: `<button title="This is a {{type()}} button"></button>`,
})
export class FromContextBindingSignal {
  type = signal('submit');
}
