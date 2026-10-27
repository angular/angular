# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "@first/*": ["first.module"]
    }
  },
  "files": [
    "first.module.ts",
    "second.module.ts",
    "app.component.ts",
    "sub/sub.pipe.ts",
    "sub/sub.module.ts",
    "sub/index.ts"
  ]
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

# /sub/sub.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sub',
  standalone: false,
})
export class SubPipe implements PipeTransform {
  transform(value: string): string {
    return `[Sub] ${value}`;
  }
}
```

# /sub/sub.module.ts
```ts
import { NgModule } from '@angular/core';
import { SubPipe } from './sub.pipe';

@NgModule({
  declarations: [SubPipe],
  exports: [SubPipe],
})
export class SubModule {}
```

# /sub/index.ts
```ts
export { SubModule } from './sub.module';
export { SubPipe } from './sub.pipe';
```

# /app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { FirstModule } from './first.module';
import { SecondModule } from './second.module';
import { TransitPipe } from '@first/module'; // Imported via alias
import { SubModule, SubPipe } from './sub'; // Imported from directory (Scenario 2)

@Component({
  selector: 'app-root',
  template: `<div>{{ 'hello' | transit }} | {{ 'world' | sub }}</div>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [FirstModule, SecondModule, SubModule],
  declarations: [AppComponent],
})
export class AppModule {}
```
