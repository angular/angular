# Определение маршрутов

Маршруты служат фундаментальными строительными блоками для навигации в приложении Angular.

## Что такое маршруты?

В Angular **маршрут** (route) — это объект, который определяет, какой компонент должен отображаться для конкретного пути
URL или шаблона, а также дополнительные параметры конфигурации, описывающие, что происходит, когда пользователь
переходит по этому URL.

Вот базовый пример маршрута:

```ts
import { AdminPage } from './app-admin/app-admin.component';

const adminPage = {
  path: 'admin',
  component: AdminPage
}
```

Для этого маршрута, когда пользователь посещает путь `/admin`, приложение отобразит компонент `AdminPage`.

### Управление маршрутами в вашем приложении

В большинстве проектов маршруты определяются в отдельном файле, имя которого содержит `routes`.

Коллекция маршрутов выглядит следующим образом:

```ts
import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page.component';
import { AdminPage } from './about-page/admin-page.component';

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

Совет: Если вы создали проект с помощью Angular CLI, ваши маршруты определены в `src/app/app.routes.ts`.

### Добавление роутера в приложение

При инициализации (bootstrapping) приложения Angular без Angular CLI вы можете передать объект конфигурации, включающий
массив `providers`.

Внутри массива `providers` вы можете добавить роутер Angular в ваше приложение, вызвав функцию `provideRouter` с вашими
маршрутами.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ]
};
```

## URL-пути маршрутов

### Статические URL-пути

Статические URL-пути относятся к маршрутам с предопределенными путями, которые не меняются в зависимости от динамических
параметров. Это маршруты, которые точно соответствуют строке `path` и имеют фиксированный результат.

Примеры включают:

- "/admin"
- "/blog"
- "/settings/account"

### Определение URL-путей с параметрами маршрута

Параметризованные URL позволяют определять динамические пути, которые обеспечивают множество URL-адресов для одного и
того же компонента, динамически отображая данные на основе параметров в URL.

Вы можете определить этот тип шаблона, добавив параметры в строку `path` маршрута и предваряя каждый параметр символом
двоеточия (`:`).

ВАЖНО: Параметры отличаются от информации в [строке запроса](https://en.wikipedia.org/wiki/Query_string) URL.
Узнайте больше о [параметрах запроса в Angular в этом руководстве](/guide/routing/read-route-state#query-parameters).

Следующий пример отображает компонент профиля пользователя на основе `id` пользователя, переданного через URL.

```ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile';

const routes: Routes = [
  { path: 'user/:id', component: UserProfile }
];
```

В этом примере такие URL, как `/user/leeroy` и `/user/jenkins`, отображают компонент `UserProfile`. Этот компонент затем
может прочитать параметр `id` и использовать его для выполнения дополнительной работы, например, для получения данных.
См. руководство по [чтению состояния маршрута](/guide/routing/read-route-state) для получения подробной информации о
чтении параметров маршрута.

Допустимые имена параметров маршрута должны начинаться с буквы (a-z, A-Z) и могут содержать только:

- Буквы (a-z, A-Z)
- Цифры (0-9)
- Подчеркивание (\_)
- Дефис (-)

Вы также можете определять пути с несколькими параметрами:

```ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile.component';
import { SocialMediaFeed } from './user-profile/social–media-feed.component';

const routes: Routes = [
  { path: 'user/:id/:social-media', component: SocialMediaFeed },
  { path: 'user/:id/', component: UserProfile },
];
```

С этим новым путем пользователи могут посетить `/user/leeroy/youtube` и `/user/leeroy/bluesky` и увидеть соответствующие
ленты социальных сетей на основе параметра для пользователя leeroy.

См. [Чтение состояния маршрута](/guide/routing/read-route-state) для получения подробной информации о чтении параметров
маршрута.

### Wildcard-маршруты

Когда нужно перехватить все маршруты для определенного пути, решением является wildcard-маршрут (маршрут-шаблон),
который определяется двойной звездочкой (`**`).

Распространенным примером является определение компонента "Страница не найдена".

```ts
import { Home } from './home/home.component';
import { UserProfile } from './user-profile/user-profile.component';
import { NotFound } from './not-found/not-found.component';

const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'user/:id', component: UserProfile },
  { path: '**', component: NotFound }
];
```

В этом массиве маршрутов приложение отображает компонент `NotFound`, когда пользователь посещает любой путь за пределами
`home` и `user/:id`.

Совет: Wildcard-маршруты обычно помещаются в конец массива маршрутов.

## Как Angular сопоставляет URL

При определении маршрутов важен порядок, так как Angular использует стратегию "побеждает первое совпадение". Это
означает, что как только Angular находит соответствие URL с `path` маршрута, он прекращает проверку дальнейших
маршрутов. В результате всегда помещайте более конкретные маршруты перед менее конкретными.

Следующий пример показывает маршруты, определенные от наиболее конкретных к наименее конкретным:

```ts
const routes: Routes = [
  { path: '', component: HomeComponent },              // Пустой путь
  { path: 'users/new', component: NewUserComponent },  // Статический, наиболее конкретный
  { path: 'users/:id', component: UserDetailComponent }, // Динамический
  { path: 'users', component: UsersComponent },        // Статический, менее конкретный
  { path: '**', component: NotFoundComponent }         // Wildcard - всегда последний
];
```

Если пользователь посещает `/users/new`, роутер Angular выполнит следующие шаги:

1. Проверяет `''` — не совпадает.
1. Проверяет `users/new` — совпадает! Останавливается здесь.
1. Никогда не достигает `users/:id`, хотя он мог бы совпасть.
1. Никогда не достигает `users`.
1. Никогда не достигает `**`.

## Стратегии загрузки компонентов маршрута

Понимание того, как и когда загружаются компоненты в маршрутизации Angular, имеет решающее значение для создания
отзывчивых веб-приложений. Angular предлагает две основные стратегии для управления поведением загрузки компонентов:

1. **Загружаемые сразу (Eagerly loaded)**: Компоненты, которые загружаются немедленно.
2. **Ленивая загрузка (Lazily loaded)**: Компоненты загружаются только тогда, когда они необходимы.

Каждый подход предлагает определенные преимущества для разных сценариев.

### Компоненты с загрузкой сразу (Eagerly loaded)

Когда вы определяете маршрут со свойством `component`, указанный компонент загружается сразу (eagerly) как часть того же
JavaScript-бандла, что и конфигурация маршрута.

```ts
import { Routes } from "@angular/router";
import { HomePage } from "./components/home/home-page"
import { LoginPage } from "./components/auth/login-page"

export const routes: Routes = [
  // HomePage и LoginPage напрямую указаны в этой конфигурации,
  // поэтому их код сразу включается в тот же JavaScript-бандл, что и этот файл.
  {
    path: "",
    component: HomePage
  },
  {
    path: "login",
    component: LoginPage
  }
]
```

Загрузка компонентов маршрута сразу означает, что браузер должен загрузить и разобрать весь JavaScript для этих
компонентов как часть начальной загрузки страницы, но компоненты становятся доступны Angular немедленно.

Хотя включение большего количества JavaScript в начальную загрузку страницы приводит к увеличению времени начальной
загрузки, это может обеспечить более плавные переходы по мере навигации пользователя по приложению.

### Компоненты с ленивой загрузкой (Lazily loaded)

Вы можете использовать свойство `loadComponent` для ленивой загрузки JavaScript для маршрута только в тот момент, когда
этот маршрут становится активным.

```ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  // Компоненты HomePage и LoginPage загружаются лениво в тот момент,
  // когда соответствующие им маршруты становятся активными.
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page').then(m => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () => import('./components/home/home-page').then(m => m.HomePage)
  }
]
```

Свойство `loadComponent` принимает функцию-загрузчик, которая возвращает Promise, разрешающийся в компонент Angular. В
большинстве случаев эта функция использует
стандартный [JavaScript dynamic import API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).
Однако вы можете использовать любую произвольную асинхронную функцию-загрузчик.

Ленивая загрузка маршрутов может значительно улучшить скорость загрузки вашего приложения Angular за счет удаления
больших частей JavaScript из начального бандла. Эти части вашего кода компилируются в отдельные "чанки" (фрагменты)
JavaScript, которые роутер запрашивает только тогда, когда пользователь посещает соответствующий маршрут.

### Ленивая загрузка в контексте внедрения (Injection context)

Роутер выполняет `loadComponent` и `loadChildren` внутри **контекста внедрения текущего маршрута**, что позволяет
вызывать `inject` внутри этих функций-загрузчиков для доступа к провайдерам, объявленным в этом маршруте, унаследованным
от родительских маршрутов через иерархическое внедрение зависимостей, или доступным глобально. Это обеспечивает ленивую
загрузку с учетом контекста.

```ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { FeatureFlags } from './feature-flags';

export const routes: Routes = [
  {
    path: 'dashboard',
    // Запускается внутри контекста внедрения маршрута
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium
        ? import('./dashboard/premium-dashboard').then(m => m.PremiumDashboard)
        : import('./dashboard/basic-dashboard').then(m => m.BasicDashboard);
    },
  },
];
```

### Использовать обычную (eager) или ленивую (lazy) загрузку маршрута?

Существует множество факторов, которые следует учитывать при принятии решения о том, должен ли маршрут быть eager или
lazy.

В целом, загрузка сразу (eager loading) рекомендуется для основных целевых страниц, в то время как другие страницы лучше
загружать лениво.

Примечание: Хотя ленивые маршруты имеют преимущество в производительности при начальной загрузке за счет уменьшения
объема данных, запрашиваемых пользователем, это добавляет будущие запросы данных, которые могут быть нежелательными. Это
особенно актуально при работе с вложенной ленивой загрузкой на нескольких уровнях, что может существенно повлиять на
производительность.

## Перенаправления (Redirects)

Вы можете определить маршрут, который перенаправляет на другой маршрут вместо отображения компонента:

```ts
import { BlogComponent } from './home/blog.component';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: BlogComponent
  },
];
```

Если вы измените или удалите маршрут, некоторые пользователи все еще могут переходить по устаревшим ссылкам или
закладкам на этот маршрут. Вы можете добавить перенаправление, чтобы направить этих пользователей на соответствующий
альтернативный маршрут вместо страницы "не найдено".

## Заголовки страниц

Вы можете связать **заголовок** (title) с каждым маршрутом. Angular автоматически
обновляет [заголовок страницы](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) при активации маршрута.
Всегда определяйте соответствующие заголовки страниц для вашего приложения, так как они необходимы для обеспечения
доступности.

```ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About Us'
  },
];
```

Свойство `title` страницы может быть установлено динамически с помощью функции-resolver'а, используя [
`ResolveFn`](/api/router/ResolveFn).

```ts
const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];
const routes: Routes = [
   ...
  {
    path: 'products',
    component: ProductsComponent,
    title: titleResolver,
  }
];

```

Заголовки маршрутов также могут быть установлены через сервис, расширяющий абстрактный класс [
`TitleStrategy`](/api/router/TitleStrategy). По умолчанию Angular использует [
`DefaultTitleStrategy`](/api/router/DefaultTitleStrategy).

### Использование TitleStrategy для заголовков страниц

Для продвинутых сценариев, где нужен централизованный контроль над тем, как формируется заголовок документа, реализуйте
`TitleStrategy`.

`TitleStrategy` — это токен, который вы можете предоставить для переопределения стратегии заголовков по умолчанию,
используемой Angular. Вы можете предоставить пользовательский `TitleStrategy` для реализации таких соглашений, как
добавление суффикса приложения, форматирование заголовков из навигационных цепочек (breadcrumbs) или динамическая
генерация заголовков из данных маршрута.

```ts
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  updateTitle(snapshot: RouterStateSnapshot): void {
    // PageTitle равен "Title" маршрута, если он установлен
    // Если он не установлен, будет использоваться "title", указанный в index.html
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    this.title.setTitle(`MyAwesomeApp - ${pageTitle}`);
  }
}
```

Чтобы использовать пользовательскую стратегию, предоставьте ее с токеном `TitleStrategy` на уровне приложения:

```ts
import { provideRouter, TitleStrategy } from '@angular/router';
import { AppTitleStrategy } from './app-title.strategy';

export const appConfig = {
  providers: [
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
```

## Провайдеры уровня маршрута для внедрения зависимостей

У каждого маршрута есть свойство `providers`, которое позволяет предоставлять зависимости для контента этого маршрута
через [внедрение зависимостей](/guide/di).

Распространенные сценарии, где это может быть полезно, включают приложения, которые имеют разные сервисы в зависимости
от того, является ли пользователь администратором или нет.

```ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [
      AdminService,
      {provide: ADMIN_API_KEY, useValue: '12345'},
    ],
    children: [
      {path: 'users', component: AdminUsersComponent},
      {path: 'teams', component: AdminTeamsComponent},
    ],
  },
  // ... другие маршруты приложения, которые не имеют
  //     доступа к ADMIN_API_KEY или AdminService.
];
```

В этом примере кода путь `admin` содержит защищенное свойство данных `ADMIN_API_KEY`, которое доступно только дочерним
элементам в его секции. В результате никакие другие пути не смогут получить доступ к данным, предоставленным через
`ADMIN_API_KEY`.

См. [Руководство по внедрению зависимостей](/guide/di) для получения дополнительной информации о провайдерах и внедрении
в Angular.

## Связывание данных с маршрутами

Данные маршрута позволяют прикреплять дополнительную информацию к маршрутам. Вы можете настраивать поведение компонентов
на основе этих данных.

Существует два способа работы с данными маршрута: статические данные, которые остаются постоянными, и динамические
данные, которые могут меняться в зависимости от условий выполнения.

### Статические данные

Вы можете связать произвольные статические данные с маршрутом через свойство `data`, чтобы централизовать такие вещи,
как метаданные, специфичные для маршрута (например, отслеживание аналитики, разрешения и т. д.):

```ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    data: { analyticsId: '456' }
  },
  {
    path: '',
    component: HomeComponent,
    data: { analyticsId: '123' }
  }
];
```

В этом примере кода главная страница и страница "О нас" настроены с конкретным `analyticsId`, который затем будет
использоваться в их соответствующих компонентах для аналитики отслеживания страниц.

Вы можете прочитать эти статические данные, внедрив `ActivatedRoute`.
См. [Чтение состояния маршрута](/guide/routing/read-route-state) для подробностей.

### Динамические данные с помощью resolver'ов данных

Когда вам нужно предоставить динамические данные маршруту, ознакомьтесь
с [руководством по resolver'ам данных маршрута](/guide/routing/data-resolvers).

## Вложенные маршруты

Вложенные маршруты, также известные как дочерние маршруты, являются распространенным методом управления более сложными
маршрутами навигации, где компонент имеет под-представление (sub-view), которое меняется в зависимости от URL.

<img alt="Диаграмма, иллюстрирующая вложенные маршруты" src="assets/images/guide/router/nested-routing-diagram.svg">

Вы можете добавить дочерние маршруты к любому определению маршрута с помощью свойства `children`:

```ts
const routes: Routes = [
  {
    path: 'product/:id',
    component: ProductComponent,
    children: [
      {
        path: 'info',
        component: ProductInfoComponent
      },
      {
        path: 'reviews',
        component: ProductReviewsComponent
      }
    ]
  }
]
```

Приведенный выше пример определяет маршрут для страницы продукта, который позволяет пользователю менять отображение
информации о продукте или отзывов в зависимости от URL.

Свойство `children` принимает массив объектов `Route`.

Чтобы отобразить дочерние маршруты, родительский компонент (`ProductComponent` в примере выше) включает свой собственный
`<router-outlet>`.

```angular-html
<!-- ProductComponent -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

После добавления дочерних маршрутов в конфигурацию и добавления `<router-outlet>` в компонент, навигация между
URL-адресами, соответствующими дочерним маршрутам, обновляет только вложенный outlet.

## Следующие шаги

Узнайте, как [отображать содержимое ваших маршрутов с помощью Outlets](/guide/routing/show-routes-with-outlets).
