import {Component} from '@angular/core';

/** @title Sidenav open & close behavior */
@Component({
  selector: 'sidenav-open-close-example',
  templateUrl: 'sidenav-open-close-example.html',
  styleUrls: ['sidenav-open-close-example.css'],
})
export class SidenavOpenCloseExample {
  events: string[] = [];
  opened: boolean;

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
