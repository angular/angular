import { Directive, HostListener, Input } from '@angular/core';
import { NavEngine } from './nav-engine';

@Directive({
  selector: '[aioNavLink]'
})
export class NavLinkDirective {

  @Input()
  aioNavLink: string;

  constructor(private navEngine: NavEngine) { }

  @HostListener('click', ['$event'])
  onClick($event) {
    this.navEngine.navigate(this.aioNavLink);
    return false;
  }
}
