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
    "nested_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_template.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
  `,
    standalone: false
})
class Cmp {
}

@NgModule({declarations: [Cmp]})
class Module {
}
```
