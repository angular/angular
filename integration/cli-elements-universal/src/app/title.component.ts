import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-title',
  template: '<h1>{{ appName }} app is running!</h1>',
  standalone: false,
})
export class TitleComponent {
  @Input() appName = 'Unknown';
}
