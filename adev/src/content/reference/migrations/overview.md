# Migrations

Learn about how you can migrate your existing angular project to the latest features incrementally.

<docs-card-container>
  <docs-card title="Standalone" link="Migrate now" href="reference/migrations/standalone">
    Standalone components provide a simplified way to build Angular applications. Standalone components specify their dependencies directly instead of getting them through NgModules.
    
    Standalone components, directives, and pipes aim to streamline the authoring experience by reducing the need for NgModules.
  </docs-card>
  <docs-card title="`ModuleWithProviders`" link="Migrate now" href="reference/migrations/module-with-providers">
    ModuleWithProviders has been optional since Angular version 7. But with Ivy the metadata present in metadata.json is no longer required, instead Ivy relies on the generic type for ModuleWithProviders to get the correct type information. 
   
    Angular version 9 deprecates ModuleWithProviders without a generic type. A future version of Angular will remove the default generic type, making an explicit type required.
  </docs-card>
  <docs-card title="Typed Forms" link="Migrate now" href="reference/migrations/typed-forms">
    In previous Angular versions, most of the Form APIs included `any` somewhere in their types, and interacting with the structure of the controls, or the values themselves, was not type-safe.

    Strictly typed reactive forms add type safety and the types enable a variety of other improvements, such as better autocomplete in IDEs, and an explicit way to specify form structure.
  </docs-card>
    <docs-card title="Control Flow Syntax" link="Migrate now" href="reference/migrations/control-flow">
    Control Flow Syntax is available with Angular 17 release and allows you to use more ergonomic syntax which is close to javascript, better type checking and lazy load part of the component. It replaces the need to imports CommonModule to use functionalities like *ngFor,`*ngIf. 
  </docs-card>
</docs-card-container>
