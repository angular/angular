# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "onlyPublishPublicTypingsForNgModules": true
  },
  "files": ["shared.module.ts", "widgets.ts", "app.module.ts"]
}
```

# /shared.module.ts
```ts
import { NgModule } from '@angular/core';

@NgModule({})
export class SharedModule {}
```

# /widgets.ts
```ts
import { Component, Directive, Pipe } from '@angular/core';

@Directive({ selector: '[publicDir]', standalone: false })
export class PublicDir {}

@Component({ selector: 'private-cmp', template: '', standalone: false })
export class PrivateCmp {}

@Component({ selector: 'internal-cmp', template: '', standalone: false })
export class InternalCmp {}

@Pipe({ name: 'aliased', standalone: false })
export class AliasedPipe {
  transform(v: unknown) {
    return v;
  }
}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedModule } from './shared.module';
import { PublicDir, PrivateCmp, AliasedPipe, InternalCmp } from './widgets';
import { AliasedPipe as ReexportedPipe } from './widgets';

@NgModule({
  declarations: [PublicDir, PrivateCmp, AliasedPipe],
  imports: [SharedModule],
  exports: [PublicDir, ReexportedPipe, SharedModule],
})
export class AppModule {}

// Declares nothing it exports: the declarations tuple collapses to `never`.
@NgModule({
  declarations: [InternalCmp],
  imports: [SharedModule],
})
export class InternalModule {}
```
