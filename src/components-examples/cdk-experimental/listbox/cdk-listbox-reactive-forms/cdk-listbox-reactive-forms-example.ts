import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/** @title Listbox with reactive forms. */
@Component({
  selector: 'cdk-listbox-reactive-forms-example',
  exportAs: 'cdkListboxReactiveFormsExample',
  templateUrl: 'cdk-listbox-reactive-forms-example.html',
  styleUrls: ['cdk-listbox-reactive-forms-example.css'],
})
export class CdkListboxReactiveFormsExample {
  languages = ['C++', 'Java', 'JavaScript', 'Python', 'TypeScript'];
  languageCtrl = new FormControl(['TypeScript']);
}
