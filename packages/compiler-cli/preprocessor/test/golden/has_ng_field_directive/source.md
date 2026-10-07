# /tsconfig.json
```json
{
  "compilerOptions": {
    "strictTemplates": true
  },
  "files": ["/test.ts"]
}
```

# /test.ts
```ts
import {Directive, Component, Input} from '@angular/core';

const ɵNgFieldDirective = Symbol();

@Directive({
  selector: '[formField]',
  standalone: true,
})
export class FormField {
  @Input() formField: any;
  [ɵNgFieldDirective] = true;
}

@Directive({
  selector: '[myOtherDir]',
  standalone: true,
})
export class MyOtherDirective {
  // Missing ɵNgFieldDirective
}

@Component({
  selector: 'my-comp',
  standalone: true,
  template: `
    <input [formField]="myField" myOtherDir>
  `,
  imports: [FormField, MyOtherDirective],
})
export class MyComp {
  myField: any;
}
```
