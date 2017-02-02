import { Directive, HostListener, Input } from '@angular/core';
import { NavEngine } from './nav-engine';

@Directive({
  selector: '[navLink]'
})
export class NavLink {
  constructor(private navEngine:NavEngine){}
  @Input() navLink:string;
  @HostListener('click', ['$event'])
  onClick($event){
    this.navEngine.navigate(this.navLink);
    return false;
  }
}
