import { Directive, HostListener, HostBinding, Input } from '@angular/core';
import { LocationService } from 'app/shared/location.service';
@Directive({
  /* tslint:disable-next-line:directive-selector */
  selector: 'a[href]'
})
export class LinkDirective {

  // We need both these decorators to ensure that we can access
  // the href programmatically, and that it appears as a real
  // attribute on the element.
  @Input()
  @HostBinding()
  href: string;

  @HostListener('click', ['$event'])
  onClick($event) {
    this.location.go(this.href);
    return false;
  }

  constructor(private location: LocationService) { }
}
