# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["lib.ts", "app.module.ts"]
}
```

# /lib.ts
```ts
import { NgModule, Directive, Component, Injectable, Pipe } from '@angular/core';

@Injectable()
export class Svc {}

@Directive({ selector: '[sa]', standalone: true })
export class SaDir {}

@Pipe({ name: 'sp', standalone: true })
export class SaPipe {
  transform(v: unknown) {
    return v;
  }
}

// Declares nothing and imports nothing that carries providers.
@NgModule({ imports: [SaDir], exports: [SaDir] })
export class NoProvModule {}

@NgModule({ providers: [Svc] })
export class ProvModule {}

// Carries providers only through its own imports.
@NgModule({ imports: [ProvModule] })
export class TransitiveModule {}

@NgModule({})
export class PlainModule {}
```

# /app.module.ts
```ts
import { NgModule, Component } from '@angular/core';
import { NoProvModule, ProvModule, TransitiveModule, PlainModule, SaDir, SaPipe } from './lib';

@Component({ selector: 'c1', template: '', imports: [NoProvModule] })
export class CmpNoProv {}

@Component({ selector: 'c2', template: '', imports: [ProvModule] })
export class CmpProv {}

@Component({ selector: 'c3', template: '', imports: [TransitiveModule] })
export class CmpTrans {}

@Component({ selector: 'c4', template: '', imports: [PlainModule] })
export class CmpPlain {}

// `ɵinj.imports` keeps a standalone component only when it may export providers, drops
// directives and pipes outright, and keeps an NgModule unconditionally — whether or not that
// module declares providers of its own.
//
// Verified against ngc 22.1.0-next.6:
//   imports: [CmpProv, CmpTrans, PlainModule]
//
// `CmpNoProv` and `CmpPlain` are dropped because the modules they import carry no providers,
// transitively. `CmpTrans` survives through `TransitiveModule` -> `ProvModule`. `PlainModule`
// survives despite declaring no providers, because the provider question is asked only of
// components.
@NgModule({
  imports: [CmpNoProv, CmpProv, CmpTrans, CmpPlain, PlainModule, SaDir, SaPipe],
})
export class AppModule {}
```
