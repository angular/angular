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
import { NgModule, Directive, Injectable } from '@angular/core';

@Injectable()
export class Svc {}

@Directive({ selector: '[sa]' })
export class SaDir {}

@NgModule({ imports: [SaDir], exports: [SaDir] })
export class NoProvModule {}

@NgModule({ providers: [Svc] })
export class ProvModule {}
```

# /app.module.ts
```ts
import { NgModule, Component } from '@angular/core';
import { NoProvModule, ProvModule, SaDir } from './lib';

const NG_COMPONENT_IMPORTS = [NoProvModule, ProvModule];
const NO_PROVIDER_IMPORTS = [NoProvModule, SaDir];
const NESTED_IMPORTS = [[SaDir], ...NG_COMPONENT_IMPORTS];
const MODULE_IMPORTS = [ProvModule];

@NgModule({ imports: [MODULE_IMPORTS] })
export class LocalTransitiveModule {}

@Component({ selector: 'c1', template: '', imports: [NG_COMPONENT_IMPORTS] })
export class CmpLocalArray {}

@Component({ selector: 'c2', template: '', imports: [...NG_COMPONENT_IMPORTS] })
export class CmpSpread {}

@Component({ selector: 'c3', template: '', imports: NESTED_IMPORTS })
export class CmpNested {}

@Component({ selector: 'c4', template: '', imports: [NO_PROVIDER_IMPORTS] })
export class CmpNoProv {}

@Component({ selector: 'c5', template: '', imports: [LocalTransitiveModule] })
export class CmpLocalTransitive {}

@NgModule({
  imports: [CmpLocalArray, CmpSpread, CmpNested, CmpNoProv, CmpLocalTransitive],
})
export class AppModule {}
```
