# Error Handling

## SSR Error Boundaries

```typescript
// error-handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class SsrError implements ErrorHandler {
  #platformId = inject(PLATFORM_ID);

  handleError(error: Error) {
    if (isPlatformServer(this.#platformId)) {
      // Log server errors
      console.error('SSR Error:', error);
      // Could send to monitoring service
    } else {
      // Client-side error handling
      console.error('Client Error:', error);
    }
  }
}

// Provide in app.config.ts
{ provide: ErrorHandler, useClass: SsrError }
```

## Graceful Degradation

```typescript
@Component({
  template: `
    @if (dataError()) {
      <!-- Fallback content that works without data -->
      <app-fallback-content />
    } @else {
      <app-data-content [data]="data()" />
    }
  `,
})
export class PageCmpt {
  #dataService = inject(Data);

  data = signal<Data | null>(null);
  dataError = signal(false);

  constructor() {
    this.#loadData();
  }

  async #loadData() {
    try {
      const data = await this.#dataService.getData();
      this.data.set(data);
    } catch {
      this.dataError.set(true);
    }
  }
}
```
