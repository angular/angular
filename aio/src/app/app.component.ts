import { Component, ViewChild } from '@angular/core';

import { SidenavComponent } from './sidenav/sidenav.component';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
  styleUrls:  ['./app.component.scss']
})
export class AppComponent {
  isHamburgerVisible = true; // always ... for now

  @ViewChild(SidenavComponent) sidenav: SidenavComponent;

  toggleSideNav() { this.sidenav.toggle(); }
}
