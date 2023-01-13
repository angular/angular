import {Component, forwardRef} from '@angular/core';

@Component({
  selector: 'test',
  standalone: true,
  imports: [forwardRef(() => StandaloneComponent)],
  template: '<other-standalone></other-standalone>',
})
export class TestComponent {
}

@Component({
  selector: 'other-standalone',
  standalone: true,
  template: '',
})
export class StandaloneComponent {
}
