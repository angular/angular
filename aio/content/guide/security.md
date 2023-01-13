# Security

This topic describes Angular's built-in protections against common web-application vulnerabilities and attacks such as cross-site scripting attacks.
It doesn't cover application-level security, such as authentication and authorization.

For more information about the attacks and mitigations described below, see the [Open Web Application Security Project (OWASP) Guide](https://www.owasp.org/index.php/Category:OWASP_Guide_Project).

You can run the <live-example></live-example> in Stackblitz and download the code from there.

<a id="report-issues"></a>

<div class="callout is-important">

<header>Reporting vulnerabilities</header>

Angular is part of Google [Open Source Software Vulnerability Reward Program](https://bughunters.google.com/about/rules/6521337925468160/google-open-source-software-vulnerability-reward-program-rules), for vulnerabilities in Angular please submit your report [here](https://bughunters.google.com/report).

For more information about how Google handles security issues, see [Google's security philosophy](https://www.google.com/about/appsecurity).

</div>

<a id="best-practices"></a>

<div class="callout is-helpful">

<header>Best practices</header>

| Practices                                                           | Details |
|:---                                                                 |:---     |
| Keep current with the latest Angular library releases               | The Angular libraries get regular updates, and these updates might fix security defects discovered in previous versions. Check the Angular [change log](https://github.com/angular/angular/blob/main/CHANGELOG.md) for security-related updates. |
| Don't alter your copy of Angular                                   | Private, customized versions of Angular tend to fall behind the current version and might not include important security fixes and enhancements. Instead, share your Angular improvements with the community and make a pull request.              |
| Avoid Angular APIs marked in the documentation as "*Security Risk*" | For more information, see the [Trusting safe values](guide/security#bypass-security-apis) section of this page.                                                                                                                                    |

</div>

## Preventing cross-site scripting (XSS)

[Cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) enables attackers to inject malicious code into web pages.
Such code can then, for example, steal user and login data, or perform actions that impersonate the user.
This is one of the most common attacks on the web.

To block XSS attacks, you must prevent malicious code from entering the Document Object Model (DOM).
For example, if attackers can trick you into inserting a `<script>` tag in the DOM, they can run arbitrary code on your website.
The attack isn't limited to `<script>` tags &mdash;many elements and properties in the DOM allow code execution, for example, `<img alt="" onerror="...">` and `<a href="javascript:...">`.
If attacker-controlled data enters the DOM, expect security vulnerabilities.

### Angular's cross-site scripting security model

To systematically block XSS bugs, Angular treats all values as untrusted by default.
When a value is inserted into the DOM from a template binding, or interpolation, Angular sanitizes and escapes untrusted values.
If a value was already sanitized outside of Angular and is considered safe, communicate this to Angular by marking the [value as trusted](#bypass-security-apis).

Unlike values to be used for rendering, Angular templates are considered trusted by default, and should be treated as executable code.
Never create templates by concatenating user input and template syntax.
Doing this would enable attackers to [inject arbitrary code](https://en.wikipedia.org/wiki/Code_injection) into your application.
To prevent these vulnerabilities, always use the default [Ahead-Of-Time (AOT) template compiler](guide/security#offline-template-compiler) in production deployments.

An extra layer of protection can be provided through the use of Content security policy and Trusted Types.
These web platform features operate at the DOM level which is the most effective place to prevent XSS issues. Here they can't be bypassed using other, lower-level APIs.
For this reason, it is strongly encouraged to take advantage of these features. To do this, configure the [content security policy](#content-security-policy) for the application and enable [trusted types enforcement](#trusted-types).

### Sanitization and security contexts

*Sanitization* is the inspection of an untrusted value, turning it into a value that's safe to insert into the DOM.
In many cases, sanitization doesn't change a value at all.
Sanitization depends on context:
A value that's harmless in CSS is potentially dangerous in a URL.

Angular defines the following security contexts:

| Security contexts | Details |
|:---               |:---     |
| HTML              | Used when interpreting a value as HTML, for example, when binding to `innerHtml`. |
| Style             | Used when binding CSS into the `style` property.                                  |
| URL               | Used for URL properties, such as `<a href>`.                                      |
| Resource URL      | A URL that is loaded and executed as code, for example, in `<script src>`.        |

Angular sanitizes untrusted values for HTML, styles, and URLs. Sanitizing resource URLs isn't possible because they contain arbitrary code.
In development mode, Angular prints a console warning when it has to change a value during sanitization.

### Sanitization example

The following template binds the value of `htmlSnippet`. Once by interpolating it into an element's content, and once by binding it to the `innerHTML` property of an element:

<code-example header="src/app/inner-html-binding.component.html" path="security/src/app/inner-html-binding.component.html"></code-example>

Interpolated content is always escaped &mdash;the HTML isn't interpreted and the browser displays angle brackets in the element's text content.

For the HTML to be interpreted, bind it to an HTML property such as `innerHTML`.
Be aware that binding a value that an attacker might control into `innerHTML` normally causes an XSS vulnerability.
For example, one could run JavaScript in a following way:

<code-example header="src/app/inner-html-binding.component.ts (class)" path="security/src/app/inner-html-binding.component.ts" region="class"></code-example>

Angular recognizes the value as unsafe and automatically sanitizes it, which removes the `script` element but keeps safe content such as the `<b>` element.

<div class="lightbox">

<img alt="A screenshot showing interpolated and bound HTML values" src="generated/images/guide/security/binding-inner-html.png">

</div>

### Direct use of the DOM APIs and explicit sanitization calls

Unless you enforce Trusted Types, the built-in browser DOM APIs don't automatically protect you from security vulnerabilities.
For example, `document`, the node available through `ElementRef`, and many third-party APIs contain unsafe methods.
Likewise, if you interact with other libraries that manipulate the DOM, you likely won't have the same automatic sanitization as with Angular interpolations.
Avoid directly interacting with the DOM and instead use Angular templates where possible.

For cases where this is unavoidable, use the built-in Angular sanitization functions.
Sanitize untrusted values with the [DomSanitizer.sanitize](api/platform-browser/DomSanitizer#sanitize) method and the appropriate `SecurityContext`.
That function also accepts values that were marked as trusted using the `bypassSecurityTrust` &hellip; functions, and does not sanitize them, as [described below](#bypass-security-apis).

<a id="bypass-security-apis"></a>

### Trusting safe values

Sometimes applications genuinely need to include executable code, display an `<iframe>` from some URL, or construct potentially dangerous URLs.
To prevent automatic sanitization in these situations, tell Angular that you inspected a value, checked how it was created, and made sure it is secure.
Do *be careful*.
If you trust a value that might be malicious, you are introducing a security vulnerability into your application.
If in doubt, find a professional security reviewer.

To mark a value as trusted, inject `DomSanitizer` and call one of the following methods:

*   `bypassSecurityTrustHtml`
*   `bypassSecurityTrustScript`
*   `bypassSecurityTrustStyle`
*   `bypassSecurityTrustUrl`
*   `bypassSecurityTrustResourceUrl`

Remember, whether a value is safe depends on context, so choose the right context for your intended use of the value.
Imagine that the following template needs to bind a URL to a `javascript:alert(...)` call:

<code-example header="src/app/bypass-security.component.html (URL)" path="security/src/app/bypass-security.component.html" region="URL"></code-example>

Normally, Angular automatically sanitizes the URL, disables the dangerous code, and in development mode, logs this action to the console.
To prevent this, mark the URL value as a trusted URL using the `bypassSecurityTrustUrl` call:

<code-example header="src/app/bypass-security.component.ts (trust-url)" path="security/src/app/bypass-security.component.ts" region="trust-url"></code-example>

<div class="lightbox">

<img alt="A screenshot showing an alert box created from a trusted URL" src="generated/images/guide/security/bypass-security-component.png">

</div>

If you need to convert user input into a trusted value, use a component method.
The following template lets users enter a YouTube video ID and load the corresponding video in an `<iframe>`.
The `<iframe src>` attribute is a resource URL security context, because an untrusted source can, for example, smuggle in file downloads that unsuspecting users could run.
To prevent this, call a method on the component to construct a trusted video URL, which causes Angular to let binding into `<iframe src>`:

<code-example header="src/app/bypass-security.component.html (iframe)" path="security/src/app/bypass-security.component.html" region="iframe"></code-example>

<code-example header="src/app/bypass-security.component.ts (trust-video-url)" path="security/src/app/bypass-security.component.ts" region="trust-video-url"></code-example>

<a id="content-security-policy"></a>

### Content security policy

Content Security Policy \(CSP\) is a defense-in-depth technique to prevent XSS.
To enable CSP, configure your web server to return an appropriate `Content-Security-Policy` HTTP header.
Read more about content security policy at the [Web Fundamentals guide](https://developers.google.com/web/fundamentals/security/csp) on the Google Developers website.

The minimal policy required for a brand-new Angular application is:

<code-example format="none" language="none">

default-src 'self'; style-src 'self' 'nonce-randomNonceGoesHere'; script-src 'self' 'nonce-randomNonceGoesHere';

</code-example>

When serving your Angular application, the server should include a  randomly-generated nonce in the HTTP header for each request.
You must provide this nonce to Angular so that the framework can render `<style>` elements.
You can set the nonce for Angular in one of two ways:

1. Set the `ngCspNonce` attribute on the root application element as `<app ngCspNonce="randomNonceGoesHere"></app>`. Use this approach if you have access to server-side templating that can add the nonce both to the header and the `index.html` when constructing the response.
2. Provide the nonce using the `CSP_NONCE` injection token. Use this approach if you have access to the nonce at runtime and you want to be able to cache the `index.html`.

<code-example format="typescript" language="typescript">

import {bootstrapApplication, CSP_NONCE} from '&commat;angular/core';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [{
    provide: CSP_NONCE,
    useValue: globalThis.myRandomNonceValue
  }]
});

</code-example>

<div class="callout is-helpful">

Always ensure that the nonces you provide are <strong>unique per request</strong> and that they are not predictable or guessable.
If an attacker can predict future nonces, they can circumvent the protections offered by CSP.

</div>

If you cannot generate nones in your project, you can allow inline styles by adding `'unsafe-inline'` to the `style-src` section of the CSP header.

| Sections                | Details |
|:---                     |:---     |
| `default-src 'self';`   | Allows the page to load all its required resources from the same origin. |
| `style-src 'self' 'nonce-randomNonceGoesHere';`     | Allows the page to load global styles from the same origin \(`'self'`\) and styles inserted by Angular with the `nonce-randomNonceGoesHere`. |
| `script-src 'self' 'nonce-randomNonceGoesHere';`     | Allows the page to load JavaScript from the same origin \(`'self'`\) and scripts inserted by the Angular CLI with the `nonce-randomNonceGoesHere`. This is only required if you're using critical CSS inlining. |

Angular itself requires only these settings to function correctly.
As your project grows, you may need to expand your CSP settings to accommodate extra features specific to your application.

<a id="trusted-types"></a>

<!-- vale Angular.Google_Headings = NO -->

### Enforcing Trusted Types

<!-- vale Angular.Google_Headings = YES -->

It is recommended that you use [Trusted Types](https://w3c.github.io/trusted-types/dist/spec/) as a way to help secure your applications from cross-site scripting attacks.
Trusted Types is a [web platform](https://en.wikipedia.org/wiki/Web_platform) feature that can help you prevent cross-site scripting attacks by enforcing safer coding practices.
Trusted Types can also help simplify the auditing of application code.

<div class="callout is-helpful">

Trusted Types might not yet be available in all browsers your application targets.
In the case your Trusted-Types-enabled application runs in a browser that doesn't support Trusted Types, the features of the application are preserved. Your application is guarded against XSS by way of Angular's DomSanitizer.
See [caniuse.com/trusted-types](https://caniuse.com/trusted-types) for the current browser support.

</div>

To enforce Trusted Types for your application, you must configure your application's web server to emit HTTP headers with one of the following Angular policies:

| Policies                | Detail |
|:---                     |:---    |
| `angular`               | This policy is used in security-reviewed code that is internal to Angular, and is required for Angular to function when Trusted Types are enforced. Any inline template values or content sanitized by Angular is treated as safe by this policy.                           |
| `angular#unsafe-bypass` | This policy is used for applications that use any of the methods in Angular's [DomSanitizer](api/platform-browser/DomSanitizer) that bypass security, such as `bypassSecurityTrustHtml`. Any application that uses these methods must enable this policy.                   |
| `angular#unsafe-jit`    | This policy is used by the [Just-In-Time (JIT) compiler](api/core/Compiler). You must enable this policy if your application interacts directly with the JIT compiler or is running in JIT mode using the [platform browser dynamic](api/platform-browser-dynamic/platformBrowserDynamic). |
| `angular#bundler`       | This policy is used by the Angular CLI bundler when creating lazy chunk files.                    |

You should configure the HTTP headers for Trusted Types in the following locations:

*   Production serving infrastructure
*   Angular CLI \(`ng serve`\), using the `headers` property in the `angular.json` file, for local development and end-to-end testing
*   Karma \(`ng test`\), using the `customHeaders` property in the `karma.config.js` file, for unit testing

The following is an example of a header specifically configured for Trusted Types and Angular:

<code-example format="html" language="html">

Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script';

</code-example>

An example of a header specifically configured for Trusted Types and Angular applications that use any of Angular's methods in [DomSanitizer](api/platform-browser/DomSanitizer) that bypasses security:

<code-example format="html" language="html">

Content-Security-Policy: trusted-types angular angular#unsafe-bypass; require-trusted-types-for 'script';

</code-example>

The following is an example of a header specifically configured for Trusted Types and Angular applications using JIT:

<code-example format="html" language="html">

Content-Security-Policy: trusted-types angular angular#unsafe-jit; require-trusted-types-for 'script';

</code-example>

The following is an example of a header specifically configured for Trusted Types and Angular applications that use lazy loading of modules:

<code-example language="html">

Content-Security-Policy: trusted-types angular angular#bundler; require-trusted-types-for 'script';

</code-example>

<div class="callout is-helpful">

<header>Community contributions</header>

To learn more about troubleshooting Trusted Type configurations, the following resource might be helpful:

[Prevent DOM-based cross-site scripting vulnerabilities with Trusted Types](https://web.dev/trusted-types/#how-to-use-trusted-types)

</div>

<a id="offline-template-compiler"></a>

### Use the AOT template compiler

The AOT template compiler prevents a whole class of vulnerabilities called template injection, and greatly improves application performance.
The AOT template compiler is the default compiler used by Angular CLI applications, and you should use it in all production deployments.

An alternative to the AOT compiler is the JIT compiler which compiles templates to executable template code within the browser at runtime.
Angular trusts template code, so dynamically generating templates and compiling them, in particular templates containing user data, circumvents Angular's built-in protections. This is a security anti-pattern.
For information about dynamically constructing forms in a safe way, see the [Dynamic Forms](guide/dynamic-form) guide.

<a id="server-side-xss"></a>

### Server-side XSS protection

HTML constructed on the server is vulnerable to injection attacks.
Injecting template code into an Angular application is the same as injecting executable code into the application:
It gives the attacker full control over the application.
To prevent this, use a templating language that automatically escapes values to prevent XSS vulnerabilities on the server.
Don't create Angular templates on the server side using a templating language. This carries a high risk of introducing template-injection vulnerabilities.

<a id="http"></a>

<!-- vale Angular.Google_Acronyms = NO -->

## HTTP-level vulnerabilities

Angular has built-in support to help prevent two common HTTP vulnerabilities, cross-site request forgery \(CSRF or XSRF\) and cross-site script inclusion \(XSSI\).
Both of these must be mitigated primarily on the server side, but Angular provides helpers to make integration on the client side easier.

<a id="xsrf"></a>

### Cross-site request forgery

In a cross-site request forgery \(CSRF or XSRF\), an attacker tricks the user into visiting a different web page \(such as `evil.com`\) with malignant code. This web page secretly sends a malicious request to the application's web server \(such as `example-bank.com`\).

Assume the user is logged into the application at `example-bank.com`.
The user opens an email and clicks a link to `evil.com`, which opens in a new tab.

The `evil.com` page immediately sends a malicious request to `example-bank.com`.
Perhaps it's a request to transfer money from the user's account to the attacker's account.
The browser automatically sends the `example-bank.com` cookies, including the authentication cookie, with this request.

If the `example-bank.com` server lacks XSRF protection, it can't tell the difference between a legitimate request from the application and the forged request from `evil.com`.

To prevent this, the application must ensure that a user request originates from the real application, not from a different site.
The server and client must cooperate to thwart this attack.

In a common anti-XSRF technique, the application server sends a randomly created authentication token in a cookie.
The client code reads the cookie and adds a custom request header with the token in all following requests.
The server compares the received cookie value to the request header value and rejects the request if the values are missing or don't match.

This technique is effective because all browsers implement the *same origin policy*.
Only code from the website on which cookies are set can read the cookies from that site and set custom headers on requests to that site.
That means only your application can read this cookie token and set the custom header.
The malicious code on `evil.com` can't.

Angular's `HttpClient` has built-in support for the client-side half of this technique.
Read about it more in the [HttpClient guide](guide/http#security-xsrf-protection).

For information about CSRF at the Open Web Application Security Project \(OWASP\), see [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) and [Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
The Stanford University paper [Robust Defenses for Cross-Site Request Forgery](https://seclab.stanford.edu/websec/csrf/csrf.pdf) is a rich source of detail.

See also Dave Smith's [talk on XSRF at AngularConnect 2016](https://www.youtube.com/watch?v=9inczw6qtpY "Cross Site Request Funkery Securing Your Angular Apps From Evil Doers").

<!-- vale Angular.Google_Acronyms = YES -->

<a id="xssi"></a>

### Cross-site script inclusion (XSSI)

Cross-site script inclusion, also known as JSON vulnerability, can allow an attacker's website to read data from a JSON API.
The attack works on older browsers by overriding built-in JavaScript object constructors, and then including an API URL using a `<script>` tag.

This attack is only successful if the returned JSON is executable as JavaScript.
Servers can prevent an attack by prefixing all JSON responses to make them non-executable, by convention, using the well-known string `")]}',\n"`.

Angular's `HttpClient` library recognizes this convention and automatically strips the string `")]}',\n"` from all responses before further parsing.

For more information, see the XSSI section of this [Google web security blog post](https://security.googleblog.com/2011/05/website-security-for-webmasters.html).

<a id="code-review"></a>

## Auditing Angular applications

Angular applications must follow the same security principles as regular web applications, and must be audited as such.
Angular-specific APIs that should be audited in a security review, such as the [*bypassSecurityTrust*](guide/security#bypass-security-apis) methods, are marked in the documentation as security sensitive.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
