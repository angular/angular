import { Directive, HostListener, HostBinding, Input } from '@angular/core';
import { NavEngine } from './nav-engine.service';

@Directive({
  selector: '[aioNavLink]'
})
export class NavLinkDirective {

  @Input()
  @HostBinding('attr.href')
  aioNavLink: string;

  constructor(private navEngine: NavEngine) { }

  @HostListener('click', ['$event'])
  onClick($event) {
    this.navEngine.navigate(this.aioNavLink);
    return false;
  }
}
