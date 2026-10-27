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
import { Component, Directive, Pipe, NgModule } from '@angular/core';

@Component({
  selector: 'standalone-comp',
  template: 'Standalone',
  standalone: true
})
export class StandaloneComponent {}

@Directive({
  selector: '[standalone-dir]',
  standalone: true
})
export class StandaloneDirective {}

@Pipe({
  name: 'standalone-pipe',
  standalone: true
})
export class StandalonePipe {}

@NgModule({})
export class OtherModule {}

@NgModule({
  imports: [StandaloneComponent, StandaloneDirective, StandalonePipe, OtherModule],
})
export class AppModule {}
```
