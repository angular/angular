# Standalone migration
`ng generate` schematic that helps users to convert an application to `standalone` components,
directives and pipes. The migration can be run with `ng generate @angular/core:standalone` and it
has the following options:

* `mode` - Configures the mode that migration should run in. The different modes are clarified
further down in this document.
* `path` - Relative path within the project that the migration should apply to. Can be used to
migrate specific sub-directories individually. Defaults to the project root.

## Migration flow
The standalone migration involves multiple distinct operations, and as such has to be run multiple
times. Authors should verify that the app still works between each of the steps. If the application
is large, it can be easier to use the `path` option to migrate specific sub-sections of the app
individually.

**Note:** The schematic often needs to generate new code or copy existing code to different places.
This means that likely the formatting won't match your app anymore and there may be some lint
failures. The application should compile, but it's expected that the author will fix up any
formatting and linting failures.

An example migration could look as follows:
1. `ng generate @angular/core:standalone`.
2. Select the "Convert all components, directives and pipes to standalone" option.
3. Verify that the app works and commit the changes.
4. `ng generate @angular/core:standalone`.
5. Select the "Remove unnecessary NgModule classes" option.
6. Verify that the app works and commit the changes.
7. `ng generate @angular/core:standalone`.
8. Select the "Bootstrap the application using standalone APIs" option.
9. Verify that the app works and commit the changes.
10. Run your linting and formatting checks, and fix any failures. Commit the result.

## Migration modes
The migration is made up the following modes that are intended to be run in the order they are
listed in:
1. Convert declarations to standalone.
2. Remove unnecessary NgModules.
3. Switch to standalone bootstrapping API.

### Convert declarations to standalone
In this mode, the migration will find all of the components, directives and pipes, and convert them
to standalone by removing `standalone: false` and adding any dependencies to the `imports` array.

**Note:** NgModules which bootstrap a component are explicitly ignored in this step, because they
are likely to be root modules and they would have to be bootstrapped using `bootstrapApplication`
instead of `bootstrapModule`. Their declarations will be converted automatically as a part of the
"Switch to standalone bootstrapping API" step.

**Before:**
```typescript
// app.module.ts
@NgModule({
  imports: [CommonModule],
  declarations: [MyComp, MyDir, MyPipe]
})
export class AppModule {}
```

```typescript
// my-comp.ts
@Component({
  selector: 'my-comp',
  template: '<div my-dir *ngIf="showGreeting">{{ "Hello" | myPipe }}</div>',
  standalone: false,
})
export class MyComp {
  public showGreeting = true;
}
```

```typescript
// my-dir.ts
@Directive({selector: '[my-dir]', standalone: false})
export class MyDir {}
```

```typescript
// my-pipe.ts
@Pipe({name: 'myPipe', pure: true, standalone: false})
export class MyPipe {}
```

**After:**
```typescript
// app.module.ts
@NgModule({
  imports: [CommonModule, MyComp, MyDir, MyPipe]
})
export class AppModule {}
```

```typescript
// my-comp.ts
@Component({
  selector: 'my-comp',
  template: '<div my-dir *ngIf="showGreeting">{{ "Hello" | myPipe }}</div>',
  imports: [NgIf, MyDir, MyPipe]
})
export class MyComp {
  public showGreeting = true;
}
```

```typescript
// my-dir.ts
@Directive({selector: '[my-dir]'})
export class MyDir {}
```

```typescript
// my-pipe.ts
@Pipe({name: 'myPipe', pure: true})
export class MyPipe {}
```

### Remove unnecessary NgModules
After converting all declarations to standalone, a lot of NgModules won't be necessary anymore!
This step identifies such modules and deletes them, including as many references to them, as
possible. If a module reference can't be deleted automatically, the migration will leave a TODO
comment saying `TODO(standalone-migration): clean up removed NgModule reference manually` so that
the author can delete it themselves.

A module is considered "safe to remove" if it:
* Has no `declarations`.
* Has no `providers`.
* Has no `bootstrap` components.
* Has no `imports` that reference a `ModuleWithProviders` symbol or a module that can't be removed.
* Has no class members. Empty constructors are ignored.

**Before:**
```typescript
// importer.module.ts

@NgModule({
  imports: [FooComp, BarPipe],
  exports: [FooComp, BarPipe]
})
export class ImporterModule {}
```

```typescript
// configurer.module.ts
import {ImporterModule} from './importer.module';

console.log(ImporterModule);

@NgModule({
  imports: [ImporterModule],
  exports: [ImporterModule],
  providers: [{provide: FOO, useValue: 123}]
})
export class ConfigurerModule {}
```

```typescript
// index.ts
export {ImporterModule, ConfigurerModule} from './modules/index';
```

**After:**
```typescript
// importer.module.ts
// Deleted!
```

```typescript
// configurer.module.ts
console.log(/* TODO(standalone-migration): clean up removed NgModule reference manually */ ImporterModule);

@NgModule({
  imports: [],
  exports: [],
  providers: [{provide: FOO, useValue: 123}]
})
export class ConfigurerModule {}
```

```typescript
// index.ts
export {ConfigurerModule} from './modules/index';
```

### Switch to standalone bootstrapping API
Converts any usages of the old `bootstrapModule` API to the new `bootstrapApplication`. To do this
in a safe way, the migration has to make the following changes to the application's code:
1. Generate the `bootstrapApplication` call to replace the `bootstrapModule` one.
2. Convert the `declarations` of the module that is being bootstrapped to `standalone`. These
modules were skipped explicitly in the first step of the migration.
3. Copy any `providers` from the bootstrapped module into the `providers` option of
`bootstrapApplication`.
4. Copy any classes from the `imports` array of the rootModule to the `providers` option of
`bootstrapApplication` and wrap them in an `importsProvidersFrom` function call.
5. Adjust any dynamic import paths so that they're correct when they're copied over.
6. If an API with a standalone equivalent is detected, it may be converted automatically as well.
E.g. `RouterModule.forRoot` will become `provideRouter`.
7. Remove the root module.

If the migration detects that the `providers` or `imports` of the root module are referencing code
outside of the class declaration, it will attempt to carry over as much of it as it can to the new
location. If some of that code is exported, it will be imported in the new location, otherwise it
will be copied over.

**Before:**
```typescript
// ./app/app.module.ts
import {NgModule, InjectionToken} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component.ts';
import {SharedModule} from './shared.module';
import {ImportedInterface} from './some-interface';
import {CONFIG} from './config';

interface NonImportedInterface {
  foo: any;
  baz: ImportedInterface;
}

const token = new InjectionToken<NonImportedInterface>('token');

export class ExportedConfigClass {}

@NgModule({
  imports: [
    SharedModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([{
      path: 'shop',
      loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent)
    }], {
      initialNavigation: 'enabledBlocking'
    })
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {provide: token, useValue: {foo: true, bar: {baz: false}}},
    {provide: CONFIG, useClass: ExportedConfigClass}
  ]
})
export class AppModule {}
```

```typescript
// ./app/app.component.ts
@Component({selector: 'app', template: 'hello', standalone: false})
export class AppComponent {}
```

```typescript
// ./main.ts
import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app/app.module';

platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
```

**After:**
```typescript
// ./app/app.module.ts
import {NgModule, InjectionToken} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component.ts';
import {SharedModule} from '../shared/shared.module';
import {ImportedInterface} from './some-interface';
import {CONFIG} from './config';

interface NonImportedInterface {
  foo: any;
  bar: ImportedInterface;
}

const token = new InjectionToken<NonImportedInterface>('token');

export class ExportedConfigClass {}
```

```typescript
// ./app/app.component.ts
@Component({selector: 'app', template: 'hello'})
export class AppComponent {}
```

```typescript
// ./main.ts
import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
import {InjectionToken, importProvidersFrom} from '@angular/core';
import {withEnabledBlockingInitialNavigation, provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {AppModule, ExportedConfigClass} from './app/app.module';
import {AppComponent} from './app/app.component';
import {CONFIG} from './app/config';
import {SharedModule} from './shared/shared.module';
import {ImportedInterface} from './app/some-interface';

interface NonImportedInterface {
  foo: any;
  bar: ImportedInterface;
}

const token = new InjectionToken<NonImportedInterface>('token');

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(SharedModule),
    {provide: token, useValue: {foo: true, bar: {baz: false}}},
    {provide: CONFIG, useClass: ExportedConfigClass},
    provideAnimations(),
    provideRouter([{
      path: 'shop',
      loadComponent: () => import('./app/shop/shop.component').then(m => m.ShopComponent)
    }], withEnabledBlockingInitialNavigation())
  ]
}).catch(e => console.error(e));
```
