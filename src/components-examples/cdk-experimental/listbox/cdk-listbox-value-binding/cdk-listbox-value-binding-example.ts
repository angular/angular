import {Component} from '@angular/core';

/** @title Listbox with value binding. */
@Component({
  selector: 'cdk-listbox-value-binding-example',
  exportAs: 'cdkListboxValueBindingExample',
  templateUrl: 'cdk-listbox-value-binding-example.html',
  styleUrls: ['cdk-listbox-value-binding-example.css'],
})
export class CdkListboxValueBindingExample {
  starters = ['Sprigatito', 'Fuecoco', 'Quaxly'];
  starter: readonly string[] = ['Fuecoco'];

  reset() {
    this.starter = ['Fuecoco'];
  }
}
