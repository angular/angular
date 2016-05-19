import {Component} from '@angular/core';
import {MdButton} from '@angular2-material/button/button';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav/sidenav';

@Component({
  moduleId: module.id,
  selector: 'sidenav-demo',
  templateUrl: 'sidenav-demo.html',
  styleUrls: ['sidenav-demo.css'],
  directives: [MD_SIDENAV_DIRECTIVES, MdButton]
})
export class SidenavDemo {}
