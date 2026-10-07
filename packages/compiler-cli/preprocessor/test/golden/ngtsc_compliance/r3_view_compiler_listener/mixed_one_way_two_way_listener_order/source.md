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
    "mixed_one_way_two_way_listener_order.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /mixed_one_way_two_way_listener_order.ts
```ts
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {
  @Input() a: string = '';
  @Output() aChange = new EventEmitter<string>();

  @Output() b = new EventEmitter();

  @Input() c: string = '';
  @Output() cChange = new EventEmitter<string>();

  @Output() d = new EventEmitter();
}

@Component({
  imports: [Dir],
  template: `
    <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
  `,
})
export class App {
  value = 'hi';
  noop = () => {};
}
```
