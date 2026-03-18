# Чтение состояния маршрута

Angular Router позволяет читать и использовать информацию, связанную с маршрутом, для создания отзывчивых и контекстно-зависимых компонентов.

## Получение информации о текущем маршруте с помощью ActivatedRoute {#get-information-about-the-current-route-with-activatedroute}

`ActivatedRoute` — это сервис из `@angular/router`, предоставляющий всю информацию, связанную с текущим маршрутом.

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

`ActivatedRoute` может предоставлять различную информацию о маршруте. Некоторые распространённые свойства:

| Свойство      | Описание                                                                                                                                                |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`         | `Observable` путей маршрута, представленный в виде массива строк для каждой части пути маршрута.                                                        |
| `data`        | `Observable`, содержащий объект `data`, предоставленный для маршрута. Также содержит любые разрешённые значения из guard-а resolve.                     |
| `params`      | `Observable`, содержащий обязательные и необязательные параметры, специфичные для маршрута.                                                             |
| `queryParams` | `Observable`, содержащий параметры запроса, доступные для всех маршрутов.                                                                               |

Полный список того, к чему можно получить доступ в маршруте, см. в [документации API `ActivatedRoute`](/api/router/ActivatedRoute).

## Понимание снимков маршрута {#understanding-route-snapshots}

Навигации между страницами — это события во времени, и можно получить доступ к состоянию маршрутизатора в определённый момент, получив снимок маршрута.

Снимки маршрута содержат важную информацию о маршруте, включая его параметры, данные и дочерние маршруты. Кроме того, снимки статичны и не будут отражать будущие изменения.

Вот пример получения снимка маршрута:

```angular-ts
import {ActivatedRoute, ActivatedRouteSnapshot} from '@angular/router';

@Component({
  /*...*/
})
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

Полный список всех доступных свойств см. в [документации API `ActivatedRoute`](/api/router/ActivatedRoute) и [документации API `ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot).

## Чтение параметров маршрута {#reading-parameters-on-a-route}

Существует два типа параметров, которые разработчики могут использовать из маршрута: параметры маршрута и параметры запроса.

### Параметры маршрута {#route-parameters}

Параметры маршрута позволяют передавать данные в компонент через URL. Это полезно, когда нужно отображать конкретное содержимое на основе идентификатора в URL, например идентификатора пользователя или продукта.

Можно [определить параметры маршрута](guide/routing/define-routes#define-url-paths-with-route-parameters), предварив имя параметра двоеточием (`:`).

```angular-ts
import {Routes} from '@angular/router';
import {Product} from './product';

const routes: Routes = [{path: 'product/:id', component: Product}];
```

Получить доступ к параметрам можно, подписавшись на `route.params`.

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

### Параметры запроса {#query-parameters}

[Параметры запроса](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) предоставляют гибкий способ передачи необязательных данных через URL без изменения структуры маршрута. В отличие от параметров маршрута, параметры запроса могут сохраняться между событиями навигации и идеально подходят для обработки фильтрации, сортировки, пагинации и других элементов UI с состоянием.

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

Получить доступ к параметрам запроса можно через `route.queryParams`.

Вот пример `ProductList`, который обновляет параметры запроса, влияющие на отображение списка продуктов:

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

В этом примере пользователи могут использовать элемент select для сортировки списка продуктов по имени или цене. Связанный обработчик изменений обновляет параметры запроса URL, что в свою очередь вызывает событие изменения, которое может прочитать обновлённые параметры запроса и обновить список продуктов.

Дополнительные сведения см. в [официальной документации по QueryParamsHandling](/api/router/QueryParamsHandling).

### Матричные параметры {#matrix-parameters}

Матричные параметры — это необязательные параметры, относящиеся к конкретному сегменту URL, а не ко всему маршруту. В отличие от параметров запроса, которые следуют после `?` и применяются глобально, матричные параметры используют точку с запятой (`;`) и ограничены отдельными сегментами пути.

Матричные параметры полезны, когда нужно передать вспомогательные данные конкретному сегменту маршрута, не влияя на определение или поведение сопоставления маршрута. Как и параметры запроса, их не нужно определять в конфигурации маршрута.

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

NOTE: В качестве альтернативы использованию `ActivatedRoute` матричные параметры также привязываются к входным параметрам компонента при использовании `withComponentInputBinding`.

## Определение активного текущего маршрута с помощью RouterLinkActive {#detect-active-current-route-with-routerlinkactive}

Можно использовать директиву `RouterLinkActive` для динамического стилизования элементов навигации на основе текущего активного маршрута. Это распространено в элементах навигации для информирования пользователей об активном маршруте.

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

В этом примере Angular Router применит класс `active-button` к правильной ссылке-якорю и установит `ariaCurrentWhenActive` в `page`, когда URL соответствует соответствующему `routerLink`.

Если нужно добавить несколько классов к элементу, можно использовать либо строку с разделёнными пробелами значениями, либо массив:

```angular-html
<!-- Space-separated string syntax -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Array syntax -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

Когда вы указываете значение для `routerLinkActive`, вы также определяете то же значение для `ariaCurrentWhenActive`. Это гарантирует, что пользователи с нарушениями зрения (которые могут не замечать применяемые различные стили) также могут идентифицировать активную кнопку.

Если нужно определить другое значение для aria, необходимо явно задать значение с помощью директивы `ariaCurrentWhenActive`.

### Стратегия сопоставления маршрутов {#route-matching-strategy}

По умолчанию `RouterLinkActive` считает любых предков в маршруте совпадением.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link"> User </a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link"> Role </a>
```

Когда пользователь посещает `/user/jane/role/admin`, обе ссылки будут иметь класс `active-link`.

### Применение RouterLinkActive только при точном совпадении маршрутов {#only-apply-routerlinkactive-on-exact-route-matches}

Если нужно применять класс только при точном совпадении, необходимо передать директиве `routerLinkActiveOptions` объект конфигурации со значением `exact: true`.

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

Если нужна большая точность в определении совпадения маршрута, стоит отметить, что `exact: true` на самом деле является синтаксическим сахаром для полного набора параметров сопоставления:

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

Дополнительные сведения см. в официальной документации по [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

### Применение RouterLinkActive к элементу-предку {#apply-routerlinkactive-to-an-ancestor}

Директиву RouterLinkActive также можно применить к элементу-предку, чтобы разработчики могли стилизовать элементы по своему усмотрению.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

Дополнительные сведения см. в [документации API RouterLinkActive](/api/router/RouterLinkActive).

## Проверка активности URL {#check-if-a-url-is-active}

Функция `isActive` возвращает вычисляемый сигнал, который отслеживает, является ли данный URL активным в маршрутизаторе. Сигнал автоматически обновляется при изменении состояния маршрутизатора.

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
