# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.component.ts",
    "shared.ts",
    "icons.ts",
    "button.component.ts",
    "card.component.ts",
    "feature.module.ts",
    "barrel.ts",
    "other.ts"
  ]
}
```

# /button.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: '<button><ng-content></ng-content></button>',
})
export class ButtonComponent {}
```

# /card.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: '<div><ng-content></ng-content></div>',
})
export class CardComponent {}
```

# /icons.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: '<i>icon</i>',
})
export class IconComponent {}
```

# /shared.ts
```ts
import { ButtonComponent } from './button.component';
import { CardComponent } from './card.component';

export const SHARED_COMPONENTS = [ButtonComponent, CardComponent];
```

# /other.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'other-unused',
  standalone: true,
  template: '',
})
export class OtherUnusedComponent {}
```

# /barrel.ts
```ts
export * from './other';
import { Component } from '@angular/core';

@Component({
  selector: 'app-barrel-item',
  standalone: true,
  template: '<span>Barrel</span>',
})
export class BarrelItemComponent {}
```

# /feature.module.ts
```ts
import { NgModule, Component } from '@angular/core';

@Component({
  selector: 'app-feature-inner',
  template: '<p>Feature Inner</p>',
})
export class FeatureInnerComponent {}

@NgModule({
  declarations: [FeatureInnerComponent],
  exports: [FeatureInnerComponent],
})
export class FeatureModule {}
```

# /app.component.ts
```ts
import { Component, Directive } from '@angular/core';
import { SHARED_COMPONENTS } from './shared';
import * as icons from './icons';
import { BarrelItemComponent } from './barrel';
import { FeatureModule } from './feature.module';

@Directive({
  selector: '[appLocalDir]',
  standalone: true,
})
export class LocalDirective {}

const LOCAL_DIRECTIVES = [LocalDirective];
const MWP = { ngModule: FeatureModule, providers: [] };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SHARED_COMPONENTS,
    ...LOCAL_DIRECTIVES,
    MWP,
    icons.IconComponent,
    BarrelItemComponent,
  ],
  template: `
    <app-button appLocalDir>Click</app-button>
    <app-card>Card</app-card>
    <app-icon></app-icon>
    <app-barrel-item></app-barrel-item>
    <app-feature-inner></app-feature-inner>
  `,
})
export class AppComponent {}
```
