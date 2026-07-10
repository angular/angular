# WebMCP

Web Model Context Protocol (WebMCP) — [формирующийся веб-стандарт](https://github.com/webmachinelearning/webmcp/), который позволяет веб-приложениям предоставлять структурированные инструменты напрямую ИИ-агентам, работающим нативно в браузере. Инструменты, определённые приложением, дают ИИ-ассистентам возможность взаимодействовать с ним напрямую, расширяя возможности агента и снижая потребность во взаимодействии с DOM.

Например, приложение регистрации нового пользователя может предоставить инструмент WebMCP, чтобы ИИ-агент браузера создал пользователя напрямую, а не проходил сложный мастер через DOM.

Angular предоставляет экспериментальную поддержку WebMCP: можно легко регистрировать инструменты, привязанные к жизненному циклу внедрения зависимостей приложения, и автоматически превращать Signal Forms в инструменты, готовые для ИИ.

IMPORTANT: Спецификация WebMCP находится на очень ранней стадии и часто меняется. Поэтому поддержка WebMCP в Angular сейчас [**экспериментальная**](reference/releases#experimental). API могут меняться даже вне major-версий.

## Предоставление инструментов для приложения {#provide-tools-for-the-application}

Используйте [`provideExperimentalWebMcpTools`](api/core/provideExperimentalWebMcpTools) в конфигурации приложения, чтобы зарегистрировать инструменты на весь жизненный цикл приложения. Такие инструменты автоматически регистрируются при инициализации и снимаются с регистрации при уничтожении приложения.

Колбэк `execute` вызывается в контексте внедрения связанного `Injector`, то есть сервисы можно [`inject`](api/core/inject) напрямую.

```ts {header:"main.ts"}
import {Service, inject, provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

@Service()
class Greeter {
  sayHello(): string {
    return 'Hello agent!';
  }
}

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'greet',
        description: 'Greets the agent.',
        inputSchema: {type: 'object', properties: {}},
        execute: () => {
          const greeter = inject(Greeter);

          return {content: [{type: 'text', text: greeter.sayHello()}]};
        },
      },
    ]),
  ],
});
```

### Определение параметров инструмента {#define-tool-parameters}

Если инструменту нужен ввод от ИИ-ассистента, опишите ожидаемые аргументы в `inputSchema` синтаксисом [JSON Schema](https://json-schema.org/). Angular автоматически выводит типы параметров, передаваемых в колбэк `execute`, на основе схемы.

```ts {header:"main.ts"}
import {provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'searchCatalog',
        description: 'Searches the store catalog for products matching a query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search keywords.',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return.',
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
        execute: ({query, maxResults}) => {
          // Type of `query` is inferred as `string`.
          // Type of `maxResults` is inferred as `number | undefined`.

          // Consider validating this at runtime, since inputs may not be validated to match the schema.
          if (typeof query !== 'string') throw new Error(`Bad query: ${query}`);
          if (typeof maxResults !== 'number' && maxResults !== undefined)
            throw new Error(`Bad maxResults: ${maxResults}`);

          const limit = maxResults ?? 5;
          return {
            content: [{type: 'text', text: `Returning up to ${limit} results for "${query}".`}],
          };
        },
      },
    ]),
  ],
});
```

TIP: Используйте `required: ['param1', 'param2', ...]`, чтобы убрать `undefined` из типов этих параметров, и `additionalProperties: false`, чтобы ограничить тип объекта аргументов только этими параметрами.

## Предоставление инструментов для маршрута {#provide-tools-for-a-route}

В сложных приложениях некоторые инструменты могут быть нужны только на определённых маршрутах. Это достигается предоставлением инструментов прямо в определениях маршрутов.

```ts {header:"routes.ts"}
import {provideExperimentalWebMcpTools} from '@angular/core';
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then((m) => m.Dashboard),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'exportDashboardReports',
          description: 'Exports the current dashboard analytics.',
          inputSchema: {type: 'object', properties: {}},
          execute: () => ({
            content: [{type: 'text', text: 'Dashboard export successfully triggered.'}],
          }),
        },
      ]),
    ],
  },
];
```

NOTE: При регистрации инструментов на конкретном маршруте рассмотрите настройку роутера с [`withExperimentalAutoCleanupInjectors`](api/router/withExperimentalAutoCleanupInjectors), чтобы инструменты автоматически _снимались с регистрации_, когда пользователь уходит с маршрута. Без этой опции инструменты WebMCP, объявленные на маршрутах, останутся доступны ИИ-агентам даже после перехода на другой маршрут.

```ts {header:"app.config.ts"}
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';
import {routes} from './routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withExperimentalAutoCleanupInjectors())],
};
```

## Предоставление инструментов в сервисах {#provide-tools-within-services}

Для динамических сценариев функция [`declareExperimentalWebMcpTool`](api/core/declareExperimentalWebMcpTool) регистрирует инструмент прямо в контексте внедрения и автоматически снимает его с регистрации при уничтожении этого контекста.

```ts {header:"counter.ts"}
import {Service, declareExperimentalWebMcpTool, signal, inject} from '@angular/core';

@Service()
export class Counter {
  readonly count = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the global counter.',
      inputSchema: {type: 'object', properties: {}},
      execute: () => ({
        content: [{type: 'text', text: `The count is: ${this.count()}.`}],
      }),
    });
  }
}
```

Хотя `declareExperimentalWebMcpTool` работает в любом контексте внедрения, следите за [коллизиями имён](#name-collisions) и предпочтительно используйте его в root-сервисах.

## Неявные инструменты в Signal Forms {#implicit-tools-in-signal-forms}

Инструмент WebMCP можно создать неявно из существующей Angular [Signal Form](essentials/signal-forms) с минимальной конфигурацией. Angular преобразует модели форм в богатые инструменты WebMCP, эффективно поддерживая высокодинамичные формы без ручного написания JSON-схем или обработчиков событий.

### Включение функции WebMCP forms {#enable-the-webmcp-forms-feature}

Сначала добавьте [`provideExperimentalWebMcpForms`](api/forms/signals/provideExperimentalWebMcpForms) в корневые провайдеры приложения:

```ts {header:"main.ts"}
import {bootstrapApplication} from '@angular/platform-browser';
import {provideExperimentalWebMcpForms} from '@angular/forms/signals';
import {AppRoot} from './app-root';

bootstrapApplication(AppRoot, {
  providers: [provideExperimentalWebMcpForms()],
});
```

### Подключение Signal Form {#opt-in-a-signal-form}

Затем при определении Signal Form через [`form`](api/forms/signals/form) передайте опцию конфигурации `experimentalWebMcpTool`, чтобы включить неявный инструмент WebMCP. Angular проинспектирует модель данных формы и автоматически сгенерирует JSON-схему для подключённых ИИ-агентов.

```ts {header:"user-registration.ts"}
import {Component, signal} from '@angular/core';
import {form, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
})
export class UserRegistration {
  private readonly model = signal({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly userForm = form(
    this.model,
    (f) => {
      required(f.firstName, {message: 'First name is mandatory.'});
      required(f.lastName, {message: 'Last name is mandatory.'});
    },
    {
      // Implicitly registers a WebMCP tool named `registerUser` with parameters derived from `model`.
      experimentalWebMcpTool: {
        name: 'registerUser',
        description: 'Registers a new user.',
      },
      submission: {
        action: async (formValue) => {
          console.log('Submitting user:', formValue);
          // ...
        },
      },
    },
  );
}
```

В этом примере Angular генерирует инструмент WebMCP с JSON-схемой, которая:

1. включает `firstName`, `lastName`, `age` и `hobbies` как параметры, выведенные из начального значения сигнала `model`;
2. определяет `firstName` и `lastName` как _обязательные_ поля на основе валидатора [`required`](api/forms/signals/required);
3. определяет `hobbies` как массив строк, позволяя агенту передать произвольное число хобби.

Помимо вывода схемы ввода, Angular также связывает инструмент WebMCP с логикой валидации формы и обработчиком отправки. Агент увидит ошибки валидации от своих входных данных или сбои при отправке и сможет скорректироваться и повторить попытку.

NOTE: Асинхронные валидаторы _не_ запускаются и должны обрабатываться в action отправки.

#### Ограничения {#constraints}

Angular выводит схему WebMCP из начального значения модели формы. Для этого нужны:

- Конкретные начальные значения (`''`, `0`, `false`): типы данных нельзя вывести из `null` или `undefined`.
- Непустые массивы (`['Hello!']`): тип нельзя вывести из пустого массива — нужно хотя бы одно начальное значение.

## Лучшие практики {#best-practices}

Учитывайте следующие рекомендации:

### Коллизии имён {#name-collisions}

WebMCP требует уникального имени у каждого инструмента и выбросит ошибку, если одно и то же имя зарегистрировано несколько раз. Поэтому вызов `declareExperimentalWebMcpTool` или `provideExperimentalWebMcpTools` в контексте, где регистрация может произойти повторно (например, в конструкторе компонента), может привести к ошибкам во время выполнения.

Предпочтительно размещать инструменты на провайдерах приложения, маршрута или root-сервисах. Если инструменты на компоненте, включая [неявные инструменты в Signal Forms](#implicit-tools-in-signal-forms), убедитесь, что компонент одновременно отображается на странице не более _одного_ раза.

### Валидация входных данных инструментов {#validate-tool-inputs}

Angular не выполняет неявную проверку того, что входные данные агента действительно соответствуют определённой JSON-схеме. Явно валидируйте аргументы функции `execute` перед использованием, чтобы обеспечить надёжность.

### Тестирование {#testing}

Для unit-тестов инструментов рассмотрите mock-реализацию WebMCP вроде [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill).
