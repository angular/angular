import {Component} from 'angular2/src/core/metadata';
import {Injectable} from 'angular2/core';
import {COMMON_DIRECTIVES, DatePipe} from 'angular2/common';

@Component({
  selector: 'comp',
  template: '<blink *ngIf="true"></blink>',
  directives: [COMMON_DIRECTIVES],
  pipes: [DatePipe]
})
export class HasDirectivesAndPipes {
}
