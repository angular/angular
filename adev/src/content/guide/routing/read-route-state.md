# Чтение состояния маршрута {#read-route-state}

Angular Router позволяет читать и использовать информацию, связанную с маршрутом, для создания отзывчивых и контекстно-зависимых компонентов.

## Получение информации о текущем маршруте с помощью ActivatedRoute {#get-information-about-the-current-route-with-activatedroute}

`ActivatedRoute` — это Сервис из `@angular/router`, предоставляющий всю информацию о текущем маршруте.

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

`ActivatedRoute` может предоставлять различную информацию о маршруте. Среди распространённых свойств:

| Свойство      | Описание                                                                                                                                               |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | `Observable` путей маршрута, представленных в виде массива строк для каждой части пути маршрута.                                                       |
| `data`        | `Observable`, содержащий объект `data`, предоставленный для маршрута. Также содержит любые разрешённые значения из Guard резолвера.                   |
| `params`      | `Observable`, содержащий обязательные и необязательные параметры, характерные для маршрута.                                                           |
| `queryParams` | `Observable`, содержащий параметры запроса, доступные для всех маршрутов.                                                                             |

Полный список доступных свойств — в [API-документации `ActivatedRoute`](/api/router/ActivatedRoute).

## Понимание снимков маршрута {#understanding-route-snapshots}

Переходы между страницами — это события во времени, и получить состояние Роутера в определённый момент можно через снимок маршрута.

Снимки маршрута содержат основную информацию о маршруте, включая его параметры, данные и дочерние маршруты. Кроме того, снимки статичны и не отражают будущих изменений.

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
    // Пример URL: https://www.angular.dev/users/123?role=admin&status=active#contact

    // Доступ к параметрам маршрута из снимка
    this.userId = this.route.snapshot.paramMap.get('id');

    // Доступ к нескольким элементам маршрута
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url, // https://www.angular.dev
      // Объект параметров маршрута: {id: '123'}
      params: snapshot.params,
      // Объект параметров запроса: {role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams, // Параметры запроса
    });
  }
}
```

Полный список всех доступных свойств — в [API-документации `ActivatedRoute`](/api/router/ActivatedRoute) и [API-документации `ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot).

## Чтение параметров маршрута {#reading-parameters-on-a-route}

Существует два типа параметров, которые разработчики могут использовать из маршрута: параметры маршрута и параметры запроса.

### Параметры маршрута {#route-parameters}

Параметры маршрута позволяют передавать данные в компонент через URL. Это полезно, когда нужно отображать определённый контент на основе идентификатора в URL, например идентификатора пользователя или продукта.

[Определить параметры маршрута](/guide/routing/define-routes#define-url-paths-with-route-parameters) можно, добавив двоеточие (`:`) перед именем параметра.

```angular-ts
import {Routes} from '@angular/router';
import {Product} from './product';

const routes: Routes = [{path: 'product/:id', component: Product}];
```

Получить параметры можно, подписавшись на `route.params`.

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
    // Доступ к параметрам маршрута
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

### Параметры запроса {#query-parameters}

[Параметры запроса](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) предоставляют гибкий способ передачи необязательных данных через URL без изменения структуры маршрута. В отличие от параметров маршрута, параметры запроса могут сохраняться в разных навигационных событиях и идеально подходят для обработки фильтрации, сортировки, пагинации и других элементов UI с сохранением состояния.

```angular-ts
// Структура с одним параметром
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: {category: 'electronics'},
});

// Несколько параметров
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1,
  },
});
```

Параметры запроса доступны через `route.queryParams`.

Вот пример компонента `ProductList`, который обновляет параметры запроса, влияющие на отображение списка продуктов:

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
      <!-- Список продуктов -->
    </div>
  `,
})
export class ProductList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Реактивный доступ к параметрам запроса
    this.route.queryParams.subscribe((params) => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // Обновление URL новым параметром запроса
    this.router.navigate([], {
      queryParams: {sort},
      queryParamsHandling: 'merge', // Сохранение других параметров запроса
    });
  }
}
```

В этом примере пользователи могут использовать элемент select для сортировки списка продуктов по имени или цене. Соответствующий обработчик изменений обновляет параметры запроса URL, что в свою очередь инициирует событие изменения для чтения обновлённых параметров запроса и обновления списка продуктов.

Подробнее — в [официальной документации по QueryParamsHandling](/api/router/QueryParamsHandling).

### Матричные параметры {#matrix-parameters}

Матричные параметры — это необязательные параметры, принадлежащие конкретному сегменту URL, а не применяемые ко всему маршруту. В отличие от параметров запроса, которые идут после `?` и применяются глобально, матричные параметры используют точки с запятой (`;`) и привязаны к отдельным сегментам пути.

Матричные параметры полезны, когда нужно передавать вспомогательные данные конкретному сегменту маршрута, не влияя на определение или поведение сопоставления маршрута. Как и параметры запроса, их не нужно определять в конфигурации маршрута.

```ts
// Формат URL: /path;key=value
// Несколько параметров: /path;key1=value1;key2=value2

// Навигация с матричными параметрами
this.router.navigate(['/awesome-products', {view: 'grid', filter: 'new'}]);
// Результирующий URL: /awesome-products;view=grid;filter=new
```

**Использование ActivatedRoute**

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component(/* ... */)
export class AwesomeProducts {
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

NOTE: В качестве альтернативы использованию `ActivatedRoute`, матричные параметры также привязываются к входным данным компонента при использовании `withComponentInputBinding`.

## Определение активного маршрута с RouterLinkActive {#detect-active-current-route-with-routerlinkactive}

Директива `RouterLinkActive` позволяет динамически стилизовать навигационные элементы на основе текущего активного маршрута. Это распространённая практика в навигационных элементах для информирования пользователей об активном маршруте.

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

В этом примере Angular Router применит класс `active-button` к правильной якорной ссылке и установит `ariaCurrentWhenActive` в значение `page`, когда URL совпадает с соответствующим `routerLink`.

Если нужно добавить несколько классов к элементу, можно использовать как строку с разделителями-пробелами, так и массив:

```angular-html
<!-- Синтаксис строки с разделителями-пробелами -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Синтаксис массива -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

При указании значения для routerLinkActive вы также определяете то же значение для `ariaCurrentWhenActive`. Это гарантирует, что пользователи с ограниченными возможностями (которые могут не воспринимать применяемые визуальные стили) также смогут определить активную кнопку.

Если нужно определить другое значение для aria, необходимо явно задать его с помощью директивы `ariaCurrentWhenActive`.

### Стратегия сопоставления маршрутов {#route-matching-strategy}

По умолчанию `RouterLinkActive` считает совпадением любых предков в маршруте.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link"> User </a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link"> Role </a>
```

Когда пользователь посещает `/user/jane/role/admin`, оба элемента получат класс `active-link`.

### Применение RouterLinkActive только при точном совпадении маршрута {#only-apply-routerlinkactive-on-exact-route-matches}

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

Если нужна более точная настройка сопоставления маршрута, стоит отметить, что `exact: true` — это синтаксический сахар для полного набора параметров сопоставления:

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

Подробнее — в официальной документации по [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

### Применение RouterLinkActive к родительскому элементу {#apply-routerlinkactive-to-an-ancestor}

Директиву RouterLinkActive также можно применять к родительскому элементу, что позволяет разработчикам стилизовать элементы по своему усмотрению.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

Подробнее — в [API-документации RouterLinkActive](/api/router/RouterLinkActive).

## Проверка активности URL {#check-if-a-url-is-active}

Функция `isActive` возвращает вычисляемый Сигнал, отслеживающий, активен ли данный URL в Роутере в текущий момент. Сигнал автоматически обновляется при изменении состояния Роутера.

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
