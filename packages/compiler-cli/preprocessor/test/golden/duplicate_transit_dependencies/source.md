# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["first.module.ts", "second.module.ts", "app.component.ts"]
}
```

# /first.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transit',
  standalone: false,
})
export class TransitPipe implements PipeTransform {
  transform(value: string): string {
    return `[Transit] ${value}`;
  }
}

@NgModule({
  declarations: [TransitPipe],
  exports: [TransitPipe],
})
export class FirstModule {}
```

# /second.module.ts
```ts
import { NgModule } from '@angular/core';
import { FirstModule } from './first.module';

@NgModule({
  imports: [FirstModule],
  exports: [FirstModule],
})
export class SecondModule {}
```

# /app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { FirstModule } from './first.module';
import { SecondModule } from './second.module';

@Component({
  selector: 'app-root',
  template: `<div>{{ 'hello' | transit }}</div>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [FirstModule, SecondModule],
  declarations: [AppComponent],
})
export class AppModule {}
```
