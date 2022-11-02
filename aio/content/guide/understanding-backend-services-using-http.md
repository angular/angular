# Understanding communicating with backend services using HTTP

Most front-end applications need to communicate with a server over the HTTP protocol, to download or upload data and access other back-end services.
Angular provides a client HTTP API for Angular applications, the `HttpClient` service class in `@angular/common/http`.

## Prerequisites

Before working with the `HttpClientModule`, you should have a basic understanding of the following:

*   TypeScript programming
*   Usage of the HTTP protocol
*   Angular application-design fundamentals, as described in [Angular Concepts](guide/architecture)
*   Observable techniques and operators.
    See the [Observables](guide/observables) guide.

## HTTP client service features

The HTTP client service offers the following major features.

*   The ability to request [typed response objects](#typed-response)
*   Streamlined [error handling](#error-handling)
*   [Testability](#testing-requests) features
*   Request and response [interception](#intercepting-requests-and-responses)

@reviewed 2022-11-01
