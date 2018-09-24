Angular Material comes packaged with Angular CLI schematics to make
creating Material applications easier.

### Install Schematics
Schematics are included with both `@angular/cdk` and `@angular/material`. Once you install the npm
packages, they will be available through the Angular CLI.

Using the command below will install Angular Material, the [Component Dev Kit](https://material.angular.io/cdk) (CDK),
and [Angular Animations](https://angular.io/guide/animations) in your project. Then it will run the
install schematic.

```
ng add @angular/material
```

The install schematic will help you add Material to a new project. 
This schematic will:

- Ensure [project dependencies](./getting-started#step-1-install-angular-material-angular-cdk-and-angular-animations) are placed in `package.json`
- Enable the [BrowserAnimationsModule](./getting-started#step-2-configure-animations) your app module
- Add either a [prebuilt theme](./theming#using-a-pre-built-theme) or a [custom theme](./theming#defining-a-custom-theme)
- Add Roboto fonts to your index.html
- Add the [Material Icon font](./getting-started#step-6-optional-add-material-icons) to your index.html
- Add global styles to
  - Remove margins from `body`
  - Set `height: 100%` on `html` and `body`
  - Make Roboto the default font of your app
- Install and import `hammerjs` for [touch gesture support](./getting-started#step-5-gesture-support) in your project

## Generator Schematics
In addition to the install schematic, Angular Material has three schematics it comes packaged with:

- Navigation
- Dashboard
- Table

### Navigation Schematic
The navigation schematic will create a new component that includes
a toolbar with the app name and a responsive side nav based on Material
breakpoints.

```
ng generate @angular/material:material-nav --name <component-name>
```

### Dashboard Schematic
The dashboard schematic will create a new component that contains
a dynamic grid list of cards.

```
ng generate @angular/material:material-dashboard --name <component-name>
```

### Table Schematic
The table schematic will create a new table component pre-configured
with a datasource for sorting and pagination.

```
ng generate @angular/material:material-table --name <component-name>
```
