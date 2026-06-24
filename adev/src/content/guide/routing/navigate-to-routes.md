# Навигация по маршрутам

Директива RouterLink — это декларативный подход Angular к навигации. Она позволяет использовать стандартные элементы
ссылок (`<a>`), которые бесшовно интегрируются с системой маршрутизации Angular.

## Как использовать RouterLink

Вместо использования обычных элементов `<a>` с атрибутом `href`, вы добавляете директиву RouterLink с соответствующим
путем, чтобы задействовать маршрутизацию Angular.

```angular-ts
import {RouterLink} from '@angular/router';

@Component({
  template: `
    <nav>
      <a routerLink="/user-profile">User profile</a>
      <a routerLink="/settings">Settings</a>
    </nav>
  `
  imports: [RouterLink],
  ...
})
export class App {}
```

### Использование абсолютных или относительных ссылок

**Относительные URL** в маршрутизации Angular позволяют определять пути навигации относительно текущего местоположения
маршрута. Это отличается от **абсолютных URL**, которые содержат полный путь с протоколом (например, `http://`) и \*
\*корневым доменом\*\* (например, `google.com`).

```angular-html
<!-- Absolute URL -->
<a href="https://www.angular.dev/essentials">Angular Essentials Guide</a>

<!-- Relative URL -->
<a href="/essentials">Angular Essentials Guide</a>
```

В этом примере первый вариант содержит полный путь с протоколом (т.е. `https://`) и корневым доменом (т.е.
`angular.dev`), явно определенным для страницы essentials. Напротив, второй пример предполагает, что пользователь уже
находится на правильном корневом домене для `/essentials`.

Как правило, предпочтительнее использовать относительные URL, так как их легче поддерживать в разных приложениях,
поскольку им не нужно знать свое абсолютное положение в иерархии маршрутизации.

### Как работают относительные URL

Маршрутизация Angular имеет два синтаксиса для определения относительных URL: строки и массивы.

```angular-html
<!-- Navigates user to /dashboard -->
<a routerLink="dashboard">Dashboard</a>
<a [routerLink]="['dashboard']">Dashboard</a>
```

HELPFUL: Передача строки — самый распространенный способ определения относительных URL.

Когда нужно определить динамические параметры в относительном URL, используйте синтаксис массива:

```angular-html
<a [routerLink]="['user', currentUserId]">Current User</a>
```

Кроме того, маршрутизация Angular позволяет указать, должен ли путь быть относительным к текущему URL или к корневому
домену, в зависимости от того, начинается ли относительный путь с косой черты (`/`) или нет.

Например, если пользователь находится на `example.com/settings`, вот как можно определить различные относительные пути
для разных сценариев:

```angular-html
<!-- Navigates to /settings/notifications -->
<a routerLink="notifications">Notifications</a>
<a routerLink="/settings/notifications">Notifications</a>

<!-- Navigates to /team/:teamId/user/:userId -->
<a routerLink="/team/123/user/456">User 456</a>
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>”
```

## Программная навигация по маршрутам

В то время как `RouterLink` обрабатывает декларативную навигацию в шаблонах, Angular предоставляет программную навигацию
для сценариев, где необходимо переходить по маршрутам на основе логики, действий пользователя или состояния приложения.
Внедряя `Router`, вы можете динамически переходить к маршрутам, передавать параметры и управлять поведением навигации в
вашем TypeScript-коде.

### `router.navigate()`

Вы можете использовать метод `router.navigate()` для программной навигации между маршрутами, указав массив путей URL.

```angular-ts
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <button (click)="navigateToProfile()">View Profile</button>
  `
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
      queryParams: { category: 'books', sort: 'price' }
    });

    // With matrix parameters
    this.router.navigate(['/products', { featured: true, onSale: true }]);
  }
}
```

`router.navigate()` поддерживает как простые, так и сложные сценарии маршрутизации, позволяя передавать параметры
маршрута, [параметры запроса (query parameters)](/guide/routing/read-route-state#query-parameters) и управлять
поведением навигации.

Вы также можете создавать динамические пути навигации относительно местоположения вашего компонента в дереве
маршрутизации, используя опцию `relativeTo`.

```angular-ts
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  template: `
    <button (click)="navigateToEdit()">Edit User</button>
    <button (click)="navigateToParent()">Back to List</button>
  `
})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {}

  // Navigate to a sibling route
  navigateToEdit() {
    // From: /users/123
    // To:   /users/123/edit
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  // Navigate to parent
  navigateToParent() {
    // From: /users/123
    // To:   /users
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
```

### `router.navigateByUrl()`

Метод `router.navigateByUrl()` предоставляет прямой способ программной навигации с использованием строковых путей URL, а
не сегментов массива. Этот метод идеально подходит, когда у вас есть полный путь URL и нужно выполнить абсолютную
навигацию, особенно при работе с внешними URL или сценариями глубоких ссылок (deep linking).

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
router.navigateByUrl('/sales-awesome;isOffer=true;showModal=false')
```

В случае, если вам нужно заменить текущий URL в истории, `navigateByUrl` также принимает объект конфигурации с опцией
`replaceUrl`.

```ts
// Replace current URL in history
router.navigateByUrl('/checkout', {
  replaceUrl: true
});
```

## Следующие шаги

Узнайте, как [читать состояние маршрута](/guide/routing/read-route-state), чтобы создавать отзывчивые и
контекстно-зависимые компоненты.
