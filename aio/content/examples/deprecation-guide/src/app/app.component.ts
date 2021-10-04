// #docplaster
import { Component, ContentChild, Injector, Input, OnInit, StaticProvider, TemplateRef } from '@angular/core';
import { ReflectiveInjector } from '@angular/core';
import {
  FormControl,
} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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

  // #docregion template-with-input
  @Input() tpl !: TemplateRef<any>;
  @ContentChild(TemplateRef) inlineTemplate !: TemplateRef<any>;
  // #enddocregion template-with-input

  ngOnInit() {
    // #docregion deprecated-example, template-driven-form-example

    this.value = 'some value';

    // #enddocregion deprecated-example, template-driven-form-example
    this.setValue();
  }

  setValue(): void {
    // #docregion reactive-form-example

    this.control.setValue('some value');

    // #enddocregion reactive-form-example
  }
}

class InjectorExample {}

const Provider  = [InjectorExample];
const providers: StaticProvider[] = [Provider];

// #docregion reflective-injector-deprecated-example
ReflectiveInjector.resolveAndCreate(providers);
// #enddocregion reflective-injector-deprecated-example

// #docregion static-injector-example
Injector.create({providers});
// #enddocregion static-injector-example
