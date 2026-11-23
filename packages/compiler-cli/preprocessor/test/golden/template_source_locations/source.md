# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "enableTemplateSourceLocations": true
  },
  "files": ["inline.component.ts", "external.component.ts"]
}
```

# /inline.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'inline-cmp',
  template: `
    <section>
      <h1>Title</h1>
      <p>Body <span>text</span></p>
    </section>
    @if (show) {
      <button>Go</button>
    }
  `,
})
export class InlineCmp {
  show = true;
}
```

# /external.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'external-cmp',
  templateUrl: './external.component.html',
})
export class ExternalCmp {}
```

# /external.component.html
```html
<div>
  <span>external</span>
</div>
```
