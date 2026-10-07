import {Component} from '@angular/core';

@Component({
  selector: 'app-isolated-inc',
  template: '<div>Hello {{ name }}</div>',
  standalone: true,
})
export class IsolatedIncComponent {
  name = 'Angular LS Test';
}
