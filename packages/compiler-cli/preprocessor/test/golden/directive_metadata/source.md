# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive, TemplateRef } from '@angular/core';

class BaseDir {}

@Directive({
  selector: '[fullDir]',
  standalone: true,
  jit: false
})
export class FullDir extends BaseDir {
  constructor(private templateRef: TemplateRef<any>) {
    super();
  }

  ngOnChanges() {}
}

@Directive({
  selector: '[jitDir]',
  jit: true,
  standalone: true
})
export class JitDir {}

@Component({
  selector: 'app-root',
  template: '<div *fullDir></div>',
  standalone: true,
  imports: [FullDir]
})
export class AppComponent {}
```
