# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';

@Directive({
  selector: '[my-dir]',
  standalone: false,
})
export class MyDirective {}

@NgModule({
  declarations: [MyDirective],
  exports: [MyDirective],
})
export class MyModule {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyModule],
  template: '<div my-dir></div>',
})
export class AppComponent {}
```
