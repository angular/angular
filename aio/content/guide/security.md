@title
Security

@intro
Developing for content security in Angular applications

@description
This section describes Angular's built-in
protections against common web application vulnerabilities and attacks such as cross-site
scripting attacks. It does not cover application-level security, such as authentication (_Who is
this user?_) or authorization (_What can this user do?_).

For more information about the attacks and mitigations described below, see [OWASP Guide Project](https://www.owasp.org/index.php/Category:OWASP_Guide_Project).
Try the <live-example></live-example> of the code shown in this page.


<h2 id='report-issues'>
  Reporting vulnerabilities
</h2>

Email us at [security@angular.io](mailto:security@angular.io) to report vulnerabilities in
Angular itself.

For more information about how Google handles security issues, see [Google's security
philosophy](https://www.google.com/about/appsecurity/).


<h2 id='best-practices'>
  Best practices
</h2>

* **Keep current with the latest Angular library releases.**
We regularly update our Angular libraries, and these updates may fix security defects discovered in
previous versions. Check the Angular [change
log](https://github.com/angular/angular/blob/master/CHANGELOG.md) for security-related updates.

* **Don't modify your copy of Angular.**
Private, customized versions of Angular tend to fall behind the current version and may not include
important security fixes and enhancements. Instead, share your Angular improvements with the
community and make a pull request.

* **Avoid Angular APIs marked in the documentation as “[_Security Risk_](#bypass-security-apis).”**


<h2 id='xss'>
  Preventing cross-site scripting (XSS)
</h2>

[Cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) enables attackers
to inject malicious code into web pages. Such code can then, for example, steal user data (in
particular, their login data) or perform actions impersonating the user. This is one of the most
common attacks on the web.

To block XSS attacks, you must prevent malicious code from entering the DOM (Document Object Model). For example, if an
attacker can trick you into inserting a `<script>` tag in the DOM, they can run arbitrary code on
your website. The attack is not limited to `<script>` tags&mdash;many elements and properties in the
DOM allow code execution, for example, `<img onerror="...">` and `<a href="javascript:...">`. If
attacker-controlled data enters the DOM, expect security vulnerabilities.

### Angular’s cross-site scripting security model

To systematically block XSS bugs, Angular treats all values as untrusted by default. When a value
is inserted into the DOM from a template, via property, attribute, style, class binding, or interpolation, Angular sanitizes and escapes untrusted values.

_Angular templates are the same as executable code_: HTML, attributes, and binding expressions
(but not the values bound!) in templates are trusted to be safe. This means that applications must
prevent values that an attacker can control from ever making it into the source code of a
template. Never generate template source code by concatenating user input and templates! Using
the [offline template compiler](#offline-template-compiler) is an effective way to prevent these
vulnerabilities, also known as _template injection_.

### Sanitization and security contexts

_Sanitization_ is the inspection of an untrusted value, turning it into a value that is safe to insert into
the DOM. In many cases, sanitization does not change a value at all. Sanitization depends on context:
a value that is harmless in CSS is potentially dangerous in a URL.

Angular defines four security contexts&mdash;HTML, style, URL, and resource URL:

* **HTML** is used when interpreting a value as HTML, for example, when binding to `innerHtml`
* **Style** is used when binding CSS into the `style` property
* **URL** is used for URL properties such as `<a href>`
* **Resource URL** is a URL that will be loaded and executed as code, for example, in `<script src>`

Angular sanitizes untrusted values for the first three items; sanitizing resource URLs is not
possible because they contain arbitrary code. In development mode, Angular prints a console warning
when it has to change a value during sanitization.

### Sanitization example

The template below binds the value of `htmlSnippet`, once by interpolating it into an element's
content, and once by binding it to the `innerHTML` property of an element:


{@example 'security/ts/src/app/inner-html-binding.component.html'}

Interpolated content is always escaped&mdash;the HTML is not interpreted, and the browser displays
angle brackets in the element's text content.

For the HTML to be interpreted, you must bind it to an HTML property such as `innerHTML`. But binding
a value that an attacker might control into `innerHTML` normally causes an XSS
vulnerability. For example, code contained in a `<script>` tag is executed:
### Avoid direct use of the DOM APIs

The built-in browser DOM APIs do not automatically protect you from security vulnerabilities.
For example, `document`, the node available through `ElementRef`, and many third-party APIs
contain unsafe methods. Avoid directly interacting with the DOM and instead use Angular
templates where possible.

### Content security policy

[Content Security Policy (CSP)](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) is a defense-in-depth
technique to prevent XSS. To enable CSP, configure your web server to return an appropriate
`Content-Security-Policy` HTTP header.

<a id="offline-template-compiler"></a>
### Use the offline template compiler

The offline template compiler prevents a whole class of vulnerabilities called template injection,
and also greatly improves application performance. Use the offline template compiler in production
deployments; do not dynamically generate templates. Angular trusts template code, so generating
templates, in particular templates containing user data, circumvents Angular's built-in protections. For information about how to dynamically construct forms in a safe way, see 
[Dynamic Forms Cookbook](../cookbook/dynamic-form.html).

### Server-side XSS protection

HTML constructed on the server is vulnerable to injection attacks. Injecting template code into an
Angular application is the same as injecting executable code into the
application: it gives the attacker full control over the application. To prevent this, 
use a templating language that automatically escapes values to prevent XSS vulnerabilities on
the server. Do not generate Angular templates on the server side using a templating language; doing this
carries a high risk of introducing template-injection vulnerabilities.


<h2 id='code-review'>
  Auditing angular applications
</h2>

Angular applications must follow the same security principles as regular web applications, and
must be audited as such. Angular-specific APIs that should be audited in a security review,
such as the [_bypassSecurityTrust_](#bypass-security-apis) methods, are marked in the documentation
as security sensitive.