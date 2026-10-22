# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "widget-a.ts", "widget-b.ts", "widget-c.ts"]
}
```

# /widget-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'widget-a',
  template: 'A'
})
export class Widget {}
```

# /widget-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'widget-b',
  template: 'B'
})
export class Widget {}
```

# /widget-c.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'widget-c',
  template: 'C'
})
export class Widget {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './widget-a';
import { Widget as WidgetB } from './widget-b';
import { Widget as WidgetC } from './widget-c';

@Component({
  selector: 'app-root',
  template: `
    <widget-a />

    @defer {
      <widget-b />
    }
  `,
  imports: [Widget, WidgetB, WidgetC]
})
export class AppComponent {}
```
