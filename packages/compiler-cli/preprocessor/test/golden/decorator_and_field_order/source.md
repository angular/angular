# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {Injectable, NgModule} from '@angular/core';

function CustomClassDec(): ClassDecorator {
  return () => {};
}

@CustomClassDec()
@NgModule()
@Injectable()
export class DualDecoratedModule {}
```
