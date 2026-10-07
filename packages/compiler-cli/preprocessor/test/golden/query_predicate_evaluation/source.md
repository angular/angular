# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true
  },
  "files": ["refs.ts", "test.ts"]
}
```

# /refs.ts
```ts
export const IMPORTED_REF = 'importedRef';
```

# /test.ts
```ts
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  ViewChild,
  ViewChildren,
  contentChild,
  forwardRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import {IMPORTED_REF} from './refs';

const PREFIX = 'my';

@Directive({selector: '[marker]', standalone: true})
export class Marker {}

@Component({
  selector: 'test-comp',
  template: '<div #myRef #x #y #z></div>',
  standalone: true,
})
export class TestComp {
  // A template literal with a substitution is evaluated: ngc emits ["myRef"].
  @ViewChild(`${PREFIX}Ref`) templated: any;
  // Every array element is split on commas: ngc emits ["x", "y", "z"].
  @ViewChildren(['x,y', 'z'] as any) arrayWithComma: any;
  // Escape sequences are cooked: ngc emits ["it's"].
  @ContentChild('it\'s') escaped: any;
  // A comma-separated string is split: ngc emits ["a", "b"].
  @ViewChildren('a, b') commaString: any;
  // An imported constant is evaluated across files when that file is visible.
  @ViewChild(IMPORTED_REF) imported: any;
  // Ordinary predicates, with options that must be unaffected.
  @ViewChild('plain', {read: ElementRef, static: true}) plain: any;
  @ViewChild(Marker) byType: any;
  @ContentChildren(forwardRef(() => Marker), {descendants: true}) byForwardRef: any;

  // Signal queries take only a string literal as a selector list; anything else is emitted as
  // an expression, so the substituted template literal stays verbatim.
  signalString = viewChild('sig');
  signalTemplate = viewChild(`${PREFIX}Sig`);
  signalNoSubstitution = viewChild(`bare`);
  signalEscaped = contentChild('sig\'s');
  signalByType = viewChildren(Marker);
}

@Directive({
  selector: '[legacy]',
  standalone: true,
  // The `queries` metadata property evaluates its predicates like the decorators do.
  queries: {legacy: new ViewChildren(['p,q', `${PREFIX}Legacy`] as any)},
})
export class LegacyQueries {
  legacy: any;
}
```
