# Accessibility Testing in Angular

Test accessibility compliance with AXE.

## Install axe-core

```bash
npm install -D axe-core
```

## Vitest Example

```typescript
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';

describe('Button accessibility', () => {
  it('should pass axe accessibility checks', async () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Submit');
    fixture.detectChanges();

    const results = await axe.run(fixture.nativeElement);

    expect(results.violations).toEqual([]);
  });
});
```

## Jasmine Example

```typescript
import axe from 'axe-core';

describe('Form accessibility', () => {
  it('should have no accessibility violations', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();

    const results = await axe.run(fixture.nativeElement);

    expect(results.violations.length).toBe(0);
  });
});
```

**Requirements**: All components MUST pass AXE checks and meet WCAG AA standards.
