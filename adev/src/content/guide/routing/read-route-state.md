# Чтение состояния маршрута

Angular Router позволяет читать и использовать информацию, связанную с маршрутом, для создания отзывчивых и
контекстно-зависимых компонентов.

## Получение информации о текущем маршруте с помощью ActivatedRoute

`ActivatedRoute` — это сервис из `@angular/router`, который предоставляет всю информацию, связанную с текущим маршрутом.

```angular-ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
})
export class ProductComponent {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

`ActivatedRoute` может предоставлять различную информацию о маршруте. Некоторые распространенные свойства включают:

| Свойство      | Подробности                                                                                                                                         |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | `Observable` путей маршрута, представленный в виде массива строк для каждой части пути маршрута.                                                    |
| `data`        | `Observable`, содержащий объект `data`, предоставленный для маршрута. Также содержит любые разрешенные значения (resolved values) из resolve guard. |
| `params`      | `Observable`, содержащий обязательные и необязательные параметры, специфичные для маршрута.                                                         |
| `queryParams` | `Observable`, содержащий параметры запроса (query parameters), доступные для всех маршрутов.                                                        |

Ознакомьтесь с [API-документацией `ActivatedRoute`](/api/router/ActivatedRoute) для получения полного списка того, к
чему вы можете получить доступ в маршруте.

## Понимание снимков маршрута (route snapshots)

Навигация по страницам — это события, происходящие во времени, и вы можете получить доступ к состоянию роутера в
определенный момент времени, получив снимок маршрута (route snapshot).

Снимки маршрута содержат важную информацию о маршруте, включая его параметры, данные и дочерние маршруты. Кроме того,
снимки статичны и не будут отражать будущие изменения.

Вот пример того, как получить доступ к снимку маршрута:

```angular-ts
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({ ... })
export class UserProfileComponent {
  readonly userId: string;
  private route = inject(ActivatedRoute);

  constructor() {
    // Пример URL: https://www.angular.dev/users/123?role=admin&status=active#contact

    // Доступ к параметрам маршрута из снимка
    this.userId = this.route.snapshot.paramMap.get('id');

    // Доступ к нескольким элементам маршрута
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url,           // https://www.angular.dev
      // Объект параметров маршрута: {id: '123'}
      params: snapshot.params,
      // Объект параметров запроса: {role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams,  // Параметры запроса
    });
  }
}
```

Ознакомьтесь с [API-документацией `ActivatedRoute`](/api/router/ActivatedRoute) и [API-документацией
`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для получения полного списка всех свойств, к которым вы
можете получить доступ.

## Чтение параметров маршрута

Существует два типа параметров, которые разработчики могут использовать из маршрута: параметры маршрута (route
parameters) и параметры запроса (query parameters).

### Параметры маршрута (Route Parameters)

Параметры маршрута позволяют передавать данные в компонент через URL. Это полезно, когда вы хотите отобразить конкретный
контент на основе идентификатора в URL, например, ID пользователя или ID продукта.

Вы можете [определить параметры маршрута](/guide/routing/define-routes#define-url-paths-with-route-parameters), добавив
двоеточие (`:`) перед именем параметра.

```angular-ts
import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
  { path: 'product/:id', component: ProductComponent }
];
```

Вы можете получить доступ к параметрам, подписавшись на `route.params`.

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Product Details: {{ productId() }}</h1>`,
})
export class ProductDetailComponent {
  productId = signal('');
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Доступ к параметрам маршрута
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

### Параметры запроса (Query Parameters)

[Параметры запроса](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) предоставляют гибкий способ
передачи необязательных данных через URL, не влияя на структуру маршрута. В отличие от параметров маршрута, параметры
запроса могут сохраняться при навигации и идеально подходят для обработки фильтрации, сортировки, пагинации и других
элементов пользовательского интерфейса, имеющих состояние.

```angular-ts
// Структура одиночного параметра
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: { category: 'electronics' }
});

// Несколько параметров
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1
  }
});
```

Вы можете получить доступ к параметрам запроса с помощью `route.queryParams`.

Вот пример `ProductListComponent`, который обновляет параметры запроса, влияющие на отображение списка продуктов:

```angular-ts
import { ActivatedRoute, Router } from '@angular/router';

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
  `
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Реактивный доступ к параметрам запроса
    this.route.queryParams.subscribe(params => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // Обновление URL с новым параметром запроса
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge' // Сохранить остальные параметры запроса
    });
  }
}
```

В этом примере пользователи могут использовать элемент select для сортировки списка продуктов по названию или цене.
Связанный обработчик изменений обновляет параметры запроса URL, что, в свою очередь, вызывает событие изменения,
позволяющее прочитать обновленные параметры запроса и обновить список продуктов.

Для получения дополнительной информации ознакомьтесь
с [официальной документацией по QueryParamsHandling](/api/router/QueryParamsHandling).

### Матричные параметры (Matrix Parameters)

Матричные параметры — это необязательные параметры, которые относятся к конкретному сегменту URL, а не ко всему
маршруту. В отличие от параметров запроса, которые появляются после `?` и применяются глобально, матричные параметры
используют точки с запятой (`;`) и ограничены отдельными сегментами пути.

Матричные параметры полезны, когда необходимо передать вспомогательные данные в конкретный сегмент маршрута, не влияя на
определение маршрута или поведение сопоставления. Как и параметры запроса, их не нужно определять в конфигурации
маршрута.

```ts
// Формат URL: /path;key=value
// Несколько параметров: /path;key1=value1;key2=value2

// Навигация с матричными параметрами
this.router.navigate(['/awesome-products', { view: 'grid', filter: 'new' }]);
// Результат в URL: /awesome-products;view=grid;filter=new
```

**Использование ActivatedRoute**

```ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component(/* ... */)
export class AwesomeProducts  {
  private route = inject(ActivatedRoute);

  constructor() {
    // Доступ к матричным параметрам через params
    this.route.params.subscribe((params) => {
      const view = params['view']; // например, 'grid'
      const filter = params['filter']; // например, 'new'
    });
  }
}
```

ПРИМЕЧАНИЕ: В качестве альтернативы использованию `ActivatedRoute`, матричные параметры также привязываются к
Input-свойствам компонента при использовании `withComponentInputBinding`.

## Определение активного текущего маршрута с помощью RouterLinkActive

Вы можете использовать директиву `RouterLinkActive` для динамической стилизации элементов навигации на основе текущего
активного маршрута. Это часто используется в элементах навигации, чтобы сообщить пользователям, какой маршрут является
активным.

```angular-html
<nav>
  <a class="button"
     routerLink="/about"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    About
  </a> |
  <a class="button"
     routerLink="/settings"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    Settings
  </a>
</nav>
```

В этом примере Angular Router применит класс `active-button` к соответствующей ссылке и `ariaCurrentWhenActive` со
значением `page`, когда URL совпадет с соответствующим `routerLink`.

Если вам нужно добавить несколько классов к элементу, вы можете использовать либо строку с разделением пробелами, либо
массив:

```angular-html
<!-- Синтаксис строки с разделением пробелами -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Синтаксис массива -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

Когда вы указываете значение для routerLinkActive, вы также определяете то же значение для `ariaCurrentWhenActive`. Это
гарантирует, что пользователи с нарушениями зрения (которые могут не воспринимать примененные стили) также смогут
идентифицировать активную кнопку.

Если вы хотите определить другое значение для aria, вам нужно явно задать его с помощью директивы
`ariaCurrentWhenActive`.

### Стратегия сопоставления маршрутов

По умолчанию `RouterLinkActive` считает совпадением любых предков в маршруте.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link">
  User
</a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link">
  Role
</a>
```

Когда пользователь посещает `/user/jane/role/admin`, обе ссылки будут иметь класс `active-link`.

### Применение RouterLinkActive только при точном совпадении маршрута

Если вы хотите применять класс только при точном совпадении, вам нужно передать директиве `routerLinkActiveOptions`
объект конфигурации, содержащий значение `exact: true`.

```angular-html
<a [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
<a [routerLink]="['/user/jane/role/admin']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  Role
</a>
```

Если вы хотите более точно настроить сопоставление маршрута, стоит отметить, что `exact: true` на самом деле является
синтаксическим сахаром для полного набора опций сопоставления:

```angular-ts
// `exact: true` эквивалентно
{
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
}

// `exact: false` эквивалентно
{
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
}
```

Для получения дополнительной информации ознакомьтесь с официальной документацией
по [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

### Применение RouterLinkActive к элементу-предку

Директива RouterLinkActive также может быть применена к элементу-предку, чтобы позволить разработчикам стилизовать
элементы по своему усмотрению.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

Для получения дополнительной информации ознакомьтесь
с [API-документацией для RouterLinkActive](/api/router/RouterLinkActive).
