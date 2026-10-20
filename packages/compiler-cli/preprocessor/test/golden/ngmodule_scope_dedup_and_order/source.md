# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "reexport.ts", "app.ts"]
}
```

# /shared.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
  selector: '[dirX]',
  standalone: false,
})
export class DirX {}

@Directive({
  selector: '[dirB]',
  standalone: false,
})
export class DirB {}

@NgModule({
  declarations: [DirX, DirB],
  exports: [DirX, DirB],
})
export class ModuleA {}

@NgModule({
  imports: [ModuleA],
  exports: [DirX],
})
export class ModuleB {}
```

# /reexport.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
  selector: '[internalDir]',
  standalone: false,
})
class InternalDir {}

@NgModule({
  declarations: [InternalDir],
  exports: [InternalDir],
})
export class ReexportModule {}

export {InternalDir as PublicDir};
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {ModuleA, ModuleB} from './shared';
import {ReexportModule} from './reexport';

@Component({
  selector: 'app-comp',
  template: '<div dirX dirB internalDir></div>',
  standalone: false,
})
export class AppComp {}

@NgModule({
  declarations: [AppComp],
  imports: [ModuleA, ModuleB, ReexportModule],
})
export class AppModule {}
```
