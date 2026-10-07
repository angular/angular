# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts", "component.ts"]
}
```

# /service.ts
```ts
import { Injectable, Inject, InjectionToken } from '@angular/core';

export const DATA_TOKEN = new InjectionToken<Record<string, unknown>>('DATA_TOKEN');

export interface RouteTemplate {
  path: string;
}

@Injectable({ providedIn: 'root' })
export class StaticDataProvider {
  constructor(
    public route: RouteTemplate,
    public inputs: Record<string, unknown> = {},
    public config?: Partial<StaticDataProvider>,
  ) {}
}

@Injectable({ providedIn: 'root' })
export class InjectRecordService {
  constructor(
    @Inject(DATA_TOKEN) public inputs: Record<string, unknown>,
  ) {}
}

@Injectable({ providedIn: 'root' })
export class GlobalValueInjectService {
  constructor(
    public window: Window,
    public reader: FileReader,
  ) {}
}

declare namespace Gtag {
  interface Gtag {}
}

@Injectable({ providedIn: 'root' })
export class AmbientNamespaceInjectService {
  constructor(
    public gtag: Gtag.Gtag,
  ) {}
}
```

# /component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-record',
  template: '<div>Record Component</div>',
  standalone: true,
})
export class RecordComponent {
  constructor(public inputs: Record<string, unknown>) {}
}
```
