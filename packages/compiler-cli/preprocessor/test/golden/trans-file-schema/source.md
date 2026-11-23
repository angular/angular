# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "strict": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "paths": {
      "@angular/core": ["./node_modules/@angular/core/index.d.ts"]
    }
  },
  "files": [
    "/app.module.ts",
    "/my-comp.component.ts"
  ]
}
```

# /app.module.ts
```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MyComp } from './my-comp.component';

@NgModule({
  declarations: [MyComp],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

# /my-comp.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  standalone: false,
})
export class MyComp {}
```
