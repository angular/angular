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

# /node_modules/deep-lib/package.json
```json
{
  "name": "deep-lib",
  "types": "index.d.ts"
}
```

`deep-lib` is a non-flattened library: its entry point reaches the directive through a chain of
18 `export *` barrels. The directive is unambiguously part of the package's public surface — the
walk has to follow the whole chain to see it. A visit budget on that walk reports a
published symbol as unexported, drops the owning module, and emits a relative path into
`node_modules`.

# /node_modules/deep-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { DeepDirective } from './b1';

export * from './b1';

export declare class DeepModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<DeepModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<DeepModule, never, never, [typeof DeepDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<DeepModule>;
}
```

# /node_modules/deep-lib/b1.d.ts
```ts
export * from './b2';
```

# /node_modules/deep-lib/b2.d.ts
```ts
export * from './b3';
```

# /node_modules/deep-lib/b3.d.ts
```ts
export * from './b4';
```

# /node_modules/deep-lib/b4.d.ts
```ts
export * from './b5';
```

# /node_modules/deep-lib/b5.d.ts
```ts
export * from './b6';
```

# /node_modules/deep-lib/b6.d.ts
```ts
export * from './b7';
```

# /node_modules/deep-lib/b7.d.ts
```ts
export * from './b8';
```

# /node_modules/deep-lib/b8.d.ts
```ts
export * from './b9';
```

# /node_modules/deep-lib/b9.d.ts
```ts
export * from './b10';
```

# /node_modules/deep-lib/b10.d.ts
```ts
export * from './b11';
```

# /node_modules/deep-lib/b11.d.ts
```ts
export * from './b12';
```

# /node_modules/deep-lib/b12.d.ts
```ts
export * from './b13';
```

# /node_modules/deep-lib/b13.d.ts
```ts
export * from './b14';
```

# /node_modules/deep-lib/b14.d.ts
```ts
export * from './b15';
```

# /node_modules/deep-lib/b15.d.ts
```ts
export * from './b16';
```

# /node_modules/deep-lib/b16.d.ts
```ts
export * from './b17';
```

# /node_modules/deep-lib/b17.d.ts
```ts
export * from './b18';
```

# /node_modules/deep-lib/b18.d.ts
```ts
import * as i0 from '@angular/core';

export declare class DeepDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<DeepDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<DeepDirective, "[deep-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {DeepModule} from 'deep-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div deep-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [DeepModule],
})
export class AppModule {}
```
