import {Component, Directive, model} from '@angular/core';

@Directive({
  selector: '[toggle]',
})
export class ToggleDirective {
  checked = model(false);
}

@Component({
  selector: 'app-root',
  imports: [ToggleDirective],
  template: '<div toggle [(checked)]="isChecked"></div>',
})
export class AppComponent {
  isChecked = false;
}
