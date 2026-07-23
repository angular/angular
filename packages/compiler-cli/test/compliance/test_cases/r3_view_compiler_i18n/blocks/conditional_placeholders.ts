import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div i18n>Before @if (show) {shown {{name}}} @else {hidden} after</div>`,
})
export class AppComponent {
  show = true;
  name = 'x';
}
