import {Component, forwardRef} from '@angular/core';

@Component({
  selector: 'test',
  imports: [forwardRef(() => StandaloneComponent)],
  template: '<other-standalone></other-standalone>',
})
export class TestComponent {
}

@Component({
  selector: 'other-standalone',
  template: '',
})
export class StandaloneComponent {
}
