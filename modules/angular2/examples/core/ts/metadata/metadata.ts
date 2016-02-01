import {Component, Attribute, Directive, Pipe} from 'angular2/core';

var CustomDirective;

// #docregion component
@Component({selector: 'greet', template: 'Hello {{name}}!', directives: [CustomDirective]})
class Greet {
  name: string = 'World';
}
// #enddocregion

// #docregion attributeFactory
@Component({selector: 'page', template: 'Title: {{title}}'})
class Page {
  title: string;
  constructor(@Attribute('title') title: string) { this.title = title; }
}
// #enddocregion

// #docregion attributeMetadata
@Directive({selector: 'input'})
class InputAttrDirective {
  constructor(@Attribute('type') type) {
    // type would be 'text' in this example
  }
}
// #enddocregion

// #docregion directive
@Directive({selector: 'input'})
class InputDirective {
  constructor() {
    // Add some logic.
  }
}
// #enddocregion

// #docregion pipe
@Pipe({name: 'lowercase'})
class Lowercase {
  transform(v, args) { return v.toLowerCase(); }
}
// #enddocregion
