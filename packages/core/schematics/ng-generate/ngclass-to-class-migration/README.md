# ngClass to class migration

This schematic helps developers to convert ngClass directive usages to class bindings where possible.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:model-output
```

By default, the migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:ngclass-to-class --path src/app/sub-component
```

### How does it work?

The schematic will attempt to find all the places in the templates where the directive is used and check if it can be converted to `[class]`.

Example:

```html
<!-- Before -->
foo = model<string
  >; fooChange = output<string
    >(); // or `@Output()`

    <!-- After -->
    fooInput = input<string
      >({alias: 'foo') foo = linkedSignal(this.fooInput); fooChange = output<string
        >();
      </string></string
    ></string
  ></string
>
```
