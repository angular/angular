# HTML Sanitization

> **Scope**: This reference covers Angular's built-in HTML sanitization pipeline and patterns for rendering untrusted HTML safely. It does **not** cover the full Angular security model.
> For HTTP-level vulnerabilities (CSRF, SSRF), authentication, Content Security Policy, and other security topics, refer to the [Angular Security Guide](https://angular.dev/best-practices/security).

Angular provides built-in protection against Cross-Site Scripting (XSS) attacks. By default, Angular treats all values as untrusted and automatically sanitizes them before inserting them into the DOM.

---

## Context-Based Sanitization

Angular automatically detects the context in which a value is bound and applies the appropriate sanitization:

- **HTML**: Used when binding to innerHTML (`[innerHTML]="value"`). Angular strips unsafe elements (such as `<script>`, `<object>`, `<embed>`) and attributes (such as `onerror`, `onclick`).
- **Style**: Used when binding to style properties (`[style.color]="value"` or `[style]="value"`). Angular ensures CSS values do not contain executable script code.
- **URL**: Used when binding to links and media elements (`[href]="value"` or `[src]="value"`). Safe schemes like `http`, `https`, `mailto`, and `tel` are allowed; unsafe schemes like `javascript:` are prefixed with `unsafe:`.
- **Resource URL**: Used when loading external code or frames (`[src]="value"` on an `<iframe>` or `<script>`). **Angular does not auto-sanitize Resource URLs.** You must explicitly mark them as trusted, otherwise Angular throws an error.

---

## Bypassing Security with `DomSanitizer`

If you need to render trusted dynamic HTML, style, or URL content that would otherwise be sanitized or blocked, inject `DomSanitizer` from `@angular/platform-browser` to mark the value as safe.

### Methods

- `bypassSecurityTrustHtml(value)`
- `bypassSecurityTrustStyle(value)`
- `bypassSecurityTrustScript(value)`
- `bypassSecurityTrustUrl(value)`
- `bypassSecurityTrustResourceUrl(value)`

### Example: Rendering an iframe

```ts
import {Component, computed, inject, input} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  template: ` <iframe [src]="safeVideoUrl()" width="560" height="315"></iframe> `,
})
export class VideoPlayer {
  private readonly sanitizer = inject(DomSanitizer);
  readonly videoId = input.required<string>();

  // Use a computed signal to derive the resource URL. Ensure videoId is strictly validated!
  protected readonly safeVideoUrl = computed<SafeResourceUrl>(() => {
    const rawUrl = `https://www.youtube.com/embed/${this.videoId()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  });
}
```

---

## Third-Party Sanitization Libraries

When you need to render user-generated or untrusted HTML, **do not pass it directly to `bypassSecurityTrust...` methods**. Instead, use a dedicated sanitization library such as [DomPurify](https://github.com/cure53/dompurify) to strip dangerous content first, then tell Angular the result is safe.

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```ts
import {Component, computed, inject, input} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-rich-text',
  template: ` <div [innerHTML]="sanitizedHtml()"></div> `,
})
export class RichText {
  private readonly sanitizer = inject(DomSanitizer);

  /** Raw HTML from an untrusted source (e.g., a CMS or user input). */
  readonly rawHtml = input.required<string>();

  /**
   * First sanitize with DOMPurify to remove dangerous nodes,
   * then mark the clean result as safe for Angular's renderer.
   */
  protected readonly sanitizedHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(this.rawHtml())),
  );
}
```

---

## Trusted Types

Angular supports **Trusted Types**, a browser security feature that helps prevent DOM XSS. When configured, the browser restricts DOM APIs to only accept specialized objects (like `TrustedHTML`) instead of plain strings.

To enable Trusted Types in Angular:

1. Configure your web server to send the `Content-Security-Policy` header. For standard applications, you must declare the core `angular` policy. If you use `DomSanitizer` to bypass security (as shown above) or use lazy-loading, you must also include the `angular#unsafe-bypass` and `angular#bundler` policies:
   ```http
   Content-Security-Policy: require-trusted-types-for 'script'; trusted-types angular angular#unsafe-bypass angular#bundler;
   ```
2. Angular will automatically create and use these policies to serialize and trust HTML, URLs, and scripts.

---

## Recommended Patterns

- **Minimize Bypassing**: Only bypass sanitization as a last resort. Always sanitize, strip, or validate content on the backend before relying on `DomSanitizer`.
- **Never Trust Direct User Input**: Never pass raw, unvalidated user input directly into any `bypassSecurityTrust...` method. Pre-sanitize with a library like [DomPurify](https://github.com/cure53/dompurify) before calling `bypassSecurityTrustHtml`.
- **Avoid Direct DOM Manipulation**: Do not use native DOM APIs like `Element.innerHTML` or `Element.setAttribute` directly. Use Angular template bindings (`[innerHTML]`, `[attr.href]`), which automatically apply sanitization.
