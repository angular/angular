# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "src/app.ts",
    "src/legacy.ts",
    "src/legacy.module.ts",
    "src/menu.ts",
    "src/tooltip.ts",
    "src/ripple.ts",
    "src/focus.ts"
  ]
}
```

# /src/ripple.ts
```ts
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[ripple]',
  standalone: true,
})
export class Ripple {
  @Input() rippleColor: string = '';
}
```

# /src/tooltip.ts
```ts
import { Directive, Input } from '@angular/core';
import { Ripple } from './ripple';

@Directive({
  selector: '[tooltip]',
  standalone: true,
  hostDirectives: [{ directive: Ripple, inputs: ['rippleColor'] }],
})
export class Tooltip {
  @Input() tooltip: string = '';
}
```

# /src/menu.ts
```ts
import { Component } from '@angular/core';
import { Tooltip } from './tooltip';

@Component({
  selector: 'menu-el',
  standalone: true,
  template: '<ng-content></ng-content>',
  hostDirectives: [{ directive: Tooltip, inputs: ['tooltip: tip'] }],
})
export class Menu {}
```

# /src/focus.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[focusRing]',
  standalone: true,
})
export class FocusRing {}
```

# /src/app.ts
```ts
import { Component } from '@angular/core';
import { FocusRing } from './focus';
import { Menu } from './menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Menu],
  hostDirectives: [FocusRing],
  template:
    '<span tooltip="x" ripple focusRing></span><menu-el [tip]="label"></menu-el>',
})
export class App {
  label = 'hello';
}
```

# /src/legacy.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'legacy-app',
  standalone: false,
  template: '<span tooltip="y" ripple></span><menu-el tip="z"></menu-el>',
})
export class LegacyApp {}
```

# /src/legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyApp } from './legacy';
import { Menu } from './menu';

@NgModule({
  declarations: [LegacyApp],
  imports: [Menu],
})
export class LegacyModule {}
```
