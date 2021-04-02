import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'comp-with-host-binding',
  template: 'I am a component!',
})
export class CompWithHostBindingComponent {
  @HostBinding('class.special')
  isSpecial = false;

  @HostBinding('style.color')
  color = 'pink';

  // #docregion hostbinding
  @HostBinding('style.width')
  width = '200px';
  // #enddocregion hostbinding
}
