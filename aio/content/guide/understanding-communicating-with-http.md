# Understanding communicating with backend services using HTTP

Most front-end applications need to communicate with a server over the HTTP protocol, to download or upload data and access other back-end services. Angular provides a client HTTP API for Angular applications, the `HttpClient` service class in `@angular/common/http`.

## Prerequisites

Before working with the `HttpClientModule`, you should have a basic understanding of the following:

*   TypeScript programming
*   Usage of the HTTP protocol
*   Angular application-design fundamentals, as described in [Angular Concepts](guide/architecture)
*   Observable techniques and operators.
    See the [Observables guide](guide/observables).

## HTTP client service features

The HTTP client service offers the following major features.

*   The ability to request [typed response objects](guide/http-request-data-from-server)
*   Streamlined [error handling](guide/http-handle-request-errors)
*   [Testability](guide/http-test-requests) features
*   Request and response [interception](guide/http-intercept-requests-and-responses)

## What's next

* [Setup for server communication](guide/http-server-communication)

@reviewed 2023-03-14
