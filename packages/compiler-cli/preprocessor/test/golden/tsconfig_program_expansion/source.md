# /tsconfig.json
```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  },
  "files": ["main.ts"],
  "exclude": ["excluded.ts", "excluded_but_imported.ts"]
}
```

# /main.ts
```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent);
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { ImportedComponent } from './imported';
import { ExcludedButImportedComponent } from './excluded_but_imported';

@Component({
  selector: 'app-root',
  template: '<imported-comp></imported-comp><excluded-but-imported-comp></excluded-but-imported-comp>',
  standalone: true,
  imports: [ImportedComponent, ExcludedButImportedComponent]
})
export class AppComponent {}
```

# /imported.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'imported-comp',
  template: 'imported',
  standalone: true
})
export class ImportedComponent {}
```

# /excluded_but_imported.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'excluded-but-imported-comp',
  template: 'excluded but imported',
  standalone: true
})
export class ExcludedButImportedComponent {}
```

# /excluded.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'excluded-comp',
  template: 'excluded',
  standalone: true
})
export class ExcludedComponent {}
```

# /unrelated.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'unrelated-comp',
  template: 'unrelated',
  standalone: true
})
export class UnrelatedComponent {}
```
