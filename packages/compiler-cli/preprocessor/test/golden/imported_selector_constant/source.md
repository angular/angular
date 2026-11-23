# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "constants.ts",
    "dialog.component.ts",
    "tooltip.directive.ts",
    "app.component.ts",
    "legacy.component.ts",
    "legacy.module.ts"
  ]
}
```

# /constants.ts
```ts
export const DIALOG_SELECTOR = 'app-dialog';
const TOOLTIP_PREFIX = 'app';
export const TOOLTIP_SELECTOR = `[${TOOLTIP_PREFIX}Tooltip]`;
export const LEGACY_SELECTOR = 'legacy-widget';
```

# /dialog.component.ts
```ts
import { Component } from '@angular/core';
import { DIALOG_SELECTOR } from './constants';

@Component({
  selector: DIALOG_SELECTOR,
  template: '<p>Dialog</p>',
})
export class DialogComponent {}
```

# /tooltip.directive.ts
```ts
import { Directive } from '@angular/core';
import { TOOLTIP_SELECTOR } from './constants';

@Directive({
  selector: TOOLTIP_SELECTOR,
})
export class TooltipDirective {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { TooltipDirective } from './tooltip.directive';

@Component({
  selector: 'app-root',
  template: '<app-dialog appTooltip></app-dialog>',
  imports: [DialogComponent, TooltipDirective],
})
export class AppComponent {}
```

# /legacy.component.ts
```ts
import { Component } from '@angular/core';
import { LEGACY_SELECTOR } from './constants';

@Component({
  selector: LEGACY_SELECTOR,
  template: '<span>Legacy</span>',
  standalone: false,
})
export class LegacyWidget {}

@Component({
  selector: 'legacy-host',
  template: '<legacy-widget></legacy-widget>',
  standalone: false,
})
export class LegacyHost {}
```

# /legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyHost, LegacyWidget } from './legacy.component';

@NgModule({
  declarations: [LegacyWidget, LegacyHost],
})
export class LegacyModule {}
```
