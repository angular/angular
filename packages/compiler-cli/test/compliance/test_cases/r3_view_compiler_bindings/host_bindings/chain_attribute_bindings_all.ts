import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[attr.tabindex]': '1' },
    standalone: false
})
export class MyDirective {
  @HostBinding('attr.title') myTitle = 'hello';

  @HostBinding('attr.id') myId = 'special-directive';
}
