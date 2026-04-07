import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AppComponent {}
