# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "mixed_one_way_two_way_property_order.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /mixed_one_way_two_way_property_order.ts
```ts
import {Component, Directive, Input, Output} from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {
  @Input() a: unknown;
  @Output() aChange: unknown;

  @Input() b: unknown;

  @Input() c: unknown;
  @Output() cChange: unknown;

  @Input() d: unknown;
}

@Component({
  imports: [Dir],
  template: `
    <div dir [(a)]="value" [b]="value" [(c)]="value" [d]="value"></div>
  `,
})
export class App {
  value = 'hi';
}
```
