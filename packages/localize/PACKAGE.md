The `@angular/localize` package contains helpers and tools for localizing your application.

You should install this package using `ng add @angular/localize` if you need to tag text in your
application that you want to be translatable.

The approach is based around the concept of tagging strings in code with a [template literal tag handler][tagged-templates]
called `$localize`. The idea is that strings that need to be translated are “marked” using this tag:

```ts
const message = $localize`Hello, World!`;
```

---

This `$localize` identifier can be a real function that can do the translation at runtime, in the browser.
But, significantly, it is also a global identifier that survives minification.
This means it can act simply as a marker in the code that a static post-processing tool can use to replace
the original text with translated text before the code is deployed.

For example, the following code:

```ts
warning = $localize`${this.process} is not right`;
```

could be replaced with:

```ts
warning = "" + this.process + ", n'est pas bon.";
```

The result is that all references to `$localize` are removed, and there is **zero runtime cost** to rendering
the translated text.

---

The Angular template compiler also generates `$localize` tagged strings rather than doing the translation itself.
For example, the following template:

```html
<h1 i18n>Hello, World!</h1>
```

would be compiled to something like:

```ts
ɵɵelementStart(0, "h1"); //  <h1>
ɵɵi18n(1, $localize`Hello, World!`); //  Hello, World!
ɵɵelementEnd(); //  </h1>
```

This means that after the Angular compiler has completed its work, all the template text marked with `i18n`
attributes have been converted to `$localize` tagged strings, which can be processed just like any other
tagged string.

[tagged-templates]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates
