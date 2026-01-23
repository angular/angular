import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[myWidthDir]',
    standalone: false
})
export class WidthDirective {
  @HostBinding('style.width') myWidth = 200;

  @HostBinding('class.foo') myFooClass = true;

  @HostBinding('id') id = 'some id';

  @HostBinding('title') title = 'some title';
}
