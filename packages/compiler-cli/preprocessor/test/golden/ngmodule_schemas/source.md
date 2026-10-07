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
    "/ngmodule_schemas.ts"
  ]
}
```

# /ngmodule_schemas.ts
```ts
import { Component, NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'my-comp-custom-elements',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  standalone: false,
})
export class MyCompCustomElements {}

@NgModule({
  declarations: [MyCompCustomElements],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MyCustomElementsModule {}

@Component({
  selector: 'my-comp-no-errors',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  standalone: false,
})
export class MyCompNoErrors {}

@NgModule({
  declarations: [MyCompNoErrors],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MyNoErrorsModule {}

@Component({
  selector: 'my-comp-standalone-importing-module',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  standalone: true,
  imports: [MyNoErrorsModule],
})
export class MyCompStandaloneImportingModule {}

@Component({
  selector: 'my-comp-no-schemas',
  template: `
    <unknown-element></unknown-element>
    <div [unknown-property]="true"></div>
  `,
  standalone: false,
})
export class MyCompNoSchemas {}

@NgModule({
  declarations: [MyCompNoSchemas],
})
export class MyNoSchemasModule {}
```
