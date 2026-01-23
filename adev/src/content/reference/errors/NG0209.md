# Invalid multi provider

The Angular runtime will throw this error when it injects a token intended to be used with `multi: true` but
a non-Array was found instead. For example, `ENVIRONMENT_INITIALIZER` should be provided
like `{provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => {...}}`.
