// #docplaster
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  FormsModule,
  FormControl,
} from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ FormsModule, NgFor ]
})
export class AppComponent implements OnInit {
  title = 'example';
  value = 'initial value';
  control: FormControl = new FormControl('');
  options = [
    'repeat-value'
  ];

  // #docregion template-with-input
  @Input() tpl !: TemplateRef<any>;
  @ContentChild(TemplateRef) inlineTemplate !: TemplateRef<any>;
  // #enddocregion template-with-input

  ngOnInit() {
    // #docregion template-driven-form-example

    this.value = 'some value';

    // #enddocregion template-driven-form-example
    this.setValue();
  }

  setValue(): void {
    // #docregion reactive-form-example

    this.control.setValue('some value');

    // #enddocregion reactive-form-example
  }
}
