# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "id_expression.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chunk_ids.ts
```ts
export enum ChunkId {
  LAZY_THING = 'ngp_lazy_thing',
}
```

# /id_expression.ts
```ts
import {NgModule} from '@angular/core';

import {ChunkId} from './chunk_ids';

declare const module: {id: string};

const LOCAL_ID = 'local_const_id';

@NgModule({
  id: ChunkId.LAZY_THING,
})
export class EnumIdModule {}

@NgModule({
  id: LOCAL_ID,
})
export class ConstIdModule {}

@NgModule({
  id: 'literal_id',
})
export class LiteralIdModule {}

@NgModule({
  id: module.id,
})
export class ModuleIdModule {}

@NgModule({
  id: module?.id,
})
export class OptionalChainModuleIdModule {}

@NgModule({
  id: (module.id),
})
export class ParenthesizedModuleIdModule {}

@NgModule({
  id: (module.id as any),
})
export class CastModuleIdModule {}

@NgModule({
  id: module.id!,
})
export class NonNullModuleIdModule {}
```
