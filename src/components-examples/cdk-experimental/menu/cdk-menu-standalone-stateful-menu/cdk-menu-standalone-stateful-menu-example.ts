import {Component} from '@angular/core';
import {CdkMenuItem} from '@angular/cdk-experimental/menu';

/** @title Stateful Menu with Standalone Trigger. */
@Component({
  selector: 'cdk-menu-standalone-stateful-menu-example',
  styleUrls: ['cdk-menu-standalone-stateful-menu-example.css'],
  templateUrl: 'cdk-menu-standalone-stateful-menu-example.html',
})
export class CdkMenuStandaloneStatefulMenuExample {
  bold = true;
  italic = false;

  size: string | undefined = 'Normal';

  onSizeChange(item: CdkMenuItem) {
    this.size = item._elementRef.nativeElement.textContent?.trim();
  }
}
