# Навигация по маршрутам {#navigate-to-routes}

Директива RouterLink — это декларативный подход Angular к навигации. Она позволяет использовать стандартные якорные элементы (`<a>`), которые бесшовно интегрируются с системой маршрутизации Angular.

## Использование RouterLink {#how-to-use-routerlink}

Вместо использования обычных якорных элементов `<a>` с атрибутом `href` добавьте директиву RouterLink с соответствующим путём для использования Angular-маршрутизации.

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

### Использование абсолютных или относительных ссылок {#using-absolute-or-relative-links}

**Относительные URL** в Angular-маршрутизации позволяют определять пути навигации относительно расположения текущего маршрута. В отличие от **абсолютных URL**, которые содержат полный путь с протоколом (например, `http://`) и **корневым доменом** (например, `google.com`).

```angular-html
<!-- Абсолютный URL -->
<a href="https://www.angular.dev/essentials">Angular Essentials Guide</a>

<!-- Относительный URL -->
<a href="/essentials">Angular Essentials Guide</a>
```

В этом примере первый вариант содержит полный путь с протоколом (то есть `https://`) и корневым доменом (то есть `angular.dev`), явно заданными для страницы essentials. Второй вариант предполагает, что пользователь уже находится на нужном корневом домене для `/essentials`.

Как правило, относительные URL предпочтительнее, так как они более поддерживаемы в приложениях, поскольку не требуют знания абсолютного положения в иерархии маршрутизации.

### Как работают относительные URL {#how-relative-urls-work}

Angular-маршрутизация поддерживает два синтаксиса для определения относительных URL: строки и массивы.

```angular-html
<!-- Переходит на /dashboard -->
<a routerLink="dashboard">Dashboard</a>
<a [routerLink]="['dashboard']">Dashboard</a>
```

HELPFUL: Передача строки — наиболее распространённый способ определения относительных URL.

Когда нужно определить динамические параметры в относительном URL, используйте синтаксис массива:

```angular-html
<a [routerLink]="['user', currentUserId]">Current User</a>
```

Кроме того, Angular-маршрутизация позволяет указывать, должен ли путь быть относительным к текущему URL или к корневому домену — в зависимости от того, предваряется ли относительный путь косой чертой (`/`) или нет.

Например, если пользователь находится на `example.com/settings`, вот как можно определить различные относительные пути для разных сценариев:

```angular-html
<!-- Переходит на /settings/notifications -->
<a routerLink="notifications">Notifications</a>
<a routerLink="/settings/notifications">Notifications</a>

<!-- Переходит на /team/:teamId/user/:userId -->
<a routerLink="/team/123/user/456">User 456</a>
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>
```

## Программная навигация по маршрутам {#programmatic-navigation-to-routes}

Хотя `RouterLink` обеспечивает декларативную навигацию в шаблонах, Angular предоставляет программную навигацию для сценариев, где нужно переходить на основе логики, действий пользователя или состояния приложения. Внедрив `Router`, можно динамически переходить на маршруты, передавать параметры и управлять поведением навигации в TypeScript-коде.

### `router.navigate()` {#router-navigate}

Метод `router.navigate()` позволяет программно переходить между маршрутами, указывая массив URL-пути.

```angular-ts
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: ` <button (click)="navigateToProfile()">View Profile</button> `,
})
export class AppDashboard {
  private router = inject(Router);

  navigateToProfile() {
    // Стандартная навигация
    this.router.navigate(['/profile']);

    // С параметрами маршрута
    this.router.navigate(['/users', userId]);

    // С параметрами запроса
    this.router.navigate(['/search'], {
      queryParams: {category: 'books', sort: 'price'},
    });

    // С матричными параметрами
    this.router.navigate(['/products', {featured: true, onSale: true}]);
  }
}
```

`router.navigate()` поддерживает как простые, так и сложные сценарии маршрутизации, позволяя передавать параметры маршрута, [параметры запроса](/guide/routing/read-route-state#query-parameters) и управлять поведением навигации.

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

  // Переход к соседнему маршруту
  navigateToEdit() {
    // Из: /users/123
    // В:  /users/123/edit
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  // Переход к родительскому маршруту
  navigateToParent() {
    // Из: /users/123
    // В:  /users
    this.router.navigate(['..'], {relativeTo: this.route});
  }
}
```

### `router.navigateByUrl()` {#router-navigatebyurl}

Метод `router.navigateByUrl()` предоставляет прямой способ программной навигации с использованием строк URL-пути вместо сегментов массива. Этот метод идеален, когда у вас есть полный URL-путь и нужно выполнить абсолютную навигацию, особенно при работе с URL, предоставленными извне, или в сценариях глубоких ссылок.

```ts
// Стандартная навигация по маршруту
router.navigateByUrl('/products');

// Переход к вложенному маршруту
router.navigateByUrl('/products/featured');

// Полный URL с параметрами и фрагментом
router.navigateByUrl('/products/123?view=details#reviews');

// Навигация с параметрами запроса
router.navigateByUrl('/search?category=books&sortBy=price');

// С матричными параметрами
router.navigateByUrl('/sales-awesome;isOffer=true;showModal=false');
```

Если нужно заменить текущий URL в истории, `navigateByUrl` также принимает объект конфигурации с опцией `replaceUrl`.

```ts
// Замена текущего URL в истории
router.navigateByUrl('/checkout', {
  replaceUrl: true,
});
```

## Следующие шаги {#next-steps}

Узнайте, как [читать состояние маршрута](/guide/routing/read-route-state) для создания отзывчивых и контекстно-зависимых компонентов.
