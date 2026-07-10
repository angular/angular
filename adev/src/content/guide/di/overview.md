<docs-decorative-header title="Внедрение зависимостей в Angular" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->

Внедрение зависимостей (DI) — это паттерн проектирования, с помощью которого вы организуете и переиспользуете код в приложении: зависимости передаются классу извне, а не создаются внутри него.
</docs-decorative-header>

TIP: Перед этим подробным руководством ознакомьтесь с разделом [Основы](essentials/dependency-injection).

По мере роста приложения разработчикам часто нужно переиспользовать функциональность в разных частях кодовой базы. [Внедрение зависимостей (DI)](https://en.wikipedia.org/wiki/Dependency_injection) помогает в этом: зависимости предоставляются классу вместо создания их напрямую внутри него. Так части приложения становятся более переиспользуемыми и проще в сопровождении.

Внедрение зависимостей популярно, потому что помогает решать типичные задачи:

- **Улучшенная сопровождаемость кода**: DI способствует чёткому разделению ответственности, упрощает рефакторинг и снижает дублирование.
- **Масштабируемость**: модульную функциональность можно переиспользовать в разных частях приложения.
- **Удобнее тестирование**: в unit-тестах вместо реальных реализаций можно подставлять [тестовые двойники](https://en.wikipedia.org/wiki/Test_double).

## Как работает внедрение зависимостей в Angular? {#how-does-dependency-injection-work-in-angular}

Зависимость — это любой объект, значение, функция или сервис, которые нужны классу для работы, но которые он не создаёт сам. Их предоставляют извне, формируя явные связи между частями приложения.

С системой внедрения зависимостей вы взаимодействуете двумя основными способами:

- Можно _предоставить_ (provide) значения — сделать их доступными.
- Можно _внедрить_ (inject) эти значения как зависимости.

В этом контексте «значения» — любые значения JavaScript: объекты, функции или экземпляры классов. Типичные внедряемые зависимости:

- **Конфигурационные значения**: константы окружения, URL API, feature flags и т.п.
- **Фабрики**: функции, создающие объекты или значения в зависимости от условий во время выполнения
- **Сервисы**: классы с общей функциональностью, бизнес-логикой или состоянием

Компоненты и директивы Angular автоматически участвуют в DI: в них можно внедрять зависимости и делать их доступными для внедрения.

## Что такое сервисы? {#what-are-services}

_Сервис_ Angular — это класс TypeScript с декоратором `@Service`, экземпляр которого можно внедрять как зависимость. Сервисы — самый распространённый способ делиться данными и функциональностью в приложении.

Типичные виды сервисов:

- **Клиенты данных:** абстрагируют запросы к серверу для получения и изменения данных
- **Управление состоянием:** определяют состояние, общее для нескольких компонентов или страниц
- **Аутентификация и авторизация:** управляют входом пользователя, хранением токенов и контролем доступа
- **Логирование и обработка ошибок:** задают общий API для логов или сообщения об ошибках пользователю
- **Обработка и рассылка событий:** обрабатывают события, не привязанные к конкретному компоненту, или рассылают уведомления компонентам по [паттерну наблюдателя](https://en.wikipedia.org/wiki/Observer_pattern)
- **Утилиты:** переиспользуемые функции форматирования, валидации или вычислений

В следующем примере объявлен сервис `AnalyticsLogger`:

```ts
import {Service} from '@angular/core';

@Service()
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {
      category,
      value,
      timestamp: new Date().toISOString(),
    });
  }
}
```

NOTE: `@Service` делает сервис доступным во всём приложении как синглтон. Это рекомендуемый подход для большинства сервисов.

HELPFUL: Декоратор [`@Service`](guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator) — удобный сокращённый вариант для `@Injectable({providedIn: 'root'})`.

## Внедрение зависимостей с помощью `inject()` {#injecting-dependencies-with-inject}

Зависимости можно внедрять функцией Angular `inject()`.

Ниже пример панели навигации, которая внедряет `AnalyticsLogger` и сервис Angular `Router`, чтобы пользователь мог перейти на другую страницу с отслеживанием события.

```angular-ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AnalyticsLogger} from './analytics-logger';

@Component({
  selector: 'app-navbar',
  template: `<a href="#" (click)="navigateToDetail($event)">Detail Page</a>`,
})
export class Navbar {
  private router = inject(Router);
  private analytics = inject(AnalyticsLogger);

  navigateToDetail(event: Event) {
    event.preventDefault();
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

### Где можно вызывать `inject()`? {#where-can-inject-be-used}

Зависимости можно внедрять при создании компонента, директивы или сервиса. Вызов [`inject`](/api/core/inject) допустим в `constructor` или в инициализаторе поля. Типичные примеры:

```ts
@Component(/* ... */)
export class MyComponent {
  // ✅ In class field initializer
  private service = inject(MyService);

  // ✅ In constructor body
  private anotherService: MyService;

  constructor() {
    this.anotherService = inject(MyService);
  }
}
```

```ts
@Directive({...})
export class MyDirective {
  // ✅ In class field initializer
  private element = inject(ElementRef);
}
```

```ts
import {Service, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Service()
export class MyService {
  // ✅ In a service
  private http = inject(HttpClient);
}
```

```ts
export const authGuard = () => {
  // ✅ In a route guard
  const auth = inject(AuthService);
  return auth.isAuthenticated();
};
```

Angular использует термин «контекст внедрения» (injection context) для любого места в коде, где можно вызвать [`inject`](/api/core/inject). Чаще всего это создание компонента, директивы или сервиса; подробнее см. [контексты внедрения](/guide/di/dependency-injection-context).

Дополнительно см. [документацию API inject](api/core/inject#usage-notes).

## Следующие шаги {#next-steps}

Когда основы внедрения зависимостей в Angular понятны, можно переходить к созданию собственных сервисов.

Следующее руководство, [Создание и использование сервисов](guide/di/creating-and-using-services), покажет:

- Как создать сервис через Angular CLI или вручную
- Как работает паттерн `providedIn: 'root'`
- Как внедрять сервисы в компоненты и другие сервисы

Это покрывает самый распространённый сценарий использования сервисов в приложениях Angular.
