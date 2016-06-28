import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {Dir} from '@angular2-material/core/rtl/dir';
import {MdButton} from '@angular2-material/button/button';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav/sidenav';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list/list';
import {MdIcon} from '@angular2-material/icon/icon';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';


@Component({
  selector: 'home',
  template: `
    <p>e2e website!</p>
  `
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  providers: [],
  templateUrl: 'e2e-app.html',
  directives: [
    ROUTER_DIRECTIVES,
    Dir,
    MdButton,
    MdIcon,
    MD_SIDENAV_DIRECTIVES,
    MD_LIST_DIRECTIVES,
    MdToolbar
  ],
  pipes: []
})
export class E2EApp { }
