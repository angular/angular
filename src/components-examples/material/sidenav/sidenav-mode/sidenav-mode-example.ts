import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/** @title Sidenav with configurable mode */
@Component({
  selector: 'sidenav-mode-example',
  templateUrl: 'sidenav-mode-example.html',
  styleUrls: ['sidenav-mode-example.css'],
})
export class SidenavModeExample {
  mode = new UntypedFormControl('over');
  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
