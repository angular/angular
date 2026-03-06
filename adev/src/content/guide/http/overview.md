# Взаимодействие с бэкенд-сервисами через HTTP {#communicating-with-backend-services-using-http}

Большинству фронтенд-приложений необходимо взаимодействовать с сервером по протоколу HTTP для загрузки или отправки
данных и доступа к другим бэкенд-сервисам. Angular предоставляет клиентский HTTP API для приложений Angular — класс
сервиса `HttpClient` в пакете `@angular/common/http`.

## Возможности HTTP-клиента {#httpclient-features}

Сервис HTTP-клиента предлагает следующие основные возможности:

- Возможность запрашивать [типизированные значения ответа](guide/http/making-requests#fetching-json-data)
- Упрощенная [обработка ошибок](guide/http/making-requests#handling-request-failure)
- [Перехват](guide/http/interceptors) запросов и ответов
- Надежные [утилиты для тестирования](guide/http/testing)

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/http/setup" title="Настройка HttpClient"/>
  <docs-pill href="guide/http/making-requests" title="Выполнение HTTP-запросов"/>
</docs-pill-row>
