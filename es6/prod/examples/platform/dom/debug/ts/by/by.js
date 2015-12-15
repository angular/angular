import { By } from 'angular2/platform/browser';
import { Scope } from 'angular2/core';
var debugElement;
class MyDirective {
}
// #docregion by_all
debugElement.query(By.all(), Scope.all);
// #enddocregion
// #docregion by_css
debugElement.query(By.css('[attribute]'), Scope.all);
// #enddocregion
// #docregion by_directive
debugElement.query(By.directive(MyDirective), Scope.all);
// #enddocregion
