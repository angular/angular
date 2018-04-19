# NoopZoneHelloWorld

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.6.

And this project is for testing `noop zone`.
After `ng new` from `angular cli`, you need the following setup.

- comment `zone.js` import in [polyfills.ts](./src/polyfills.ts).
  ```
    // import 'zone.js/dist/zone';  // Included with Angular CLI.
  ```
- in [main.ts](./src/main.ts), change bootstrap to 
  ```
    platformBrowserDynamic().bootstrapModule(AppModule, {ngZone: 'noop'})
    .catch(err => console.log(err));
  ```
- in [test.ts](./src/test.ts), add `zone.js` import.
  ```
    // because we use noop zone, so we have to import zone here
    import 'zone.js/dist/zone';
    import 'zone.js/dist/zone-testing';
  ```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
