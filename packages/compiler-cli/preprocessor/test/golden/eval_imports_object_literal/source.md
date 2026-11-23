# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "app.component.ts", "shared.module.ts", "shared.component.ts"]
}
```

# /shared.component.ts
```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-shared',
  template: '<span>Shared</span>',
  standalone: false,
})
export class SharedComponent {
  @Input() label!: string;
}
```

# /shared.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedComponent } from './shared.component';

@NgModule({
  declarations: [SharedComponent],
  exports: [SharedComponent],
})
export class SharedModule {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<lib-shared [label]="123"></lib-shared>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SharedModule } from './shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [{ ngModule: SharedModule }],
})
export class AppModule {}
```
