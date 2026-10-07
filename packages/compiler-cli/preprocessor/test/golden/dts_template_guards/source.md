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

# /my-dir.d.ts
```ts
import * as i0 from '@angular/core';

export declare class MyIfContext<T = unknown> {
  $implicit: T;
  myIf: T;
}

export declare class MyIf<T = unknown> {
  myIf: T;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyIf<any>, never>;
  // standalone: true
  static ɵdir: i0.ɵɵDirectiveDeclaration<MyIf<any>, "[myIf]", never, {"myIf": { "alias": "myIf"; "required": false; }; }, {}, never, never, true>;

  static ngTemplateContextGuard<T>(dir: MyIf<T>, ctx: any): ctx is MyIfContext<Exclude<T, false | 0 | '' | null | undefined>>;
  static ngTemplateGuard_myIf: 'binding';
  static ngTemplateGuard_myIfInvocation(dir: MyIf<any>, expr: any): expr is string;
}

export declare class InvalidGuardsContext<T = unknown> {
  $implicit: T;
  invalidGuards: T;
}

export declare class MyDirWithInvalidGuards<T = unknown> {
  invalidGuards: T;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirWithInvalidGuards<any>, never>;
  // standalone: true
  static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirWithInvalidGuards<any>, "[invalidGuards]", never, {"invalidGuards": { "alias": "invalidGuards"; "required": false; }; }, {}, never, never, true>;

  // Test that property context guards and un-initialized/non-binding property guard types
  // are completely ignored by the compiler-cli and do not appear in the generated TCB.
  static ngTemplateContextGuard: any;
  static ngTemplateGuard_invalidGuards: 'invocation';
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
