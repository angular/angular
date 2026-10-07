# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["local.module.ts", "app.component.ts", "shared.module.ts"]
}
```

# /shared.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  standalone: false,
})
export class SharedTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return `[Shared] ${value}`;
  }
}

@NgModule({
  declarations: [SharedTranslatePipe],
  exports: [SharedTranslatePipe],
})
export class SharedModule {}
```

# /local.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { SharedModule } from './shared.module';

@Pipe({
  name: 'translate',
  standalone: false,
})
export class LocalTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return `[Local] ${value}`;
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [LocalTranslatePipe],
  exports: [LocalTranslatePipe, SharedModule], // Export both to create a collision in importers
})
export class LocalModule {}
```

# /app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { LocalModule } from './local.module';

@Component({
  selector: 'app-root',
  template: `<div>{{ 'hello' | translate }}</div>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [LocalModule],
  declarations: [AppComponent],
})
export class AppModule {}
```
