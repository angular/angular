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
    "nested_two_way.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_two_way.ts
```ts
import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: 'Name: <ng-template><input [(ngModel)]="name"></ng-template>',
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
  @Output() ngModelChange: EventEmitter<string> = new EventEmitter();
}

@NgModule({declarations: [TestCmp, NgModelDirective]})
export class AppModule {
}
```
