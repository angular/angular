# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.ts"]
}
```

# /my-pipe.d.ts
```ts
import * as i0 from '@angular/core';

export declare class MyDtsPipe {
  transform(value: string): string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<MyDtsPipe, "dtsPipe", false>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyDtsPipe} from './my-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyDtsPipe],
  template: '{{ "hello" | dtsPipe }}'
})
export class AppComponent {}
```
