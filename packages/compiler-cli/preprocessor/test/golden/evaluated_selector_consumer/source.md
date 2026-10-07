# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts", "legacy.ts"]
}
```

# /selectors.ts
```ts
export const HIGHLIGHT_SELECTOR = '[highlight]';
export const CARD_SELECTOR = 'app-card';
export const BADGE_SELECTOR = '[badge]';
export const LEGACY_SELECTOR = 'legacy-item';
```

# /highlight.ts
```ts
import { Directive, Input } from '@angular/core';
import { HIGHLIGHT_SELECTOR } from './selectors';

@Directive({ selector: HIGHLIGHT_SELECTOR })
export class Highlight {
  @Input() highlight = '';
}
```

# /card.ts
```ts
import { Component } from '@angular/core';
import { CARD_SELECTOR } from './selectors';

@Component({ selector: CARD_SELECTOR, template: '<ng-content />' })
export class Card {}
```

# /app.ts
```ts
import { Component, Directive } from '@angular/core';
import { Card } from './card';
import { Highlight } from './highlight';
import { BADGE_SELECTOR } from './selectors';

// Declared next to its consumer, with a selector from another file.
@Directive({ selector: BADGE_SELECTOR })
export class Badge {}

// Every dependency takes its selector from an imported constant. The consumer has to see the
// evaluated selector to match them in its template.
@Component({
  selector: 'app-root',
  template: '<app-card><p [highlight]="color" badge>hi</p></app-card>',
  imports: [Card, Highlight, Badge],
})
export class App {
  color = 'yellow';
}
```

# /legacy.ts
```ts
import { Component, NgModule } from '@angular/core';
import { LEGACY_SELECTOR } from './selectors';

// The same through an NgModule's compilation scope.
@Component({ selector: LEGACY_SELECTOR, template: 'item', standalone: false })
export class LegacyItem {}

@Component({ selector: 'legacy-list', template: '<legacy-item />', standalone: false })
export class LegacyList {}

@NgModule({ declarations: [LegacyItem, LegacyList] })
export class LegacyModule {}
```
