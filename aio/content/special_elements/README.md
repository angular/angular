# Special Elements

Each sub-directory below this contains documentation that describes "special elements".
These are elements that can appear in templates that have special meaning and behaviour in the Angular framework.

Each element should have a markdown file with the same file name as the element's tag name, e.g. `ng-container.md`.
The file should be stored in a directory whose name is that of the Angular package under which this element should appear in the docs (usually `core`).

The file should contain a "short description" of the element (the first paragraph), followed by any "long description" (subsequent paragraphs).

Furthermore, if the element can accept one or more attributes that also have special meaning to Angular, then these should be documented using the `@elementAttribute` tag. The format of this tag is:

```
@elementAttribute attr="value"

Description of the attribute and value.
```
