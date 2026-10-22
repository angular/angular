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
  "files": ["index.ts", "greet.pipe.ts", "widget.ts"]
}
```

# /greet.pipe.ts
```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'greet', standalone: false})
export class GreetPipe implements PipeTransform {
  transform(v: string): string {
    return `Hello, ${v}`;
  }
}
```

# /widget.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'shared-widget', template: '', standalone: false})
export class SharedWidget {}
```

# /index.ts
```ts
import {NgModule, Type} from '@angular/core';
import {GreetPipe} from './greet.pipe';
import {SharedWidget} from './widget';

const SHARED: Array<Type<unknown>> = [GreetPipe, SharedWidget];

@NgModule({
  declarations: SHARED,
  exports: SHARED,
})
export class SharedModule {}
```
