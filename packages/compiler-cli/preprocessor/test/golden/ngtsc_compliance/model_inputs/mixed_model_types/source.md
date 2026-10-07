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
    "mixed_model_types.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /mixed_model_types.ts
```ts
import {Directive, EventEmitter, Input, model, Output} from '@angular/core';

@Directive({})
export class TestDir {
  counter = model(0);
  modelWithAlias = model(false, {alias: 'alias'});

  @Input() decoratorInput = true;
  @Input('publicNameDecorator') decoratorInputWithAlias = true;

  @Output() decoratorOutput = new EventEmitter<boolean>();
  @Output('aliasDecoratorOutputWithAlias') decoratorOutputWithAlias = new EventEmitter<boolean>();

  @Input() decoratorInputTwoWay = true;
  @Output() decoratorInputTwoWayChange = new EventEmitter<boolean>();
}
```
