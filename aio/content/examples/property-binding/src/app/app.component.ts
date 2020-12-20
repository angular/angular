import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // #docregion item-image
  itemImageUrl = '../assets/phone.png';
  // #enddocregion item-image
  // #docregion boolean
  isUnchanged = true;
  // #enddocregion boolean
  // #docregion directive-property
  classes = 'special';
  // #enddocregion directive-property
  // #docregion parent-data-type
  parentItem = 'lamp';
  // #enddocregion parent-data-type

  // #docregion pass-object
  currentItems = [{
    id: 21,
    name: 'phone'
  }];
  // #enddocregion pass-object

  interpolationTitle = 'Interpolation';
  propertyTitle = 'Property binding';

  // #docregion malicious-content
  evilTitle = 'Template <script>alert("evil never sleeps")</script> Syntax';
  // #enddocregion malicious-content
}
