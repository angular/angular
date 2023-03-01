# HTTP client - Security: Cross-Site Request Forgery (XSRF) protection

[Cross-Site Request Forgery (XSRF or CSRF)](https://en.wikipedia.org/wiki/Cross-site_request_forgery) is an attack technique by which the attacker can trick an authenticated user into unknowingly executing actions on your website.

`HttpClient` supports a [common mechanism](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-header_token) used to prevent XSRF attacks.
When performing HTTP requests, an interceptor reads a token from a cookie, by default `XSRF-TOKEN`, and sets it as an HTTP header, `X-XSRF-TOKEN`.
Because only code that runs on your domain could read the cookie, the backend can be certain that the HTTP request came from your client application and not an attacker.

By default, an interceptor sends this header on all mutating requests \(such as POST\)
to relative URLs, but not on GET/HEAD requests or on requests with an absolute URL.

To take advantage of this, your server needs to set a token in a JavaScript readable session cookie called `XSRF-TOKEN` on either the page load or the first GET request.
On subsequent requests the server can verify that the cookie matches the `X-XSRF-TOKEN` HTTP header, and therefore be sure that only code running on your domain could have sent the request.
The token must be unique for each user and must be verifiable by the server; this prevents the client from making up its own tokens.
Set the token to a digest of your site's authentication cookie with a salt for added security.

To prevent collisions in environments where multiple Angular apps share the same domain or subdomain, give each application a unique cookie name.

<div class="alert is-important">

*`HttpClient` supports only the client half of the XSRF protection scheme.*
Your backend service must be configured to set the cookie for your page, and to verify that the header is present on all eligible requests.
Failing to do so renders Angular's default protection ineffective.

</div>

## Configure custom cookie/header names

If your backend service uses different names for the XSRF token cookie or header, use `HttpClientXsrfModule.withOptions()` to override the defaults.

<code-example path="http/src/app/app.module.ts" region="xsrf"></code-example>

<a id="testing-requests"></a>

@reviewed 2022-11-14
