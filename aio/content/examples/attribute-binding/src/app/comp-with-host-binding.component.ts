import { Component } from '@angular/core';

@Component({
  selector: 'comp-with-host-binding',
  template: 'I am a component!',
  host: {
    '[class.special]': 'isSpecial',
    '[style.color]': 'color',
    '[style.width]': 'width'
  }
})
export class CompWithHostBindingComponent {
  isSpecial = false;
  color = 'green';
  width = '200px';
}
