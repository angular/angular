# Security

Angular treats every bound value as untrusted and sanitizes or escapes it before it reaches the DOM.
Keep untrusted data on that path. Most cross-site scripting (XSS) bugs in Angular apps come from code
that steps around it.

## Rules

- Render user or server data with interpolation (`{{ value }}`) or property bindings. Interpolation
  always escapes HTML.
- Use `[innerHTML]` only when the value must be rendered as HTML. Angular sanitizes it: it removes
  `<script>`, event handler attributes, and `javascript:` URLs, and keeps safe markup such as `<b>`.
- Do not write untrusted values with DOM APIs, such as `ElementRef.nativeElement.innerHTML`,
  `document.write`, or `Renderer2.setProperty(el, 'innerHTML', value)`. They do not sanitize. Prefer a
  template binding. If a DOM API is unavoidable, sanitize first:

  ```ts
  import {inject, SecurityContext} from '@angular/core';
  import {DomSanitizer} from '@angular/platform-browser';

  const sanitizer = inject(DomSanitizer);
  element.innerHTML = sanitizer.sanitize(SecurityContext.HTML, untrustedHtml) ?? '';
  ```

- Never build a template from user input, and never compile templates at runtime with the JIT
  compiler. Angular trusts template code, so this is template injection. Keep the default AOT
  compiler.
- Do not render HTML on the server by concatenating strings or by generating Angular templates with a
  server-side templating language.

## Security contexts

Angular sanitizes according to where a value is bound:

| Context      | Example bindings                                     | Behavior                                                         |
| :----------- | :--------------------------------------------------- | :--------------------------------------------------------------- |
| HTML         | `[innerHTML]`                                        | Sanitized.                                                       |
| URL          | `<a [href]>`, `<form [action]>`                      | Sanitized. Unsafe URLs such as `javascript:` are neutralized.    |
| Resource URL | `<iframe [src]>`, `<embed [src]>`, `<object [data]>` | Cannot be sanitized. Binding an untrusted value throws an error. |
| Style        | `[style]`                                            | Not sanitized. Angular applies the value as CSS.                 |

Angular removes `<script>` elements from templates, so there is no binding into a script.

In development mode, Angular logs a console warning when sanitization changes a value.

## Bypassing sanitization

`DomSanitizer` has five `bypassSecurityTrust*` methods: `bypassSecurityTrustHtml`,
`bypassSecurityTrustScript`, `bypassSecurityTrustStyle`, `bypassSecurityTrustUrl`, and
`bypassSecurityTrustResourceUrl`. They mark a value as safe, so Angular inserts it unchanged.

- Do not call them to silence a sanitization warning or to make removed markup appear. If the value
  can contain attacker-controlled data, this creates an XSS vulnerability.
- Call them only on values the app constructs from trusted parts, and use the method that matches
  the binding's context.
- Validate user input before building the trusted value. For example, embed a video by checking that
  the ID matches the expected format and building the URL yourself:

  ```ts
  import {Component, computed, inject, input} from '@angular/core';
  import {DomSanitizer} from '@angular/platform-browser';

  @Component({
    selector: 'app-video',
    template: `
      @if (videoUrl(); as url) {
        <iframe [src]="url" title="Video"></iframe>
      }
    `,
  })
  export class Video {
    private readonly sanitizer = inject(DomSanitizer);
    readonly videoId = input.required<string>();

    protected readonly videoUrl = computed(() => {
      const id = this.videoId();
      if (!/^[\w-]{11}$/.test(id)) return null;
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
    });
  }
  ```

## Content Security Policy

A Content Security Policy (CSP) is configured by the server, not in Angular code. Angular needs a
nonce to insert its `<style>` elements under a strict `style-src`:

- Set `ngCspNonce` on the root element (`<app-root ngCspNonce="..."></app-root>`) when the server
  templates `index.html` for each response, or
- Provide the `CSP_NONCE` injection token from `@angular/core` when the nonce is only known at runtime.

A nonce must be unique per response and unpredictable. Never hard-code a nonce in a static
`index.html`. For static hosting, set `"security": {"autoCsp": true}` in the build options in
`angular.json`. The CLI then hashes the inline scripts in `index.html` and adds a strict
`script-src` policy in a `<meta>` tag. `autoCsp` only covers scripts and cannot be used with
server-side rendering.

## Trusted Types

To enforce Trusted Types, the server sends a CSP header with Angular's policy names, for example:

```txt
Content-Security-Policy: trusted-types angular angular#bundler; require-trusted-types-for 'script';
```

Add `angular#unsafe-bypass` if the app calls any `bypassSecurityTrust*` method, and
`angular#unsafe-jit` if it uses the JIT compiler.

## Related

- XSRF protection and XSSI: see the Security section of [http-client.md](http-client.md).
- Host and proxy header validation on the server: see [server-side-rendering.md](server-side-rendering.md).

For more detail, see the [Angular security guide](https://angular.dev/best-practices/security).
