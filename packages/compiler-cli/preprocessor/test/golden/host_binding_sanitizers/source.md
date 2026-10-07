# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["host_binding_sanitizers.ts"]
}
```

# /host_binding_sanitizers.ts

```ts
import { Component, Directive, HostBinding } from '@angular/core';

// A directive's host bindings do not necessarily run against an element named by its own
// selector: host directives and dynamically created root components (whose host TNode is
// named `#host`) both apply a directive to an element the selector never mentions. The
// security context therefore has to account for every element the property could land on.

// `href` is a URL on `<a>`/`<area>` but a RESOURCE_URL on `<base>`/`<link>`, so the sanitizer
// has to be picked at runtime from the concrete host: `ɵɵsanitizeUrlOrResourceUrl`.
@Directive({
  selector: 'a[ambiguousUrlDir]',
  host: {
    '[href]': 'evil',
  },
})
export class AmbiguousUrlDir {
  evil = 'evil';
}

// Same for `src`: a URL on `<img>`/`<video>`, a RESOURCE_URL on `<embed>`/`<frame>`/`<iframe>`.
@Directive({
  selector: 'iframe[ambiguousResourceUrlDir]',
  host: {
    '[src]': 'evil',
  },
})
export class AmbiguousResourceUrlDir {
  evil = 'evil';
}

// `data` is a RESOURCE_URL only on `<object>` and inert everywhere else. The declaring
// selector names no element that carries it, but the concrete host still might, so this also
// has to defer to `ɵɵsanitizeUrlOrResourceUrl`.
@Directive({
  selector: 'safe-data-carrier',
  host: {
    '[attr.data]': 'evil',
  },
})
export class AmbiguousAttributeDir {
  evil = 'evil';
}

// Properties whose only non-inert context is a single non-URL one keep their dedicated
// sanitizer: `srcdoc` is HTML on `<iframe>`, `innerHtml` is HTML everywhere, `style` is STYLE
// everywhere.
@Directive({
  selector: 'safe-srcdoc-carrier',
  host: {
    '[attr.srcdoc]': 'evil',
    '[innerHtml]': 'evil',
    '[attr.style]': 'evil',
  },
})
export class UnambiguousDir {
  evil = 'evil';
}

// `xlink:href` is a URL on `<a>` and on every MathML element, and inert elsewhere. A
// URL-or-inert union is still ambiguous, so it also has to defer to the runtime sanitizer.
@Directive({
  selector: 'safe-xlink-carrier',
  host: {
    '[attr.xlink:href]': 'evil',
  },
})
export class AmbiguousXlinkDir {
  evil = 'evil';
}

// Negative control: `formAction` is a URL on *every* element, so its union is unambiguous and
// it must keep the plain `ɵɵsanitizeUrl`. This pins that ambiguous-context handling does not
// blanket-upgrade every URL binding to `ɵɵsanitizeUrlOrResourceUrl`.
@Directive({
  selector: '[unambiguousUrlDir]',
  host: {
    '[formAction]': 'evil',
  },
})
export class UnambiguousUrlDir {
  evil = 'evil';
}

// The `@HostBinding` decorator spelling and the `attr.` spelling of an ambiguous property must
// resolve identically to the `host: {...}` property spelling above.
@Directive({
  selector: '[decoratedDir]',
  host: {
    '[attr.href]': 'evil',
  },
})
export class DecoratedHostBindingDir {
  evil = 'evil';

  @HostBinding('src')
  get srcBinding() {
    return this.evil;
  }
}

// `attributeName` drives SVG animation elements. Because the concrete host is unknown, every
// directive binding to it now emits `ɵɵvalidateAttribute` — which rejects the binding at
// runtime — regardless of the element its selector names.
@Directive({
  selector: 'safe-animation-carrier',
  host: {
    '[attr.attributeName]': 'evil',
  },
})
export class ValidatedAttributeDir {
  evil = 'evil';
}

// A property that is inert on every element gets no sanitizer at all.
@Directive({
  selector: '[plainDir]',
  host: {
    '[title]': 'safe',
  },
})
export class PlainDir {
  safe = 'safe';
}

// Guard: none of the above may leak into *template* bindings. There the element is known, so
// `<a [href]>` keeps the plain `ɵɵsanitizeUrl` and `[attr.sandbox]` on a `<div>` needs no
// sanitizer at all. If host-binding context resolution ever started applying to templates,
// these two lines would change.
@Component({
  selector: 'template-bindings',
  standalone: true,
  template: `<a [href]="evil"></a><div [attr.sandbox]="evil"></div>`,
})
export class TemplateBindingsCmp {
  evil = 'evil';
}
```
