import {Directive, ResolvedAttribute} from '@angular/core';

@Directive({
  selector: '[myDir]',
  host: {style: 'width: 1px', '(style)': 'styles'},
})
export class MyDirective {
  styles(s: (...extras: string[]) => ResolvedAttribute): ResolvedAttribute {
    return s('height: 2px');
  }
}
