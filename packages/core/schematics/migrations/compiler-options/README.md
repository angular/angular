## Compiler Options migrations

`CompilerOptions.useJit` and `CompilerOptions.missingTranslation` config options are unused in Ivy and have no effects. They can be safely removed.

#### Before

```ts
import {ViewEncapsulation, MissingTranslationStrategy, CompilerOptions} from '@angular/core';

const compilerOptions: CompilerOptions = {
   defaultEncapsulation: ViewEncapsulation.None,
   preserveWhitespaces: true,
   useJit: true,
   missingTranslation: MissingTranslationStrategy.Ignore,
};
```

#### After

```ts
import {ViewEncapsulation, CompilerOptions} from '@angular/core';


const compilerOptions: CompilerOptions = {
   defaultEncapsulation: ViewEncapsulation.None,
   preserveWhitespaces: true,
};
```
