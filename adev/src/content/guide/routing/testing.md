# Тестирование маршрутизации и навигации {#testing-routing-and-navigation}

Тестирование маршрутизации и навигации необходимо для обеспечения правильного поведения приложения при навигации пользователей между различными маршрутами. Это руководство охватывает различные стратегии тестирования функциональности маршрутизации в Angular-приложениях.

## Предварительные требования {#prerequisites}

Это руководство предполагает знакомство со следующими инструментами и библиотеками:

- **[Vitest](https://vitest.dev/)** — фреймворк тестирования JavaScript, предоставляющий синтаксис тестирования (`describe`, `it`, `expect`)
- **[Angular Testing Utilities](guide/testing)** — встроенные инструменты тестирования Angular ([`TestBed`](api/core/testing/TestBed), [`ComponentFixture`](api/core/testing/ComponentFixture))
- **[`RouterTestingHarness`](api/router/testing/RouterTestingHarness)** — тестовый жгут для тестирования компонентов маршрутов со встроенными возможностями навигации и тестирования компонентов

## Сценарии тестирования {#testing-scenarios}

### Параметры маршрута {#route-parameters}

Компоненты часто зависят от параметров маршрута в URL для получения данных, например идентификатора пользователя для страницы профиля.

Следующий пример показывает, как тестировать Компонент `UserProfile`, отображающий идентификатор пользователя из маршрута.

```ts { header: 'user-profile.spec.ts'}
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {UserProfile} from './user-profile';

describe('UserProfile', () => {
  it('should display user ID from route parameters', async () => {
    TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [provideRouter([{path: 'user/:id', component: UserProfile}])],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/user/123', UserProfile);

    expect(harness.routeNativeElement?.textContent).toContain('User Profile: 123');
  });
});
```

```angular-ts {header: 'user-profile.ts'}
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  template: '<h1>User Profile: {{userId}}</h1>',
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  userId: string | null = this.route.snapshot.paramMap.get('id');
}
```

### Guard маршрутов {#route-guards}

Guard маршрутов управляют доступом к маршрутам на основе условий, таких как аутентификация или разрешения. При тестировании Guard сосредоточьтесь на имитации зависимостей и проверке результатов навигации.

Следующий пример тестирует `authGuard`, который разрешает навигацию для аутентифицированных пользователей и перенаправляет неаутентифицированных на страницу входа.

```ts {header: 'auth.guard.spec.ts'}
import {vi, type Mocked} from 'vitest';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter, Router} from '@angular/router';
import {authGuard} from './auth.guard';
import {AuthStore} from './auth-store';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

@Component({template: '<h1>Protected Page</h1>'})
class Protected {}

@Component({template: '<h1>Login Page</h1>'})
class Login {}

describe('authGuard', () => {
  let authStore: Mocked<AuthStore>;
  let harness: RouterTestingHarness;

  async function setup(isAuthenticated: boolean) {
    authStore = {isAuthenticated: vi.fn().mockReturnValue(isAuthenticated)} as Mocked<AuthStore>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthStore, useValue: authStore},
        provideRouter([
          {path: 'protected', component: Protected, canActivate: [authGuard]},
          {path: 'login', component: Login},
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  }

  it('allows navigation when user is authenticated', async () => {
    await setup(true);
    await harness.navigateByUrl('/protected', Protected);
    // Защищённый компонент должен отображаться при аутентификации
    expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
  });

  it('redirects to login when user is not authenticated', async () => {
    await setup(false);
    await harness.navigateByUrl('/protected', Login);
    // Компонент входа должен отображаться после перенаправления
    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
  });
});
```

```ts {header: 'auth.guard.ts'}
import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStore} from './auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? true : router.parseUrl('/login');
};
```

### Router Outlet {#router-outlets}

Тесты router outlet — это больше интеграционные тесты, поскольку вы по существу тестируете интеграцию между [`Router`](api/router/Router), outlet и отображаемыми компонентами.

Вот пример настройки теста, проверяющего, что для разных маршрутов отображаются разные компоненты:

```ts {header: 'app.spec.ts'}
import {TestBed} from '@angular/core/testing';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Component} from '@angular/core';
import {App} from './app';

@Component({
  template: '<h1>Home Page</h1>',
})
class MockHome {}

@Component({
  template: '<h1>About Page</h1>',
})
class MockAbout {}

describe('App Router Outlet', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          {path: '', component: MockHome},
          {path: 'about', component: MockAbout},
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should display home component for default route', async () => {
    await harness.navigateByUrl('');

    expect(harness.routeNativeElement?.textContent).toContain('Home Page');
  });

  it('should display about component for about route', async () => {
    await harness.navigateByUrl('/about');

    expect(harness.routeNativeElement?.textContent).toContain('About Page');
  });
});
```

```angular-ts {header: 'app.ts'}
import {Component} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
```

### Вложенные маршруты {#nested-routes}

Тестирование вложенных маршрутов гарантирует, что родительские и дочерние компоненты правильно отображаются при навигации к вложенным URL. Это важно, поскольку вложенные маршруты включают несколько уровней.

Необходимо проверить:

1. Родительский компонент отображается корректно.
2. Дочерний компонент отображается внутри него.
3. Оба компонента имеют доступ к своим соответствующим данным маршрута.

Вот пример тестирования структуры маршрутов «родитель-потомок»:

```ts {header: 'nested-routes.spec.ts'}
import {TestBed} from '@angular/core/testing';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Parent, Child} from './nested-components';

describe('Nested Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Parent, Child],
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: Parent,
            children: [{path: 'child', component: Child}],
          },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should render parent and child components for nested route', async () => {
    await harness.navigateByUrl('/parent/child');

    expect(harness.routeNativeElement?.textContent).toContain('Parent Component');
    expect(harness.routeNativeElement?.textContent).toContain('Child Component');
  });
});
```

```angular-ts {header: 'nested.ts'}
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Parent Component</h1>
    <router-outlet />
  `,
})
export class Parent {}

@Component({
  template: '<h2>Child Component</h2>',
})
export class Child {}
```

### Параметры запроса и фрагменты {#query-parameters-and-fragments}

Параметры запроса (например, `?search=angular&category=web`) и фрагменты URL (например, `#section1`) предоставляют дополнительные данные через URL, не влияя на то, какой компонент загружается, но влияя на поведение компонента. Компоненты, читающие параметры запроса через [`ActivatedRoute.queryParams`](api/router/ActivatedRoute#queryParams), необходимо тестировать для обеспечения правильной обработки различных сценариев параметров.

В отличие от параметров маршрута, являющихся частью определения маршрута, параметры запроса необязательны и могут изменяться без инициирования навигации по маршруту. Это означает, что нужно тестировать как начальную загрузку, так и реактивные обновления при изменении параметров запроса.

Вот пример тестирования параметров запроса и фрагментов:

```ts {header: 'search.spec.ts'}
import {TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {Search} from './search';

describe('Search', () => {
  let component: Search;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRouter([{path: 'search', component: Search}])],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should read search term from query parameters', async () => {
    component = await harness.navigateByUrl('/search?q=angular', Search);

    expect(component.searchTerm()).toBe('angular');
  });
});
```

```angular-ts {header: 'search.ts'}
import {Component, inject, computed} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: '<div>Search term: {{searchTerm()}}</div>',
})
export class Search {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, {initialValue: {}});

  searchTerm = computed(() => this.queryParams()['q'] || null);
}
```

## Лучшие практики тестирования Роутера {#best-practices-for-router-testing}

1. **Используйте RouterTestingHarness** — для тестирования компонентов маршрутов используйте [`RouterTestingHarness`](api/router/testing/RouterTestingHarness), который предоставляет более чистый API и устраняет необходимость в компонентах-хостах для тестирования. Он обеспечивает прямой доступ к компонентам, встроенную навигацию и лучшую типобезопасность. Однако он не подходит для некоторых сценариев, например тестирования именованных outlet, где может потребоваться создание пользовательских компонентов-хостов.
2. **Обдуманно обрабатывайте внешние зависимости** — по возможности предпочитайте реальные реализации для более реалистичных тестов. Если реальные реализации неосуществимы (например, внешние API), используйте заглушки, приближённые к реальному поведению. Используйте моки или стабы только в крайнем случае, так как они могут делать тесты хрупкими и менее надёжными.
3. **Тестируйте состояние навигации** — проверяйте как само действие навигации, так и результирующее состояние приложения, включая изменения URL и отображение компонентов.
4. **Обрабатывайте асинхронные операции** — навигация Роутера является асинхронной. Используйте `async/await` для правильной обработки времени в тестах.
5. **Тестируйте сценарии ошибок** — включайте тесты для недопустимых маршрутов, неудавшейся навигации и отказов Guard, чтобы убедиться, что приложение корректно обрабатывает крайние случаи.
6. **Не мокайте Angular Router** — вместо этого предоставляйте реальные конфигурации маршрутов и используйте жгут для навигации. Это делает тесты более надёжными и менее подверженными поломке при внутренних обновлениях Angular, а также гарантирует обнаружение реальных проблем при обновлении Роутера, поскольку моки могут скрывать критические изменения.
