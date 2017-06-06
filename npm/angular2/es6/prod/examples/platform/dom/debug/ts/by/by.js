import { By } from 'angular2/platform/browser';
var debugElement;
class MyDirective {
}
// #docregion by_all
debugElement.query(By.all());
// #enddocregion
// #docregion by_css
debugElement.query(By.css('[attribute]'));
// #enddocregion
// #docregion by_directive
debugElement.query(By.directive(MyDirective));
// #enddocregion
