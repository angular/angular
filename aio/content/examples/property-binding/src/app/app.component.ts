import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  itemImageUrl = '../assets/phone.png';
  isUnchanged = true;
  classes = 'special';
  // #docregion parent-data-type
  parentItem = 'lamp';
  // #enddocregion parent-data-type

  // #docregion pass-object
  currentItem = [{
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
