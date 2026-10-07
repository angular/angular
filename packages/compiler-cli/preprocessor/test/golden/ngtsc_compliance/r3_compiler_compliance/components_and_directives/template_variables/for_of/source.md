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
    "for_of.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_of.ts
```ts
import {Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

export interface ForOfContext {
  $implicit: any;
  index: number;
  even: boolean;
  odd: boolean;
}

@Directive({
    selector: '[forOf]',
    standalone: false
})
export class ForOfDirective {
  private previous!: any[];

  constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

  @Input() forOf!: any[];

  ngOnChanges(simpleChanges: SimpleChanges) {}
}
```
