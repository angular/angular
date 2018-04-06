Angular Material comes packaged with Angular CLI schematics to make
creating Material applications easier.

## Install Schematics
Schematics come packaged with Angular Material, so once you have
installed the npm package, they will be available via the Angular CLI.

If you run it will automatically install Angular Material for you
and run the shell schematic.

```
ng add @angular/material
```

## Packaged Schematics
Angular Material has 4 schematics it comes packaged with:

- Material Shell
- Navigation
- Dashboard
- Table

### Shell Schematic
The shell schematic will help you quickly add Material to a new project. 
This schematic will:

- Ensure project depedencies in `package.json`
- Ensure project depedencies in your app module
- Adds Prebuilt or Setup Custom Theme
- Adds Roboto fonts to your index.html
- Apply simple CSS reset to body

```
ng add @angular/material
```

### Navigation Schematic
The navigation schematic will create a new component that includes
a toolbar with the app name and the side nav responsive based on Material
breakpoints.

```
ng generate @angular/material:material-nav
```

### Dashboard Schematic
The dashboard schematic will create a new component that contains
a dynamic grid list of cards.

```
ng generate @angular/material:material-dashboard
```

### Table Schematic
The table schematic will create a new table component pre-configured
with a datasource for sorting and pagination.

```
ng generate @angular/material:material-table
```
