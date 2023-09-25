// #docplaster
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import {
  FormControl,
} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'example';
  value = 'initial value';
  control: FormControl = new FormControl('');
  options = [
    'repeat-value'
  ];

  /*
  // #docregion template-with-input-deprecated
  @Input() @ContentChild(TemplateRef) tpldeprecated !: TemplateRef<any>;
  // #enddocregion template-with-input-deprecated
  */

  @Input() tpl !: TemplateRef<any>;
  @ContentChild(TemplateRef) inlineTemplate !: TemplateRef<any>;

  ngOnInit() {
    // #docregion deprecated-example

    this.value = 'some value';

    // #enddocregion deprecated-example
    this.setValue();
  }

  setValue(): void {
    this.control.setValue('some value');
  }
}
