# Взаимодействие с backend-сервисами по HTTP

Большинству front-end приложений нужно общаться с сервером по протоколу HTTP, чтобы загружать или отправлять данные и обращаться к другим backend-сервисам. Angular предоставляет клиентский HTTP API для приложений Angular — класс сервиса `HttpClient` в `@angular/common/http`.

## Возможности HTTP-клиентского сервиса {#http-client-service-features}

HTTP-клиентский сервис предлагает следующие основные возможности:

- Возможность запрашивать [типизированные значения ответа](guide/http/making-requests#fetching-json-data)
- Упрощённая [обработка ошибок](guide/http/making-requests#handling-request-failure)
- [Перехват](guide/http/interceptors) запросов и ответов
- Надёжные [утилиты для тестирования](guide/http/testing)

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/http/setup" title="Setting up HttpClient"/>
  <docs-pill href="guide/http/making-requests" title="Making HTTP requests"/>
</docs-pill-row>
