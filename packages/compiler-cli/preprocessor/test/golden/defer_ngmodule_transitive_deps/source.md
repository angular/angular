# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.ts",
    "button_module.ts",
    "button.ts",
    "pipe_module.ts",
    "pipe.ts"
  ]
}
```

# /button.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[matButton]',
  standalone: false,
})
export class MatButton {}
```

# /button_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './button';

@NgModule({
  declarations: [MatButton],
  exports: [MatButton],
})
export class MatButtonModule {}
```

# /pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trim',
  standalone: false,
})
export class TrimPipe implements PipeTransform {
  transform(v: string): string {
    return v.trim();
  }
}
```

# /pipe_module.ts
```ts
import { NgModule } from '@angular/core';
import { TrimPipe } from './pipe';

@NgModule({
  declarations: [TrimPipe],
  exports: [TrimPipe],
})
export class TrimPipeModule {}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { MatButtonModule } from './button_module';
import { TrimPipeModule } from './pipe_module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatButtonModule, TrimPipeModule],
  template: `
    @defer (on immediate) {
      <button matButton>{{ '  hello  ' | trim }}</button>
    }
  `,
})
export class AppComponent {}
```
