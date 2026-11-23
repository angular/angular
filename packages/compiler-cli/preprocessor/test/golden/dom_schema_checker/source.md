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
    "/dom_schema_checker.ts"
  ]
}
```

# /dom_schema_checker.ts
```ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
})
export class MyComp {}

@Component({
  selector: 'my-comp-no-errors',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  schemas: [NO_ERRORS_SCHEMA],
})
export class MyCompNoErrors {}
```
