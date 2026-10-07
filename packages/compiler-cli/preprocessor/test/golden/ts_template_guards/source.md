# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.ts"]
}
```

# /my-dir.ts
```ts
import {Directive, Input} from '@angular/core';

export declare class MyIfContext<T = unknown> {
  $implicit: T;
  myIf: T;
}

@Directive({
  selector: '[myIf]',
  standalone: true
})
export class MyIf<T = unknown> {
  @Input() myIf!: T;
  @Input('myIfInvocation') myIfInvocation!: T;

  static ngTemplateContextGuard<T>(dir: MyIf<T>, ctx: any): ctx is MyIfContext<Exclude<T, false | 0 | '' | null | undefined>> {
    return true;
  }
  
  // Valid 'binding' input guard (must have explicit type annotation)
  static ngTemplateGuard_myIf: 'binding';

  // Valid Method type 'invocation' input guard
  static ngTemplateGuard_myIfInvocation(dir: MyIf<any>, expr: any): expr is string {
    return true;
  }
}

export declare class InvalidGuardsContext<T = unknown> {
  $implicit: T;
  invalidGuards: T;
}

@Directive({
  selector: '[invalidGuards]',
  standalone: true
})
export class MyDirWithInvalidGuards<T = unknown> {
  @Input() invalidGuards!: T;

  // Test that property context guards and un-initialized/non-binding property input guard types
  // are completely ignored by the compiler-cli and do not appear in the generated TCB.
  declare static ngTemplateContextGuard: any;
  declare static ngTemplateGuard_invalidGuards: 'invocation';
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyIf, MyDirWithInvalidGuards} from './my-dir';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyIf, MyDirWithInvalidGuards],
  template: `
    <div *myIf="authService.user as user; invocation: authService.user">
      {{user.name}}
    </div>
    <div *invalidGuards="authService.user as user">
      {{user.name}}
    </div>
  `
})
export class AppComponent {
  authService = {
    user: { name: 'John' } as { name: string } | null
  };
}
```
