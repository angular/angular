import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<svg><use [attr.xlink:href]="icon"></use></svg>`,
})
export class AppComponent {
  icon = '';
}
