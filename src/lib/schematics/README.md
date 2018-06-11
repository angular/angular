# Angular Material Schematics
A collection of Schematics for Angular Material.

## Collection

### Install
Adds Angular Material and its depedencies and pre-configures the application. 

- Adds Material and CDK to `package.json`
- Adds Material Icons Stylesheet to `index.html`
- Adds Roboto Font to `index.html`
- Ensure `BrowserAnimationsModule` is installed and included in root module
- Adds pre-configured theme to `.angular.json` file OR adds custom theme scaffolding to `styles.scss`

Command: `ng add @angular/material`
 
### Dashboard
Creates a responive card grid list component.

Command: `ng g @angular/material:dashboard my-dashboard`

### Nav
Creates a navigation component with a responsive sidenav.

Command: `ng g @angular/material:nav my-nav`

### Table
Creates a table component with sorting and paginator.

Command: `ng g @angular/material:table my-table`
