# Тестирование маршрутизации и навигации

Тестирование маршрутизации и навигации необходимо для того, чтобы убедиться, что ваше приложение ведет себя корректно,
когда пользователи переходят между различными маршрутами. В этом руководстве рассматриваются различные стратегии
тестирования функциональности маршрутизации в приложениях Angular.

## Предварительные требования

Это руководство предполагает, что вы знакомы со следующими инструментами и библиотеками:

- **[Jasmine](https://jasmine.github.io/)** — фреймворк для тестирования JavaScript, предоставляющий синтаксис для
  тестов (`describe`, `it`, `expect`)
- **[Karma](https://karma-runner.github.io/)** — инструмент для запуска тестов (test runner), который выполняет тесты в
  браузерах
- **[Утилиты тестирования Angular](guide/testing)** — встроенные инструменты тестирования Angular ([
  `TestBed`](api/core/testing/TestBed), [`ComponentFixture`](api/core/testing/ComponentFixture))
- **[`RouterTestingHarness`](api/router/testing/RouterTestingHarness)** — инструментарий для тестирования
  маршрутизируемых компонентов со встроенными возможностями навигации и тестирования компонентов

## Сценарии тестирования

### Параметры маршрута

Компоненты часто полагаются на параметры маршрута из URL для получения данных, например, идентификатора пользователя для
страницы профиля.

В следующем примере показано, как протестировать компонент `UserProfile`, который отображает идентификатор пользователя,
полученный из маршрута.

```ts
// user-profile.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { UserProfile } from './user-profile';

describe('UserProfile', () => {
  it('should display user ID from route parameters', async () => {
    TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        provideRouter([
          { path: 'user/:id', component: UserProfile }
        ])
      ]
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/user/123', UserProfile);

    expect(harness.routeNativeElement?.textContent).toContain('User Profile: 123');
  });
});
```

```angular-ts
// user-profile.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: '<h1>User Profile: {{userId}}</h1>'
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  userId: string | null = this.route.snapshot.paramMap.get('id');
}
```

### Guard-ы маршрутов

Guard-ы (защитники) маршрутов управляют доступом к маршрутам на основе определенных условий, таких как аутентификация
или права доступа. При тестировании Guard-ов сосредоточьтесь на моках зависимостей и проверке результатов навигации.

В следующем примере тестируется `authGuard`, который разрешает навигацию для аутентифицированных пользователей и
перенаправляет неаутентифицированных пользователей на страницу входа.

```ts
// auth.guard.spec.ts
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth-store';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({ template: '<h1>Protected Page</h1>' })
class ProtectedComponent {}

@Component({ template: '<h1>Login Page</h1>' })
class LoginComponent {}

describe('authGuard', () => {
  let authStore: jasmine.SpyObj<AuthStore>;
  let harness: RouterTestingHarness;

  async function setup(isAuthenticated: boolean) {
    authStore = jasmine.createSpyObj('AuthStore', ['isAuthenticated']);
    authStore.isAuthenticated.and.returnValue(isAuthenticated);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        provideRouter([
          { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] },
          { path: 'login', component: LoginComponent },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  }

  it('allows navigation when user is authenticated', async () => {
    await setup(true);
    await harness.navigateByUrl('/protected', ProtectedComponent);
    // The protected component should render when authenticated
    expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
  });

  it('redirects to login when user is not authenticated', async () => {
    await setup(false);
    await harness.navigateByUrl('/protected', LoginComponent);
    // The login component should render after redirect
    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
  });
});
```

```ts
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? true : router.parseUrl('/login');
};
```

### Router Outlet

Тесты с использованием Router Outlet — это, по сути, интеграционные тесты, поскольку вы проверяете взаимодействие
между [`Router`](api/router/Router), самим outlet-ом и отображаемыми компонентами.

Вот пример настройки теста, который проверяет, что для разных маршрутов отображаются разные компоненты:

```ts
// app.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { App } from './app';

@Component({
  template: '<h1>Home Page</h1>'
})
class MockHome {}

@Component({
  template: '<h1>About Page</h1>'
})
class MockAbout {}

describe('App Router Outlet', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: MockHome },
          { path: 'about', component: MockAbout }
        ])
      ]
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

```angular-ts
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet />
  `
})
export class App {}
```

### Вложенные маршруты

Тестирование вложенных маршрутов гарантирует, что и родительский, и дочерний компоненты рендерятся корректно при
переходе по вложенным URL. Это важно, так как вложенные маршруты подразумевают несколько уровней.

Вам необходимо проверить, что:

1. Родительский компонент рендерится должным образом.
2. Дочерний компонент рендерится внутри него.
3. Оба компонента имеют доступ к своим соответствующим данным маршрута.

Вот пример тестирования структуры маршрутов «родитель-потомок»:

```ts
// nested-routes.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Parent, Child } from './nested-components';

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
            children: [
              { path: 'child', component: Child }
            ]
          }
        ])
      ]
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

```angular-ts
// nested-components.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Parent Component</h1>
    <router-outlet />
  `
})
export class Parent {}

@Component({
  template: '<h2>Child Component</h2>'
})
export class Child {}
```

### Параметры запроса и фрагменты

Параметры запроса (например, `?search=angular&category=web`) и фрагменты URL (например, `#section1`) предоставляют
дополнительные данные через URL, которые не влияют на то, какой компонент загружается, но влияют на поведение
компонента. Компоненты, которые считывают параметры запроса через [
`ActivatedRoute.queryParams`](api/router/ActivatedRoute#queryParams), должны быть протестированы, чтобы убедиться, что
они корректно обрабатывают различные сценарии параметров.

В отличие от параметров маршрута, которые являются частью определения маршрута, параметры запроса необязательны и могут
изменяться без запуска навигации по маршруту. Это означает, что вам нужно тестировать как начальную загрузку, так и
реактивные обновления при изменении параметров запроса.

Вот пример того, как тестировать параметры запроса и фрагменты:

```ts
// search.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Search } from './search';

describe('Search', () => {
  let component: Search;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideRouter([
          { path: 'search', component: Search }
        ])
      ]
    });

    harness = await RouterTestingHarness.create();
  });

  it('should read search term from query parameters', async () => {
    component = await harness.navigateByUrl('/search?q=angular', Search);

    expect(component.searchTerm()).toBe('angular');
  });
});
```

```angular-ts
// search.component.ts
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  template: '<div>Search term: {{searchTerm()}}</div>'
})
export class Search {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  searchTerm = computed(() => this.queryParams()['q'] || null);
}
```

## Лучшие практики тестирования роутера

1. **Используйте RouterTestingHarness** — Для тестирования маршрутизируемых компонентов используйте [
   `RouterTestingHarness`](api/router/testing/RouterTestingHarness), который предоставляет более чистый API и устраняет
   необходимость в тестовых хост-компонентах. Он предлагает прямой доступ к компонентам, встроенную навигацию и лучшую
   типобезопасность. Однако он может не подходить для некоторых сценариев, таких как тестирование именованных outlet-ов,
   где может потребоваться создание пользовательских хост-компонентов.
2. **Продуманно работайте с внешними зависимостями** — Отдавайте предпочтение реальным реализациям, когда это возможно,
   для более реалистичных тестов. Если реальные реализации невозможны (например, внешние API), используйте фейки (
   fakes), которые приближают реальное поведение. Используйте моки (mocks) или стабы (stubs) только в крайнем случае,
   так как они могут сделать тесты хрупкими и менее надежными.
3. **Тестируйте состояние навигации** — Проверяйте как действие навигации, так и результирующее состояние приложения,
   включая изменения URL и рендеринг компонентов.
4. **Обрабатывайте асинхронные операции** — Навигация роутера асинхронна. Используйте `async/await` или [
   `fakeAsync`](api/core/testing/fakeAsync) для правильной обработки таймингов в ваших тестах.
5. **Тестируйте сценарии ошибок** — Включайте тесты для неверных маршрутов, неудачной навигации и отклонений Guard-ами,
   чтобы убедиться, что ваше приложение корректно обрабатывает граничные случаи.
6. **Не создавайте моки для Angular Router** — Вместо этого предоставляйте реальные конфигурации маршрутов и используйте
   harness для навигации. Это делает ваши тесты более надежными и менее склонными к поломкам при внутренних обновлениях
   Angular, а также гарантирует, что вы обнаружите реальные проблемы при обновлении роутера, поскольку моки могут
   скрывать критические изменения.
