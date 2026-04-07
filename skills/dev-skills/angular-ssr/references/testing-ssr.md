# Testing SSR

## Test Server Rendering

```typescript
import { renderApplication } from '@angular/platform-server';
import { App } from './app.component';
import { config } from './app.config.server';

describe('SSR', () => {
  it('should render home page', async () => {
    const html = await renderApplication(App, {
      appId: 'my-app',
      providers: config.providers,
      url: '/',
    });

    expect(html).toContain('<h1>Welcome</h1>');
    expect(html).toContain('</app-root>');
  });

  it('should render product page with data', async () => {
    const html = await renderApplication(App, {
      appId: 'my-app',
      providers: config.providers,
      url: '/products/123',
    });

    expect(html).toContain('Product Name');
    expect(html).not.toContain('Loading...');
  });
});
```

## Test Hydration

```typescript
import { TestBed } from '@angular/core/testing';
import { provideClientHydration } from '@angular/platform-browser';

describe('Hydration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideClientHydration()],
    });
  });

  it('should hydrate without errors', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // No hydration mismatch errors should be thrown
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```
