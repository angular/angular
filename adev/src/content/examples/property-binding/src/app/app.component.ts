import {Component} from '@angular/core';
import {NgClass} from '@angular/common';

import {ItemDetailComponent} from './item-detail.component';
import {ItemListComponent} from './item-list.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ItemDetailComponent, ItemListComponent, NgClass],
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // #docregion item-image
  itemImageUrl = '../assets/phone.svg';
  // #enddocregion item-image
  // #docregion boolean
  isUnchanged = true;
  // #enddocregion boolean
  classes = 'special';
  // #docregion parent-data-type
  parentItem = 'lamp';
  // #enddocregion parent-data-type

  // #docregion pass-object
  currentItems = [
    {
      id: 21,
      name: 'phone',
    },
  ];
  // #enddocregion pass-object

  interpolationTitle = 'Interpolation';
  propertyTitle = 'Property binding';

  evilTitle = 'Template <script>alert("evil never sleeps")</script> Syntax';
}
