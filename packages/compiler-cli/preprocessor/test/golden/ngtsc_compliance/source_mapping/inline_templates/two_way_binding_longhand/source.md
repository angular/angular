# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "files": [
    "two_way_binding_longhand.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /two_way_binding_longhand.ts
```ts
import {Component, Directive, EventEmitter, Input, NgModule, Output} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: 'Name: <input bindon-ngModel="name">',
    standalone: false
})
export class TestCmp {
  name: string = '';
}

@Directive({
    selector: '[ngModel]',
    standalone: false
})
export class NgModelDirective {
  @Input() ngModel: string = '';
  @Output() ngModelChanges: EventEmitter<string> = new EventEmitter();
}

@NgModule({declarations: [TestCmp, NgModelDirective]})
export class AppModule {
}
```
