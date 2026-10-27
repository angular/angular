# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["lazy.ts", "app.ts"]
}
```

# /lazy.ts
```ts
import {Directive, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myPipe',
})
export class MyPipe implements PipeTransform {
  transform(v: string): string {
    return v;
  }
}

@Directive({
  selector: '[dirA]',
})
export class DirA {}

@Directive({
  selector: '[dirB]',
})
export class DirB {}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyPipe, DirA, DirB} from './lazy';

@Component({
  selector: 'app-comp',
  imports: [MyPipe, DirA, DirB],
  template: '@defer { <div dirB dirA>{{ "hi" | myPipe }}</div> }',
})
export class AppComp {}
```
