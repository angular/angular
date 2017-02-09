This folder contains the dgeni templates that are used to generate the API docs

Generally there is a template for each docType. Templates can extend and/or include
other templates. Templates can also import macros from other template files.

# Template inheritance

When extending a template, parent must declare blocks that can be overridden by the
child. The template extension hierarchy looks like this (with declared blocks in parentheses):

- layout/base.template.html (base)
  - module.template.html
  - layout/api-base.template.html (jumpNav, jumpNavLinks, whatItDoes, infoBar, securityConsiderations, deprecationNotes, howToUse, details)
    - class.template.html
      - directive.template.html
      - enum.template.html
    - var.template.html
      - const.template.html
      - let.template.html
    - decorator.template.html
    - function.template.html
    - interface.template.html
      - type-alias.template.html
    - pipe.template.html

# Doc Properties

It is useful to know what properties are available on each doc type when working with the templates.
Here is an overview:

## class

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented
- members

## directive

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented
- members

## enum

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## var

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## const

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## let

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## decorator

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented
- members

## function

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## interface

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented
- members

## type-alias

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

## pipe

- docType
- name
- id
- moduleDoc
- path
- description
- notYetDocumented

