// #docregion
import {Component} from '@angular/core';

import {HighlightDirective} from '../shared/highlight.directive';
import {TwainComponent} from '../twain/twain.component';

@Component({
  template: `
    <h2 highlight="skyblue">About</h2>
    <h3>Quote of the day:</h3>
    <twain-quote></twain-quote>
  `,
  imports: [TwainComponent, HighlightDirective],
})
export class AboutComponent {}
