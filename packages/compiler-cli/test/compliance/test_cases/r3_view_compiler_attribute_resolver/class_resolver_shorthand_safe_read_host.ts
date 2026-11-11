import {ClassCallback, Directive} from '@angular/core';

@Directive({
  selector: '[shorthand]',
  host: {'(class)': 'choice?.classes'},
})
export class ShorthandDirective {
  choice: {classes: ClassCallback} | null = null;
}

@Directive({
  selector: '[expansion]',
  host: {'(attr.class)': '$event.resolve((choice?.classes)($event.resolver))'},
})
export class ExpansionDirective {
  choice: {classes: ClassCallback} | null = null;
}
