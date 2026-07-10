# Чтение состояния маршрута

Angular Router позволяет читать и использовать информацию, связанную с маршрутом, для создания отзывчивых и context-aware компонентов.

## Получение информации о текущем маршруте с ActivatedRoute {#get-information-about-the-current-route-with-activatedroute}

`ActivatedRoute` — это сервис из `@angular/router`, который предоставляет всю информацию, связанную с текущим маршрутом.

```angular-ts
import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product',
})
export class Product {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

`ActivatedRoute` может предоставить разную информацию о маршруте. Некоторые распространённые свойства включают:

| Свойство      | Подробности                                                                                                                       |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | `Observable` путей маршрута, представленных как массив строк для каждой части пути маршрута.                                      |
| `data`        | `Observable`, содержащий объект `data`, предоставленный для маршрута. Также содержит любые resolved-значения из resolve guard.    |
| `params`      | `Observable`, содержащий обязательные и опциональные параметры, специфичные для маршрута.                                         |
| `queryParams` | `Observable`, содержащий query parameters, доступные всем маршрутам.                                                              |

См. [документацию API `ActivatedRoute`](/api/router/ActivatedRoute) для полного списка того, к чему можно получить доступ в маршруте.

## Понимание снимков маршрута {#understanding-route-snapshots}

Навигации по страницам — это события во времени, и можно получить доступ к состоянию router в заданный момент, получив снимок маршрута.

Снимки маршрута содержат существенную информацию о маршруте, включая его параметры, данные и дочерние маршруты. Кроме того, снимки статичны и не будут отражать будущие изменения.

Вот пример того, как получить доступ к снимку маршрута:

```angular-ts
import {ActivatedRoute, ActivatedRouteSnapshot} from '@angular/router';

@Component(/* ... */)
export class UserProfile {
  readonly userId: string;
  private route = inject(ActivatedRoute);

  constructor() {
    // Example URL: https://www.angular.dev/users/123?role=admin&status=active#contact

    // Access route parameters from snapshot
    this.userId = this.route.snapshot.paramMap.get('id');

    // Access multiple route elements
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url, // https://www.angular.dev
      // Route parameters object: {id: '123'}
      params: snapshot.params,
      // Query parameters object: {role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams, // Query parameters
    });
  }
}
```

См. [документацию API `ActivatedRoute`](/api/router/ActivatedRoute) и [документацию API `ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для полного списка всех свойств, к которым можно получить доступ.

## Чтение параметров маршрута {#reading-parameters-on-a-route}

Есть два типа параметров, которые разработчики могут использовать из маршрута: параметры маршрута и query parameters.

### Параметры маршрута {#route-parameters}

Параметры маршрута позволяют передавать данные компоненту через URL. Это полезно, когда нужно отобразить конкретное содержимое на основе идентификатора в URL, например ID пользователя или ID продукта.

Можно [определить параметры маршрута](/guide/routing/define-routes#define-url-paths-with-route-parameters), предварив имя параметра двоеточием (`:`).

```angular-ts
import {Routes} from '@angular/router';
import {Product} from './product';

const routes: Routes = [{path: 'product/:id', component: Product}];
```

Можно получить доступ к параметрам, подписавшись на `route.params`.

```angular-ts
import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Product Details: {{ productId() }}</h1>`,
})
export class ProductDetail {
  productId = signal('');
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Access route parameters
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

### Query Parameters {#query-parameters}

[Query parameters](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) предоставляют гибкий способ передачи опциональных данных через URL без влияния на структуру маршрута. В отличие от параметров маршрута, query parameters могут сохраняться между событиями навигации и идеально подходят для фильтрации, сортировки, пагинации и других stateful UI-элементов.

```angular-ts
// Single parameter structure
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: {category: 'electronics'},
});

// Multiple parameters
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1,
  },
});
```

Можно получить доступ к query parameters через `route.queryParams`.

Вот пример `ProductList`, который обновляет query parameters, влияющие на то, как он отображает список продуктов:

```angular-ts
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: `
    <div>
      <select (change)="updateSort($event)">
        <option value="price">Price</option>
        <option value="name">Name</option>
      </select>
      <!-- Products list -->
    </div>
  `,
})
export class ProductList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Access query parameters reactively
    this.route.queryParams.subscribe((params) => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // Update URL with new query parameter
    this.router.navigate([], {
      queryParams: {sort},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }
}
```

В этом примере пользователи могут использовать элемент select для сортировки списка продуктов по имени или цене. Связанный обработчик изменения обновляет query parameters URL, что в свою очередь запускает событие изменения, которое может прочитать обновлённые query parameters и обновить список продуктов.

Для дополнительной информации см. [официальную документацию по QueryParamsHandling](/api/router/QueryParamsHandling).

### Matrix Parameters {#matrix-parameters}

Matrix parameters — это опциональные параметры, которые принадлежат конкретному сегменту URL, а не применяются ко всему маршруту. В отличие от query parameters, которые появляются после `?` и применяются глобально, matrix parameters используют точки с запятой (`;`) и ограничены отдельными сегментами пути.

Matrix parameters полезны, когда нужно передать вспомогательные данные конкретному сегменту маршрута без влияния на определение маршрута или поведение сопоставления. Как и query parameters, их не нужно определять в конфигурации маршрутов.

```ts
// URL format: /path;key=value
// Multiple parameters: /path;key1=value1;key2=value2

// Navigate with matrix parameters
this.router.navigate(['/awesome-products', {view: 'grid', filter: 'new'}]);
// Results in URL: /awesome-products;view=grid;filter=new
```

**Использование ActivatedRoute**

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component(/* ... */)
export class AwesomeProducts {
  private route = inject(ActivatedRoute);

  constructor() {
    // Access matrix parameters via params
    this.route.params.subscribe((params) => {
      const view = params['view']; // e.g., 'grid'
      const filter = params['filter']; // e.g., 'new'
    });
  }
}
```

NOTE: Как альтернатива использованию `ActivatedRoute`, matrix parameters также привязываются к input'ам компонента при использовании `withComponentInputBinding`.

## Определение активного текущего маршрута с RouterLinkActive {#detect-active-current-route-with-routerlinkactive}

Можно использовать директиву `RouterLinkActive` для динамической стилизации элементов навигации на основе текущего активного маршрута. Это распространено в элементах навигации, чтобы информировать пользователей о том, какой маршрут активен.

```angular-html
<nav>
  <a
    class="button"
    routerLink="/about"
    routerLinkActive="active-button"
    ariaCurrentWhenActive="page"
  >
    About
  </a>
  |
  <a
    class="button"
    routerLink="/settings"
    routerLinkActive="active-button"
    ariaCurrentWhenActive="page"
  >
    Settings
  </a>
</nav>
```

В этом примере Angular Router применит класс `active-button` к правильной якорной ссылке и `ariaCurrentWhenActive` к `page`, когда URL соответствует соответствующему `routerLink`.

Если нужно добавить несколько классов на элемент, можно использовать либо строку, разделённую пробелами, либо массив:

```angular-html
<!-- Space-separated string syntax -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Array syntax -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

Когда вы указываете значение для routerLinkActive, вы также определяете то же значение для `ariaCurrentWhenActive`. Это гарантирует, что пользователи с нарушениями зрения (которые могут не воспринимать применяемую разную стилизацию) также могут идентифицировать активную кнопку.

Если нужно определить другое значение для aria, потребуется явно задать значение с помощью директивы `ariaCurrentWhenActive`.

### Стратегия сопоставления маршрутов {#route-matching-strategy}

По умолчанию `RouterLinkActive` считает совпадением любых предков в маршруте.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link"> User </a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link"> Role </a>
```

Когда пользователь посещает `/user/jane/role/admin`, оба ссылки будут иметь класс `active-link`.

### Применение RouterLinkActive только при точных совпадениях маршрута {#only-apply-routerlinkactive-on-exact-route-matches}

Если нужно применять класс только при точном совпадении, нужно предоставить директиве `routerLinkActiveOptions` объект конфигурации, содержащий значение `exact: true`.

```angular-html
<a
  [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
<a
  [routerLink]="['/user/jane/role/admin']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  Role
</a>
```

Если нужно быть более точным в том, как сопоставляется маршрут, стоит отметить, что `exact: true` на самом деле является синтаксическим сахаром для полного набора опций сопоставления:

```angular-ts
// `exact: true` is equivalent to
{
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
}

// `exact: false` is equivalent
{
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
}
```

Для дополнительной информации см. официальную документацию по [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

### Применение RouterLinkActive к предку {#apply-routerlinkactive-to-an-ancestor}

Директиву RouterLinkActive также можно применить к элементу-предку, чтобы разработчики могли стилизовать элементы как угодно.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

Для дополнительной информации см. [документацию API для RouterLinkActive](/api/router/RouterLinkActive).

## Проверка, активен ли URL {#check-if-a-url-is-active}

Функция `isActive` возвращает computed signal, который отслеживает, активен ли данный URL в данный момент в router. Signal автоматически обновляется при изменении состояния router.

```angular-ts
import {Component, inject} from '@angular/core';
import {isActive, Router} from '@angular/router';

@Component({
  template: `
    <div [class.active]="isSettingsActive()">
      <h2>Settings</h2>
    </div>
  `,
})
export class Panel {
  private router = inject(Router);

  isSettingsActive = isActive('/settings', this.router, {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
}
```
