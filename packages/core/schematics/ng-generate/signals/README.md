# Combined signals migration

Combines all signal-related migrations into a single migration. It includes the following migrations:
* Converting `@Input` to the signal-based `input`. [See documentation](https://github.com/angular/angular/blob/main/packages/core/schematics/ng-generate/signal-input-migration/README.md).
* Converting `@ViewChild`/`@ViewChildren` and `@ContentChild`/`@ContentChildren` to
`viewChild`/`viewChildren` and `contentChild`/`contentChildren`. [See documentation](https://github.com/angular/angular/blob/main/packages/core/schematics/ng-generate/signal-input-migration/README.md).

The primary use case for this migration is to offer developers interested in switching to signals a
single entrypoint from which they can do so.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:signals
```
