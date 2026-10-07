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
    "icu_and_i18n.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /icu_and_i18n.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div i18n>
      <div *ngFor="let diskView of disks">
        {{diskView.name}} has {diskView.length, plural, =1 {VM} other {VMs}}
      </div>
    </div>
  `,
})
export class MyComponent {
  disks: any;
}
```
