import {Component} from '@angular/core';

/** @title Listbox with template-driven forms. */
@Component({
  selector: 'cdk-listbox-template-forms-example',
  exportAs: 'cdkListboxTemplateFormsExample',
  templateUrl: 'cdk-listbox-template-forms-example.html',
  styleUrls: ['cdk-listbox-template-forms-example.css'],
})
export class CdkListboxTemplateFormsExample {
  toppings = ['Extra Cheese', 'Mushrooms', 'Pepperoni', 'Sausage'];
  order: readonly string[] = [];
}
