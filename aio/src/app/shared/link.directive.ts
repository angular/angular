import { Directive, HostListener, HostBinding, Input, OnChanges } from '@angular/core';
import { LocationService } from 'app/shared/location.service';
@Directive({
  /* tslint:disable-next-line:directive-selector */
  selector: 'a[href]'
})
export class LinkDirective implements OnChanges {

  // We need both these decorators to ensure that we can access
  // the href programmatically, and that it appears as a real
  // attribute on the element.
  @Input()
  @HostBinding()
  href: string;

  @HostBinding()
  target: string;

  @HostListener('click', ['$event'])
  onClick($event) {
    if (this.isAbsolute(this.href)) {
      return true;
    } else {
      this.location.go(this.href);
      return false;
    }
  }

  private isAbsolute(url) {
    return /^[a-z]+:\/\/|\/\//i.test(url);
  }

  constructor(private location: LocationService) { }

  ngOnChanges() {
    this.target = this.isAbsolute(this.href) ? '_blank' : '_self';
  }

}
