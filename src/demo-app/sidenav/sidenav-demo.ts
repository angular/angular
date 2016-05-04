import {Component} from '@angular/core';
import {MdButton} from '../../components/button/button';
import {MD_SIDENAV_DIRECTIVES} from '../../components/sidenav/sidenav';

@Component({
    selector: 'sidenav-demo',
    templateUrl: 'demo-app/sidenav/sidenav-demo.html',
    styleUrls: ['demo-app/sidenav/sidenav-demo.css'],
    directives: [MD_SIDENAV_DIRECTIVES, MdButton]
})
export class SidenavDemo { }
