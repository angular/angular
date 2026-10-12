# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "emitDeclarationOnly": true,
    "isolatedDeclarations": true
  },
  "angularCompilerOptions": {
    "_experimentalAllowEmitDeclarationOnly": true
  },
  "files": ["index.ts", "list.ts", "greet.pipe.ts"]
}
```

# /greet.pipe.ts
```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'greet', standalone: false})
export class GreetPipe implements PipeTransform {
  transform(v: string): string {
    return v;
  }
}
```

# /list.ts
```ts
import {Type} from '@angular/core';
import {GreetPipe} from './greet.pipe';

export const LIST: Array<Type<unknown>> = [GreetPipe];
```

# /index.ts
```ts
import {NgModule} from '@angular/core';
import {LIST} from './list';

@NgModule({
  declarations: LIST,
  exports: LIST,
})
export class SharedModule {}
```
