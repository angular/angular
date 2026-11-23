# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts"]
}
```

# /app.module.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';

@NgModule({})
export class ImportedModule {}

@NgModule({})
export class ExportedModule {}

@Component({
  selector: 'my-comp',
  template: '',
  standalone: false
})
export class MyComponent {}

@NgModule({
  imports: [ImportedModule],
  declarations: [MyComponent],
  exports: [ExportedModule, MyComponent]
})
export class MyModule {}
```
