import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[tabindex]': '1' },
    standalone: false
})
export class MyDirective {
  @HostBinding('title') myTitle = 'hello';

  @HostBinding('id') myId = 'special-directive';
}
