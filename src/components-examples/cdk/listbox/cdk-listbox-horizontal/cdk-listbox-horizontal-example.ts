import {Component} from '@angular/core';

/** @title Horizontal listbox */
@Component({
  selector: 'cdk-listbox-horizontal-example',
  exportAs: 'cdkListboxhorizontalExample',
  templateUrl: 'cdk-listbox-horizontal-example.html',
  styleUrls: ['cdk-listbox-horizontal-example.css'],
})
export class CdkListboxHorizontalExample {
  sizes = ['XS', 'S', 'M', 'L', 'XL'];
}
