# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts", "config.ts", "app.component.ts"]
}
```

# /config.ts
```ts
export interface LoggerConfig {
  level: string;
}

export type LogFormat = 'json' | 'text';

export class Logger {
  log(msg: string) {}
}
```

# /service.ts
```ts
import { Injectable, Inject } from '@angular/core';
import { LoggerConfig, LogFormat, Logger } from './config';

// Local interface — type-only, no runtime value
interface LocalConfig {
  debug: boolean;
}

const LOGGER_CONFIG = 'LOGGER_CONFIG';

// Service with all type-only params → deps: 'invalid'
@Injectable({ providedIn: 'root' })
export class InvalidDepsService {
  constructor(private config: LoggerConfig) {}
}

// Service with @Inject override on type-only param → deps: valid
@Injectable({ providedIn: 'root' })
export class InjectOverrideService {
  constructor(@Inject(LOGGER_CONFIG) private config: LoggerConfig) {}
}

// Service with class param → deps: valid
@Injectable({ providedIn: 'root' })
export class ValidDepsService {
  constructor(private logger: Logger) {}
}

// Service with local interface param → deps: 'invalid'
@Injectable({ providedIn: 'root' })
export class LocalInterfaceService {
  constructor(private config: LocalConfig) {}
}

// Service with mixed params (one type-only) → deps: 'invalid'
@Injectable({ providedIn: 'root' })
export class MixedDepsService {
  constructor(private logger: Logger, private format: LogFormat) {}
}
```

# /types.ts
```ts
export interface MyType {
  id: string;
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { MyType } from './types';

@Component({
  selector: 'app-root',
  template: '<div>Hello</div>',
  standalone: true,
})
export class AppComponent {
  constructor(private myType: MyType) {}
}
```
