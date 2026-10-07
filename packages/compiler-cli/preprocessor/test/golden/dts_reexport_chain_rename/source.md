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

# /node_modules/chain-lib/package.json
```json
{
  "name": "chain-lib",
  "types": "index.d.ts"
}
```

The rename happens in the middle of the chain: the entry point forwards `Public`, and only
`./mid` knows that `Public` is `./impl`'s `Internal`. Matching the entry point's re-export by
name never sees the declared name, so the declaration looks unpublished and the emit falls back
to a relative path into `node_modules`.

# /node_modules/chain-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { Internal } from './impl';

export { Public } from './mid';

export declare class ChainModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<ChainModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<ChainModule, never, never, [typeof Internal]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<ChainModule>;
}
```

# /node_modules/chain-lib/mid.d.ts
```ts
export { Internal as Public } from './impl';
```

# /node_modules/chain-lib/impl.d.ts
```ts
import * as i0 from '@angular/core';

export declare class Internal {
  static ɵfac: i0.ɵɵFactoryDeclaration<Internal, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<Internal, "[chain-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {ChainModule} from 'chain-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div chain-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [ChainModule],
})
export class AppModule {}
```
