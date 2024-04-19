# Understanding communicating with backend services using HTTP

Most front-end applications need to communicate with a server over the HTTP protocol, to download or upload data and access other back-end services. Angular provides a client HTTP API for Angular applications, the `HttpClient` service class in `@angular/common/http`.

## HTTP client service features

The HTTP client service offers the following major features:

* The ability to request [typed response values](guide/http/making-requests#fetching-json-data)
* Streamlined [error handling](guide/http/making-requests#handling-request-failure)
* Request and response [interception](guide/http/interceptors)
* Robust [testing utilities](guide/http/testing)

## What's next

<docs-pill-row>
  <docs-pill href="guide/http/setup" title="Setting up HttpClient"/>
  <docs-pill href="guide/http/making-requests" title="Making HTTP requests"/>
</docs-pill-row>
