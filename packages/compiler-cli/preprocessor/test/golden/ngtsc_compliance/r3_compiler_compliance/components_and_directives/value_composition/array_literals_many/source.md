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
    "array_literals_many.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /array_literals_many.ts
```ts
import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'my-comp',
    template: `
    {{ names[0] }}
    {{ names[1] }}
    {{ names[3] }}
    {{ names[4] }}
    {{ names[5] }}
    {{ names[6] }}
    {{ names[7] }}
    {{ names[8] }}
    {{ names[9] }}
    {{ names[10] }}
    {{ names[11] }}
  `,
    standalone: false
})
export class MyComp {
  @Input() names!: string[];
}

@Component({
    selector: 'my-app',
    template: `
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`,
    standalone: false
})
export class MyApp {
  n0 = 'a';
  n1 = 'b';
  n2 = 'c';
  n3 = 'd';
  n4 = 'e';
  n5 = 'f';
  n6 = 'g';
  n7 = 'h';
  n8 = 'i';
}

@NgModule({declarations: [MyComp, MyApp]})
export class MyModule {
}
```
