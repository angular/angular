import {DebugElement, Scope} from 'angular2/core';

var debugElement: DebugElement;
var predicate;

// #docregion scope_all
debugElement.query(predicate, Scope.all);
// #enddocregion

// #docregion scope_light
debugElement.query(predicate, Scope.light);
// #enddocregion

// #docregion scope_view
debugElement.query(predicate, Scope.view);
// #enddocregion
