# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "module": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["app.ts"]
}
```

# /node_modules/@scope/inner/package.json
```json
{
  "name": "@scope/inner",
  "types": "index.d.ts"
}
```

The entry point declares `InternalDirective` and publishes it under a different name. The
declared name is the one in the file's class index; the published name is the only one an
importer can write. Reading the class index as the export list gets the specifier right and the
name wrong, producing `i1.InternalDirective` — a member `@scope/inner` does not have.

# /node_modules/@scope/inner/index.d.ts
```ts
import * as i0 from '@angular/core';

declare class InternalDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<InternalDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<InternalDirective, "[renamed-dir]", never, {}, {}, never, never, false, never>;
}

export { InternalDirective as PublicDirective };

export declare class InnerModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<InnerModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<InnerModule, never, never, [typeof InternalDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<InnerModule>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {InnerModule} from '@scope/inner';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div renamed-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [InnerModule],
})
export class AppModule {}
```
