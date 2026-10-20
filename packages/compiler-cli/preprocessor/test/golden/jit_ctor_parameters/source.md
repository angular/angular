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
import {Component, Directive, Inject, InjectionToken, Optional} from '@angular/core';

export class DepService {}
export const TOKEN = new InjectionToken<string>('TOKEN');

function CustomParamDec(): ParameterDecorator {
  return () => {};
}

@Component({
  selector: 'jit-ctor-cmp',
  template: '<div>JIT Ctor</div>',
  jit: true,
})
export class JitCtorComponent {
  constructor(
    @Optional() @Inject(TOKEN) public token: string,
    count: number,
    @CustomParamDec() public dep: DepService,
  ) {}
}

@Directive({
  selector: '[jitEmptyCtor]',
  jit: true,
})
export class JitEmptyCtorDirective {
  constructor() {}
}
```
