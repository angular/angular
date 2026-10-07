# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "named.component.ts", "split.component.ts", "a.ts", "b.ts"]
}
```

# /a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'widget-a',
  template: 'Widget A',
  standalone: true
})
export class Widget {}
```

# /b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'widget-b',
  template: 'Widget B',
  standalone: true
})
export class Widget {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './a';
import { Widget as WidgetB } from './b';

// An eager `Widget` from `./a` alongside a distinct deferred `Widget` from `./b` (array form).
@Component({
  selector: 'app-root',
  template: `
    <widget-a/>
    @defer {
      <widget-b/>
    } @placeholder {
      Placeholder
    }
  `,
  standalone: true,
  imports: [Widget],
  deferredImports: [WidgetB]
})
export class AppComponent {}
```

# /named.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './a';
import { Widget as WidgetB } from './b';

// The same pairing through a named block.
@Component({
  selector: 'app-mixed',
  template: `
    <widget-a/>
    @defer (name lazy) {
      <widget-b/>
    } @placeholder {
      Placeholder
    }
  `,
  standalone: true,
  imports: [Widget],
  deferredImports: {
    lazy: [WidgetB],
  },
})
export class MixedComponent {}
```

# /split.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './a';
import { Widget as WidgetB } from './b';

// Two distinct deferred `Widget`s, each loaded by its own named block.
@Component({
  selector: 'app-split',
  template: `
    @defer (name first) {
      <widget-a/>
    }
    @defer (name second) {
      <widget-b/>
    }
  `,
  standalone: true,
  deferredImports: {
    first: [Widget],
    second: [WidgetB],
  },
})
export class SplitComponent {}
```
