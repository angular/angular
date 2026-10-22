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
  template: '<button><ng-content></ng-content></button>',
})
export class ButtonComponent {}
```

# /card.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: '<div><ng-content></ng-content></div>',
})
export class CardComponent {}
```

# /icons.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
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
  standalone: false,
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
})
export class LocalDirective {}

const LOCAL_DIRECTIVES = [LocalDirective];

@Component({
  selector: 'app-root',
  imports: [
    SHARED_COMPONENTS,
    ...LOCAL_DIRECTIVES,
    FeatureModule,
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
