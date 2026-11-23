# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "app.component.ts", "widget.module.ts", "widget.component.ts"]
}
```

# /widget.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-widget',
  template: '<span>Widget</span>',
  standalone: false,
})
export class WidgetComponent {}
```

# /widget.module.ts
```ts
import { NgModule } from '@angular/core';
import { WidgetComponent } from './widget.component';

@NgModule({
  declarations: [WidgetComponent],
  exports: [WidgetComponent],
})
export class WidgetModule {}

export class WidgetProviders {
  static forRoot() {
    return { ngModule: WidgetModule, providers: [] };
  }
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<lib-widget></lib-widget>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { WidgetProviders } from './widget.module';

@NgModule({
  declarations: [AppComponent],
  imports: [WidgetProviders.forRoot()],
})
export class AppModule {}
```
