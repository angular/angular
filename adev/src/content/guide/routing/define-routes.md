# Определение маршрутов {#define-routes}

Маршруты служат основными строительными блоками навигации в Angular-приложении.

## Что такое маршруты? {#what-are-routes}

В Angular **маршрут** — это объект, определяющий, какой Компонент должен отображаться для конкретного URL-пути или шаблона, а также дополнительные параметры конфигурации, описывающие поведение при переходе пользователя по этому URL.

Вот базовый пример маршрута:

```ts
import {AdminPage} from './app-admin';

const adminPage = {
  path: 'admin',
  component: AdminPage,
};
```

Для этого маршрута при посещении пути `/admin` приложение отобразит Компонент `AdminPage`.

### Управление маршрутами в приложении {#managing-routes-in-your-application}

В большинстве проектов маршруты определяются в отдельном файле, в имени которого содержится слово `routes`.

Коллекция маршрутов выглядит следующим образом:

```ts
import {Routes} from '@angular/router';
import {HomePage} from './home-page';
import {AdminPage} from './about-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

Tip: Если проект создан с помощью Angular CLI, маршруты определены в файле `src/app/app.routes.ts`.

### Добавление Роутера в приложение {#adding-the-router-to-your-application}

При бутстрапинге Angular-приложения без Angular CLI можно передать объект конфигурации, содержащий массив `providers`.

В массиве `providers` добавьте Angular Router в приложение с помощью вызова функции `provideRouter` с вашими маршрутами.

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ],
};
```

## URL-пути маршрутов {#route-url-paths}

### Статические URL-пути {#static-url-paths}

Статические URL-пути — это маршруты с заранее определёнными путями, которые не изменяются в зависимости от динамических параметров. Эти маршруты точно совпадают со строкой `path` и дают фиксированный результат.

Примеры:

- "/admin"
- "/blog"
- "/settings/account"

### Определение URL-путей с параметрами маршрута {#define-url-paths-with-route-parameters}

Параметризованные URL позволяют определять динамические пути, по которым несколько URL ведут к одному компоненту, динамически отображая данные на основе параметров URL.

Такой шаблон определяется добавлением параметров в строку `path` маршрута с префиксом-двоеточием (`:`).

IMPORTANT: Параметры маршрута отличаются от информации в [строке запроса](https://en.wikipedia.org/wiki/Query_string) URL.
Подробнее о [параметрах запроса в Angular](/guide/routing/read-route-state#query-parameters).

Следующий пример отображает компонент профиля пользователя на основе идентификатора, переданного через URL.

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile/user-profile';

const routes: Routes = [{path: 'user/:id', component: UserProfile}];
```

В этом примере URL вида `/user/leeroy` и `/user/jenkins` отображают Компонент `UserProfile`. Этот компонент может затем читать параметр `id` и использовать его для выполнения дополнительных действий, например получения данных. Подробнее о чтении параметров маршрута — в руководстве [по чтению состояния маршрута](/guide/routing/read-route-state).

Допустимые имена параметров маршрута должны начинаться с буквы (a-z, A-Z) и могут содержать только:

- Буквы (a-z, A-Z)
- Цифры (0-9)
- Подчёркивание (\_)
- Дефис (-)

Можно также определять пути с несколькими параметрами:

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile';
import {SocialMediaFeed} from './social-media-feed';

const routes: Routes = [
  {path: 'user/:id/:social-media', component: SocialMediaFeed},
  {path: 'user/:id/', component: UserProfile},
];
```

С этим новым путём пользователи могут перейти на `/user/leeroy/youtube` и `/user/leeroy/bluesky` и увидеть соответствующие ленты социальных сетей на основе параметра для пользователя leeroy.

Подробнее о чтении параметров маршрута — в руководстве [по чтению состояния маршрута](/guide/routing/read-route-state).

### Символы-подстановки {#wildcards}

Когда нужно перехватить все маршруты для определённого пути, используется маршрут-подстановка, определяемый двойной звёздочкой (`**`).

Типичный пример — определение компонента «Страница не найдена».

```ts
import {Home} from './home/home';
import {UserProfile} from './user-profile';
import {NotFound} from './not-found';

const routes: Routes = [
  {path: 'home', component: Home},
  {path: 'user/:id', component: UserProfile},
  {path: '**', component: NotFound},
];
```

В этом массиве маршрутов приложение отображает Компонент `NotFound`, когда пользователь переходит по любому пути, кроме `home` и `user/:id`.

Tip: Маршруты-подстановки обычно размещаются в конце массива маршрутов.

## Как Angular сопоставляет URL {#how-angular-matches-urls}

При определении маршрутов порядок имеет значение, поскольку Angular использует стратегию «первое совпадение побеждает». Это означает, что как только Angular сопоставит URL с `path` маршрута, проверка остальных маршрутов прекращается. Поэтому всегда размещайте более конкретные маршруты перед менее конкретными.

Следующий пример показывает маршруты, определённые от наиболее конкретного к наименее конкретному:

```ts
const routes: Routes = [
  {path: '', component: Home}, // Пустой путь
  {path: 'users/new', component: NewUser}, // Статический, наиболее конкретный
  {path: 'users/:id', component: UserDetail}, // Динамический
  {path: 'users', component: Users}, // Статический, менее конкретный
  {path: '**', component: NotFound}, // Подстановка — всегда последний
];
```

Если пользователь переходит на `/users/new`, Angular Router выполнит следующие шаги:

1. Проверяет `''` — не совпадает
1. Проверяет `users/new` — совпадает! Останавливается здесь
1. Никогда не доходит до `users/:id`, хотя оно тоже могло бы совпасть
1. Никогда не доходит до `users`
1. Никогда не доходит до `**`

## Редиректы {#redirects}

Можно определить маршрут, который перенаправляет на другой маршрут вместо отображения компонента:

```ts
import {Blog} from './home/blog';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: Blog,
  },
];
```

Если вы изменили или удалили маршрут, некоторые пользователи могут по-прежнему переходить по устаревшим ссылкам или закладкам. Добавьте редирект, чтобы направить их на подходящий альтернативный маршрут вместо страницы «не найдено».

## Заголовки страниц {#page-titles}

Каждому маршруту можно назначить **заголовок**. Angular автоматически обновляет [заголовок страницы](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) при активации маршрута. Всегда задавайте подходящие заголовки страниц для приложения, так как они необходимы для обеспечения доступности.

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
  },
  {
    path: 'about',
    component: About,
    title: 'About Us',
  },
];
```

Свойство `title` страницы можно динамически задавать через функцию-резолвер с типом [`ResolveFn`](/api/router/ResolveFn).

```ts
const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];
const routes: Routes = [
  ...{
    path: 'products',
    component: Products,
    title: titleResolver,
  },
];
```

Заголовки маршрутов также можно задавать с помощью Сервиса, расширяющего абстрактный класс [`TitleStrategy`](/api/router/TitleStrategy). По умолчанию Angular использует [`DefaultTitleStrategy`](/api/router/DefaultTitleStrategy).

### Использование TitleStrategy для заголовков страниц {#using-titlestrategy-for-page-titles}

Для сценариев, требующих централизованного управления формированием заголовка документа, реализуйте `TitleStrategy`.

`TitleStrategy` — это токен, который можно предоставить для переопределения стратегии заголовков по умолчанию, используемой Angular. Можно предоставить собственный `TitleStrategy` для реализации соглашений, таких как добавление суффикса приложения, форматирование заголовков из хлебных крошек или динамическая генерация заголовков из данных маршрута.

```ts
import {inject, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TitleStrategy, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  updateTitle(snapshot: RouterStateSnapshot): void {
    // PageTitle равен "Title" маршрута, если он задан
    // Если нет — используется "title" из index.html
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    this.title.setTitle(`MyAwesomeApp - ${pageTitle}`);
  }
}
```

Чтобы использовать пользовательскую стратегию, предоставьте её через токен `TitleStrategy` на уровне приложения:

```ts
import {provideRouter, TitleStrategy} from '@angular/router';
import {AppTitleStrategy} from './app-title.strategy';

export const appConfig = {
  providers: [provideRouter(routes), {provide: TitleStrategy, useClass: AppTitleStrategy}],
};
```

## Провайдеры на уровне маршрута для внедрения зависимостей {#route-level-providers-for-dependency-injection}

Каждый маршрут имеет свойство `providers`, позволяющее предоставлять зависимости для содержимого этого маршрута через [внедрение зависимостей](/guide/di).

Типичный сценарий — приложения с разными Сервисами в зависимости от того, является ли пользователь администратором.

```ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [AdminService, {provide: ADMIN_API_KEY, useValue: '12345'}],
    children: [
      {path: 'users', component: AdminUsers},
      {path: 'teams', component: AdminTeams},
    ],
  },
  // ... другие маршруты приложения, не имеющие
  //     доступа к ADMIN_API_KEY или AdminService.
];
```

В этом примере путь `admin` содержит защищённое свойство данных `ADMIN_API_KEY`, доступное только дочерним элементам этого раздела. Никакие другие пути не смогут получить доступ к данным, предоставленным через `ADMIN_API_KEY`.

Подробнее — в [руководстве по внедрению зависимостей](/guide/di).

## Связывание данных с маршрутами {#associating-data-with-routes}

Данные маршрута позволяют прикреплять дополнительную информацию к маршрутам. На основе этих данных можно настраивать поведение компонентов.

Есть два способа работы с данными маршрута: статические данные, которые остаются неизменными, и динамические данные, которые могут меняться в зависимости от условий во время выполнения.

### Статические данные {#static-data}

Произвольные статические данные можно связать с маршрутом через свойство `data`, чтобы централизованно хранить такие вещи, как метаданные маршрута (например, аналитическое отслеживание, разрешения и т.д.):

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: 'about',
    component: About,
    data: {analyticsId: '456'},
  },
  {
    path: '',
    component: Home,
    data: {analyticsId: '123'},
  },
];
```

В этом примере главная страница и страница «О нас» настроены с конкретными значениями `analyticsId`, которые затем используются в соответствующих компонентах для аналитики отслеживания страниц.

Прочитать эти статические данные можно, внедрив `ActivatedRoute`. Подробнее — в руководстве [по чтению состояния маршрута](/guide/routing/read-route-state).

### Динамические данные через резолверы данных {#dynamic-data-with-data-resolvers}

Если нужно предоставлять динамические данные маршруту, ознакомьтесь с [руководством по резолверам данных маршрута](/guide/routing/data-resolvers).

## Вложенные маршруты {#nested-routes}

Вложенные маршруты, также известные как дочерние маршруты, — распространённый приём для управления более сложными маршрутами навигации, когда компонент имеет подпредставление, изменяющееся в зависимости от URL.

<img alt="Diagram to illustrate nested routes" src="assets/images/guide/router/nested-routing-diagram.svg">

Дочерние маршруты можно добавить к любому определению маршрута с помощью свойства `children`:

```ts
const routes: Routes = [
  {
    path: 'product/:id',
    component: Product,
    children: [
      {
        path: 'info',
        component: ProductInfo,
      },
      {
        path: 'reviews',
        component: ProductReviews,
      },
    ],
  },
];
```

В приведённом примере определён маршрут для страницы продукта, позволяющий пользователю переключаться между информацией о продукте и отзывами в зависимости от URL.

Свойство `children` принимает массив объектов `Route`.

Для отображения дочерних маршрутов родительский Компонент (`Product` в примере выше) должен содержать собственный элемент `<router-outlet>`.

```angular-html
<!-- Product -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

После добавления дочерних маршрутов в конфигурацию и добавления `<router-outlet>` в компонент, навигация между URL, совпадающими с дочерними маршрутами, обновляет только вложенный outlet.

## Следующие шаги {#next-steps}

<docs-pill-row>
  <docs-pill href="/guide/routing/loading-strategies" title="Стратегии загрузки маршрутов"/>
  <docs-pill href="/guide/routing/show-routes-with-outlets" title="Отображение содержимого маршрутов с помощью Outlet"/>
</docs-pill-row>
