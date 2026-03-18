# Навигация к маршрутам

Директива RouterLink — это декларативный подход Angular к навигации. Она позволяет использовать стандартные элементы-якоря (`<a>`), которые органично интегрируются с системой маршрутизации Angular.

## Как использовать RouterLink {#how-to-use-routerlink}

Вместо использования обычных элементов-якорей `<a>` с атрибутом `href` следует добавлять директиву RouterLink с подходящим путём для задействования маршрутизации Angular.

```angular-ts
import {RouterLink} from '@angular/router';

@Component({
  template: `
    <nav>
      <a routerLink="/user-profile">User profile</a>
      <a routerLink="/settings">Settings</a>
    </nav>
  `,
  imports: [RouterLink],
  ...
})
export class App {}
```

### Использование абсолютных и относительных ссылок {#using-absolute-or-relative-links}

**Относительные URL** в маршрутизации Angular позволяют определять пути навигации относительно расположения текущего маршрута. В отличие от **абсолютных URL**, которые содержат полный путь с протоколом (например, `http://`) и **корневым доменом** (например, `google.com`).

```angular-html
<!-- Absolute URL -->
<a href="https://www.angular.dev/essentials">Angular Essentials Guide</a>

<!-- Relative URL -->
<a href="/essentials">Angular Essentials Guide</a>
```

В этом примере первый вариант содержит полный путь с явно указанным протоколом (т.е. `https://`) и корневым доменом (т.е. `angular.dev`) для страницы основ. Второй вариант предполагает, что пользователь уже находится на правильном корневом домене для `/essentials`.

Как правило, относительные URL предпочтительнее, так как они проще в обслуживании во всём приложении — им не нужно знать своё абсолютное положение в иерархии маршрутизации.

### Как работают относительные URL {#how-relative-urls-work}

Маршрутизация Angular поддерживает два синтаксиса для определения относительных URL: строки и массивы.

```angular-html
<!-- Navigates user to /dashboard -->
<a routerLink="dashboard">Dashboard</a>
<a [routerLink]="['dashboard']">Dashboard</a>
```

HELPFUL: Передача строки — наиболее распространённый способ определения относительных URL.

Когда нужно определить динамические параметры в относительном URL, используйте синтаксис массива:

```angular-html
<a [routerLink]="['user', currentUserId]">Current User</a>
```

Кроме того, маршрутизация Angular позволяет указать, должен ли путь быть относительным к текущему URL или к корневому домену — в зависимости от того, начинается ли относительный путь с косой черты (`/`) или нет.

Например, если пользователь находится на `example.com/settings`, вот как можно определить различные относительные пути для разных сценариев:

```angular-html
<!-- Navigates to /settings/notifications -->
<a routerLink="notifications">Notifications</a>
<a routerLink="/settings/notifications">Notifications</a>

<!-- Navigates to /team/:teamId/user/:userId -->
<a routerLink="/team/123/user/456">User 456</a>
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>
```

## Программная навигация к маршрутам {#programmatic-navigation-to-routes}

В то время как `RouterLink` обрабатывает декларативную навигацию в шаблонах, Angular предоставляет программную навигацию для сценариев, когда нужно перемещаться на основе логики, действий пользователя или состояния приложения. Внедрив `Router`, можно динамически переходить к маршрутам, передавать параметры и управлять поведением навигации в коде TypeScript.

### `router.navigate()` {#router-navigate}

Метод `router.navigate()` позволяет программно перемещаться между маршрутами, указав массив URL-пути.

```angular-ts
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: ` <button (click)="navigateToProfile()">View Profile</button> `,
})
export class AppDashboard {
  private router = inject(Router);

  navigateToProfile() {
    // Standard navigation
    this.router.navigate(['/profile']);

    // With route parameters
    this.router.navigate(['/users', userId]);

    // With query parameters
    this.router.navigate(['/search'], {
      queryParams: {category: 'books', sort: 'price'},
    });

    // With matrix parameters
    this.router.navigate(['/products', {featured: true, onSale: true}]);
  }
}
```

`router.navigate()` поддерживает как простые, так и сложные сценарии маршрутизации, позволяя передавать параметры маршрута, [параметры запроса](guide/routing/read-route-state#query-parameters) и управлять поведением навигации.

Также можно строить динамические пути навигации относительно расположения компонента в дереве маршрутизации с помощью опции `relativeTo`.

```angular-ts
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-user-detail',
  template: `
    <button (click)="navigateToEdit()">Edit User</button>
    <button (click)="navigateToParent()">Back to List</button>
  `,
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Navigate to a sibling route
  navigateToEdit() {
    // From: /users/123
    // To:   /users/123/edit
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  // Navigate to parent
  navigateToParent() {
    // From: /users/123
    // To:   /users
    this.router.navigate(['..'], {relativeTo: this.route});
  }

  navigateToList() {
    // Angular resolves the commands array as a single navigation path relative to the current route.
    // From: /users/123
    // Result: /users/list
    this.router.navigate(['..', 'list'], {relativeTo: this.route});
  }
}
```

### `router.navigateByUrl()` {#router-navigatebyurl}

Метод `router.navigateByUrl()` предоставляет прямой способ программной навигации с использованием строк URL-пути, а не сегментов массива. Этот метод идеален, когда есть полный URL-путь и нужна абсолютная навигация, особенно при работе с внешними URL или сценариями глубокого связывания.

```ts
// Standard route navigation
router.navigateByUrl('/products');

// Navigate to nested route
router.navigateByUrl('/products/featured');

// Complete URL with parameters and fragment
router.navigateByUrl('/products/123?view=details#reviews');

// Navigate with query parameters
router.navigateByUrl('/search?category=books&sortBy=price');

// With matrix parameters
router.navigateByUrl('/sales-awesome;isOffer=true;showModal=false');
```

Если нужно заменить текущий URL в истории, `navigateByUrl` также принимает объект конфигурации с опцией `replaceUrl`.

```ts
// Replace current URL in history
router.navigateByUrl('/checkout', {
  replaceUrl: true,
});
```

### Отображение другого URL в адресной строке {#display-a-different-url-in-the-address-bar}

Можно передать опцию `browserUrl` в `navigateByUrl`, чтобы отображать в адресной строке браузера URL, отличный от используемого для сопоставления маршрута.

Это полезно, когда нужно перенаправить пользователя на другой маршрут — например, на страницу ошибки — не изменяя URL, который пользователь изначально пытался посетить.

```ts
router.navigateByUrl('/not-found', {browserUrl: '/products/missing-item'});
```

Angular переходит к маршруту `/not-found` и отображает его, но в адресной строке браузера показывается `/products/missing-item`.

NOTE: `browserUrl` влияет только на то, что отображается в адресной строке браузера.

## Настройка URL браузера с помощью RouterLink {#customizing-the-browser-url-with-routerlink}

Директива `RouterLink` также поддерживает входной параметр `browserUrl`, который позволяет управлять URL, отображаемым в адресной строке браузера при нажатии на ссылку, независимо от маршрута, к которому переходит Angular.

```angular-html
<!-- Navigates to /dashboard, but the address bar shows /home -->
<a [routerLink]="['/dashboard']" [browserUrl]="'/home'">Go to Dashboard</a>
```

Также можно привязать `UrlTree` для более динамических сценариев:

```angular-ts
import {Component, inject} from '@angular/core';
import {Router, RouterLink, UrlTree} from '@angular/router';

@Component({
  template: `
    <a [routerLink]="['/products', product.id]" [browserUrl]="displayUrl">
      {{ product.name }}
    </a>
  `,
  imports: [RouterLink],
})
export class ProductList {
  private router = inject(Router);

  product = {id: 42, name: 'Widget'};

  // Create a UrlTree to display in the address bar
  displayUrl: UrlTree = this.router.createUrlTree(['/products', 'widget']);
}
```

## Следующие шаги {#next-steps}

Узнайте, как [читать состояние маршрута](guide/routing/read-route-state), чтобы создавать отзывчивые и контекстно-зависимые компоненты.
