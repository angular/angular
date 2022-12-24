// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'toh-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  menuItems = [
    'Heroes',
    'Villains',
    'Other'
  ];

}
