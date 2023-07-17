This folder contains the dgeni templates that are used to generate the API docs

Generally there is a template for each docType. Templates can extend and/or include
other templates. Templates can also import macros from other template files.

# Template inheritance

When extending a template, parent must declare blocks that can be overridden by the
child. The template extension hierarchy looks like this (with declared blocks in parentheses):

- layout/base.template.html (bread-crumbs, header, embedded contents and body)
  - package.template.html
  - export-base.template.html (short-description, security-notes, deprecation, overview, see-also, details, usageNotes)
    - class.template.html
      - directive.template.html
    - enum.template.html
    - var.template.html
      - const.template.html
      - let.template.html
    - decorator.template.html
    - function.template.html
    - interface.template.html
      - value-module.template.html
    - type-alias.template.html
    - pipe.template.html
    - ngmodule.template.html

# Doc Properties

It is useful to know what properties are available on each doc type when working with the templates.
The `typescript` Dgeni package is now written in TypeScript and there is a class for each of the types of
API document. See https://github.com/angular/dgeni-packages/tree/master/typescript/src/api-doc-types.
This is a good place to go to see what properties you can use in the templates.