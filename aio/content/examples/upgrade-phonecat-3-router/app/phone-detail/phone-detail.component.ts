// #docplaster
// #docregion
declare var angular: angular.IAngularStatic;
import { downgradeComponent } from '@angular/upgrade/static';
import { Component } from '@angular/core';

import { Phone, PhoneData } from '../core/phone/phone.service';
import { RouteParams } from '../ajs-upgraded-providers';

@Component({
  templateUrl: 'phone-detail.template.html',
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

angular.module('phoneDetail')
  .directive(
    'phoneDetail',
    downgradeComponent({component: PhoneDetailComponent}) as angular.IDirectiveFactory
  );
