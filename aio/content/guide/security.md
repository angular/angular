# Security

This page describes Angular's built-in
protections against common web-application vulnerabilities and attacks such as cross-site
scripting attacks. It doesn't cover application-level security, such as authentication (_Who is
this user?_) and authorization (_What can this user do?_).

For more information about the attacks and mitigations described below, see [OWASP Guide Project](https://www.owasp.org/index.php/Category:OWASP_Guide_Project).

You can run the <live-example></live-example> in Stackblitz and download the code from there.



<h2 id='report-issues'>
  Reporting vulnerabilities
</h2>



To report vulnerabilities in Angular itself, email us at [security@angular.io](mailto:security@angular.io).

For more information about how Google handles security issues, see [Google's security
philosophy](https://www.google.com/about/appsecurity/).



<h2 id='best-practices'>
  Best practices
</h2>



* **Keep current with the latest Angular library releases.**
We regularly update the Angular libraries, and these updates may fix security defects discovered in
previous versions. Check the Angular [change
log](https://github.com/angular/angular/blob/master/CHANGELOG.md) for security-related updates.

* **Don't modify your copy of Angular.**
Private, customized versions of Angular tend to fall behind the current version and may not include
important security fixes and enhancements. Instead, share your Angular improvements with the
community and make a pull request.

* **Avoid Angular APIs marked in the documentation as “_Security Risk_.”**
For more information, see the [Trusting safe values](guide/security#bypass-security-apis) section of this page.



<h2 id='xss'>
  Preventing cross-site scripting (XSS)
</h2>



[Cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) enables attackers
to inject malicious code into web pages. Such code can then, for example, steal user data (in
particular, login data) or perform actions to impersonate the user. This is one of the most
common attacks on the web.

To block XSS attacks, you must prevent malicious code from entering the DOM (Document Object Model). For example, if
attackers can trick you into inserting a `<script>` tag in the DOM, they can run arbitrary code on
your website. The attack isn't limited to `<script>` tags&mdash;many elements and properties in the
DOM allow code execution, for example, `<img onerror="...">` and `<a href="javascript:...">`. If
attacker-controlled data enters the DOM, expect security vulnerabilities.

### Angular’s cross-site scripting security model

To systematically block XSS bugs, Angular treats all values as untrusted by default. When a value
is inserted into the DOM from a template, via property, attribute, style, class binding, or interpolation,
Angular sanitizes and escapes untrusted values.

_Angular templates are the same as executable code_: HTML, attributes, and binding expressions
(but not the values bound) in templates are trusted to be safe. This means that applications must
prevent values that an attacker can control from ever making it into the source code of a
template. Never generate template source code by concatenating user input and templates.
To prevent these vulnerabilities, use
the [offline template compiler](guide/security#offline-template-compiler), also known as _template injection_.

### Sanitization and security contexts

_Sanitization_ is the inspection of an untrusted value, turning it into a value that's safe to insert into
the DOM. In many cases, sanitization doesn't change a value at all. Sanitization depends on context:
a value that's harmless in CSS is potentially dangerous in a URL.

Angular defines the following security contexts:

* **HTML** is used when interpreting a value as HTML, for example, when binding to `innerHtml`.
* **Style** is used when binding CSS into the `style` property.
* **URL** is used for URL properties, such as `<a href>`.
* **Resource URL** is a URL that will be loaded and executed as code, for example, in `<script src>`.

Angular sanitizes untrusted values for HTML, styles, and URLs; sanitizing resource URLs isn't
possible because they contain arbitrary code. In development mode, Angular prints a console warning
when it has to change a value during sanitization.

### Sanitization example

The following template binds the value of `htmlSnippet`, once by interpolating it into an element's
content, and once by binding it to the `innerHTML` property of an element:


<code-example path="security/src/app/inner-html-binding.component.html" header="src/app/inner-html-binding.component.html">

</code-example>



Interpolated content is always escaped&mdash;the HTML isn't interpreted and the browser displays
angle brackets in the element's text content.

For the HTML to be interpreted, bind it to an HTML property such as `innerHTML`. But binding
a value that an attacker might control into `innerHTML` normally causes an XSS
vulnerability. For example, code contained in a `<script>` tag is executed:


<code-example path="security/src/app/inner-html-binding.component.ts" linenums="false" header="src/app/inner-html-binding.component.ts (class)" region="class">

</code-example>



Angular recognizes the value as unsafe and automatically sanitizes it, which removes the `<script>`
tag but keeps safe content such as the `<b>` element.


<figure>
  <img src='generated/images/guide/security/binding-inner-html.png' alt='A screenshot showing interpolated and bound HTML values'>
</figure>


### Direct use of the DOM APIs and explicit sanitization calls

The built-in browser DOM APIs don't automatically protect you from security vulnerabilities.
For example, `document`, the node available through `ElementRef`, and many third-party APIs
contain unsafe methods. In the same way, if you interact with other libraries that manipulate
the DOM, you likely won't have the same automatic sanitization as with Angular interpolations.
Avoid directly interacting with the DOM and instead use Angular templates where possible.

For cases where this is unavoidable, use the built-in Angular sanitization functions.
Sanitize untrusted values with the [DomSanitizer.sanitize](api/platform-browser/DomSanitizer#sanitize)
method and the appropriate `SecurityContext`. That function also accepts values that were
marked as trusted using the `bypassSecurityTrust`... functions, and will not sanitize them,
as [described below](#bypass-security-apis).

### Content security policy

Content Security Policy (CSP) is a defense-in-depth
technique to prevent XSS. To enable CSP, configure your web server to return an appropriate
`Content-Security-Policy` HTTP header. Read more about content security policy at
[An Introduction to Content Security Policy](http://www.html5rocks.com/en/tutorials/security/content-security-policy/)
on the HTML5Rocks website.


{@a offline-template-compiler}


### Use the offline template compiler

The offline template compiler prevents a whole class of vulnerabilities called template injection,
and greatly improves application performance. Use the offline template compiler in production
deployments; don't dynamically generate templates. Angular trusts template code, so generating
templates, in particular templates containing user data, circumvents Angular's built-in protections.
For information about dynamically constructing forms in a safe way, see the
[Dynamic Forms](guide/dynamic-form) guide page.

### Server-side XSS protection

HTML constructed on the server is vulnerable to injection attacks. Injecting template code into an
Angular application is the same as injecting executable code into the
application: it gives the attacker full control over the application. To prevent this,
use a templating language that automatically escapes values to prevent XSS vulnerabilities on
the server. Don't generate Angular templates on the server side using a templating language; doing this
carries a high risk of introducing template-injection vulnerabilities.



<h2 id='bypass-security-apis'>
  Trusting safe values
</h2>



Sometimes applications genuinely need to include executable code, display an `<iframe>` from some
URL, or construct potentially dangerous URLs. To prevent automatic sanitization in any of these
situations, you can tell Angular that you inspected a value, checked how it was generated, and made
sure it will always be secure. But *be careful*. If you trust a value that might be malicious, you
are introducing a security vulnerability into your application. If in doubt, find a professional
security reviewer.

To mark a value as trusted, inject `DomSanitizer` and call one of the
following methods:

* `bypassSecurityTrustHtml`
* `bypassSecurityTrustScript`
* `bypassSecurityTrustStyle`
* `bypassSecurityTrustUrl`
* `bypassSecurityTrustResourceUrl`

Remember, whether a value is safe depends on context, so choose the right context for
your intended use of the value. Imagine that the following template needs to bind a URL to a
`javascript:alert(...)` call:


<code-example path="security/src/app/bypass-security.component.html" linenums="false" header="src/app/bypass-security.component.html (URL)" region="URL">

</code-example>



Normally, Angular automatically sanitizes the URL, disables the dangerous code, and
in development mode, logs this action to the console. To prevent
this, mark the URL value as a trusted URL using the `bypassSecurityTrustUrl` call:


<code-example path="security/src/app/bypass-security.component.ts" linenums="false" header="src/app/bypass-security.component.ts (trust-url)" region="trust-url">

</code-example>



<figure>
  <img src='generated/images/guide/security/bypass-security-component.png' alt='A screenshot showing an alert box created from a trusted URL'>
</figure>



If you need to convert user input into a trusted value, use a
controller method. The following template allows users to enter a YouTube video ID and load the
corresponding video in an `<iframe>`. The `<iframe src>` attribute is a resource URL security
context, because an untrusted source can, for example, smuggle in file downloads that unsuspecting users
could execute. So call a method on the controller to construct a trusted video URL, which causes
Angular to allow binding into `<iframe src>`:


<code-example path="security/src/app/bypass-security.component.html" linenums="false" header="src/app/bypass-security.component.html (iframe)" region="iframe">

</code-example>



<code-example path="security/src/app/bypass-security.component.ts" linenums="false" header="src/app/bypass-security.component.ts (trust-video-url)" region="trust-video-url">

</code-example>




<h2 id='http'>
  HTTP-level vulnerabilities
</h2>



Angular has built-in support to help prevent two common HTTP vulnerabilities, cross-site request
forgery (CSRF or XSRF) and cross-site script inclusion (XSSI). Both of these must be mitigated primarily
on the server side, but Angular provides helpers to make integration on the client side easier.


<h3 id='xsrf'>
  Cross-site request forgery
</h3>



In a cross-site request forgery (CSRF or XSRF), an attacker tricks the user into visiting
a different web page (such as `evil.com`) with malignant code that secretly sends a malicious request
to the application's web server (such as `example-bank.com`).

Assume the user is logged into the application at `example-bank.com`.
The user opens an email and clicks a link to `evil.com`, which opens in a new tab.

The `evil.com` page immediately sends a malicious request to `example-bank.com`.
Perhaps it's a request to transfer money from the user's account to the attacker's account.
The browser automatically sends the `example-bank.com` cookies (including the authentication cookie) with this request.

If the `example-bank.com` server lacks XSRF protection, it can't tell the difference between a legitimate
request from the application and the forged request from `evil.com`.

To prevent this, the application must ensure that a user request originates from the real
application, not from a different site.
The server and client must cooperate to thwart this attack.

In a common anti-XSRF technique, the application server sends a randomly
generated authentication token in a cookie.
The client code reads the cookie and adds a custom request header with the token in all subsequent requests.
The server compares the received cookie value to the request header value and rejects the request if the values are missing or don't match.

This technique is effective because all browsers implement the _same origin policy_. Only code from the website
on which cookies are set can read the cookies from that site and set custom headers on requests to that site.
That means only your application can read this cookie token and set the custom header. The malicious code on `evil.com` can't.

Angular's `HttpClient` has built-in support for the client-side half of this technique. Read about it more in the [HttpClient guide](/guide/http).

For information about CSRF at the Open Web Application Security Project (OWASP), see
<a href="https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29">Cross-Site Request Forgery (CSRF)</a> and
<a href="https://www.owasp.org/index.php/CSRF_Prevention_Cheat_Sheet">Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet</a>.
The Stanford University paper
<a href="https://seclab.stanford.edu/websec/csrf/csrf.pdf">Robust Defenses for Cross-Site Request Forgery</a> is a rich source of detail.

See also Dave Smith's easy-to-understand
<a href="https://www.youtube.com/watch?v=9inczw6qtpY" title="Cross Site Request Funkery Securing Your Angular Apps From Evil Doers">talk on XSRF at AngularConnect 2016</a>.


<h3 id='xssi'>
  Cross-site script inclusion (XSSI)
</h3>



Cross-site script inclusion, also known as JSON vulnerability, can allow an attacker's website to
read data from a JSON API. The attack works on older browsers by overriding native JavaScript
object constructors, and then including an API URL using a `<script>` tag.

This attack is only successful if the returned JSON is executable as JavaScript. Servers can
prevent an attack by prefixing all JSON responses to make them non-executable, by convention, using the
well-known string `")]}',\n"`.

Angular's `HttpClient` library recognizes this convention and automatically strips the string
`")]}',\n"` from all responses before further parsing.

For more information, see the XSSI section of this [Google web security blog
post](https://security.googleblog.com/2011/05/website-security-for-webmasters.html).



<h2 id='code-review'>
  Auditing Angular applications
</h2>



Angular applications must follow the same security principles as regular web applications, and
must be audited as such. Angular-specific APIs that should be audited in a security review,
such as the [_bypassSecurityTrust_](guide/security#bypass-security-apis) methods, are marked in the documentation
as security sensitive.
