import {Component} from '@angular/core';

/** @title Stateful Menu with Standalone Trigger. */
@Component({
  selector: 'cdk-menu-standalone-stateful-menu-example',
  styleUrls: ['cdk-menu-standalone-stateful-menu-example.css'],
  templateUrl: 'cdk-menu-standalone-stateful-menu-example.html',
})
export class CdkMenuStandaloneStatefulMenuExample {
  bold = true;
  italic = false;

  sizes = ['Small', 'Normal', 'Large'];
  selectedSize: string | undefined = 'Normal';
}
