// #docplaster
// #docregion
declare var angular: angular.IAngularStatic;
import { downgradeComponent } from '@angular/upgrade/static';

// #docregion initialclass
import { Component } from '@angular/core';

import { Phone, PhoneData } from '../core/phone/phone.service';
// #enddocregion initialclass
import { RouteParams } from '../ajs-upgraded-providers';

// #docregion initialclass
@Component({
  selector: 'phone-detail',
  templateUrl: './phone-detail.template.html',
  // #enddocregion initialclass
  // #docregion initialclass
})
export class PhoneDetailComponent {
  phone: PhoneData;
  mainImageUrl: string;

  constructor(routeParams: RouteParams, phone: Phone) {
    phone.get(routeParams['phoneId']).subscribe(phone => {
      this.phone = phone;
      this.setImage(phone.images[0]);
    });
  }

  setImage(imageUrl: string) {
    this.mainImageUrl = imageUrl;
  }
}
// #enddocregion initialclass

angular.module('phoneDetail')
  .directive(
    'phoneDetail',
    downgradeComponent({component: PhoneDetailComponent}) as angular.IDirectiveFactory
  );
