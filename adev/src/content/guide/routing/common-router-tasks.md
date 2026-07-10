# Другие распространённые задачи маршрутизации

Это руководство охватывает некоторые другие распространённые задачи, связанные с использованием Angular router в приложении.

## Получение информации о маршруте {#getting-route-information}

Часто, когда пользователь перемещается по приложению, нужно передать информацию от одного компонента другому.
Например, рассмотрим приложение, отображающее список покупок продуктов.
У каждого элемента списка есть уникальный `id`.
Чтобы отредактировать элемент, пользователи нажимают кнопку Edit, которая открывает компонент `EditGroceryItem`.
Вы хотите, чтобы этот компонент получил `id` продукта, чтобы показать пользователю правильную информацию.

Используйте маршрут, чтобы передать такой тип информации компонентам приложения.
Для этого используйте возможность `withComponentInputBinding` с `provideRouter` или опцию `bindToComponentInputs` у `RouterModule.forRoot`.

Чтобы получить информацию из маршрута:

<docs-workflow>

<docs-step title="Add `withComponentInputBinding`">

Добавьте возможность `withComponentInputBinding` в метод `provideRouter`.

```ts
providers: [provideRouter(appRoutes, withComponentInputBinding())];
```

</docs-step>

<docs-step title="Add an `input` to the component">

Обновите компонент, чтобы у него было свойство `input()`, совпадающее с именем параметра.

```ts
id = input.required<string>();
hero = computed(() => this.service.getHero(id()));
```

</docs-step>
<docs-step title="Optional: Use a default value">
Роутер назначает значения всем inputs на основе текущего маршрута, когда включён `withComponentInputBinding`.
Роутер назначает `undefined`, если данные маршрута не совпадают с ключом input, например когда отсутствует опциональный query-параметр.
Следует включать `undefined` в тип `input`, когда есть возможность, что input может не совпасть с маршрутом.

Предоставьте значение по умолчанию, используя опцию `transform` на input или управляя локальным состоянием через `linkedSignal`.

```ts
id = input.required({
  transform: (maybeUndefined: string | undefined) => maybeUndefined ?? '0',
});
// or
id = input<string | undefined>();
internalId = linkedSignal(() => this.id() ?? getDefaultId());
```

</docs-step>
</docs-workflow>

NOTE: Можно привязать все данные маршрута с парами ключ–значение к inputs компонента: статические или resolved данные маршрута, path-параметры, matrix-параметры и query-параметры.

### Отключение привязки query-параметров {#disable-query-parameter-binding}

Используйте `ComponentInputBindingOptions`, чтобы отключить привязку query-параметров, если вы управляете query-параметрами отдельно:

```ts
provideRouter(appRoutes, withComponentInputBinding({queryParams: false}));
```

### Настройка поведения для inputs, недоступных в данных роутера {#configure-behavior-for-inputs-not-available-in-router-data}

По умолчанию роутер устанавливает input в `undefined`, если он не был доступен в данных роутера во время навигации. Это гарантирует, что устаревшие данные не сохраняются.

Если хотите избежать установки `undefined` для inputs, которые _никогда_ не были доступны в данных роутера для активного экземпляра компонента, можно установить опцию `unmatchedInputBehavior` в `'undefinedIfStale'`:

```ts
provideRouter(appRoutes, withComponentInputBinding({unmatchedInputBehavior: 'undefinedIfStale'}));
```

Когда вы комбинируете `unmatchedInputBehavior: 'undefinedIfStale'` с `queryParams: false`, inputs сохраняют начальные значения, если они явно не предоставлены роутером. Исключение — matrix-параметры: если matrix-параметр предоставлен в одной навигации и удалён в последующей, роутер установит input в `undefined`, чтобы избежать сохранения устаревших данных.

```ts
provideRouter(
  appRoutes,
  withComponentInputBinding({
    queryParams: false,
    unmatchedInputBehavior: 'undefinedIfStale',
  }),
);
```

### Наследование данных родительского маршрута {#inherit-parent-route-data}

По умолчанию дочерние маршруты наследуют параметры и данные от родительских маршрутов (эквивалент `paramsInheritanceStrategy: 'always'`). Это значит, что можно обращаться к информации родительского маршрута напрямую в дочерних компонентах.

Если нужно восстановить legacy-поведение, где параметры наследовались только от маршрутов с пустым путём, можно установить `paramsInheritanceStrategy` в `'emptyOnly'`:

```ts
provideRouter(routes, withRouterConfig({paramsInheritanceStrategy: 'emptyOnly'}));
```

См. [опции конфигурации роутера](guide/routing/customizing-route-behavior#router-configuration-options) для подробностей о других доступных настройках.

## Отображение страницы 404 {#displaying-a-404-page}

Чтобы отобразить страницу 404, настройте [wildcard-маршрут](guide/routing/define-routes#wildcards) со свойством `component`, установленным в компонент, который хотите использовать для страницы 404:

```ts
const routes: Routes = [
  {path: 'first-component', component: First},
  {path: 'second-component', component: Second},
  {path: '**', component: PageNotFound}, // Wildcard route for a 404 page
];
```

Последний маршрут с `path` `**` — wildcard-маршрут.
Роутер выбирает этот маршрут, если запрошенный URL не совпадает ни с одним из путей ранее в списке, и отправляет пользователя на `PageNotFound`.

## Массив параметров ссылки {#link-parameters-array}

Массив параметров ссылки содержит следующие ингредиенты для навигации роутера:

- Путь маршрута к компоненту назначения
- Обязательные и опциональные параметры маршрута, попадающие в URL маршрута

Привяжите директиву `RouterLink` к такому массиву так:

```angular-html
<a [routerLink]="['/heroes']">Heroes</a>
```

Следующее — двухэлементный массив при указании параметра маршрута:

```angular-html
<a [routerLink]="['/hero', hero.id]">
  <span class="badge">{{ hero.id }}</span
  >{{ hero.name }}
</a>
```

Предоставляйте опциональные параметры маршрута в объекте, как в `{ foo: 'foo' }`:

```angular-html
<a [routerLink]="['/crisis-center', {foo: 'foo'}]">Crisis Center</a>
```

Этот синтаксис передаёт matrix-параметры — опциональные параметры, связанные с конкретным сегментом URL. Подробнее о [matrix-параметрах](/guide/routing/read-route-state#matrix-parameters).

Эти три примера покрывают потребности приложения с одним уровнем маршрутизации.
Однако с дочерним роутером, как в crisis center, появляются новые возможности массива ссылок.

Следующий минимальный пример `RouterLink` строится на указанном дочернем маршруте по умолчанию для crisis center.

```angular-html
<a [routerLink]="['/crisis-center']">Crisis Center</a>
```

Обратите внимание:

- Первый элемент массива идентифицирует родительский маршрут \(`/crisis-center`\)
- Для этого родительского маршрута нет параметров
- Нет значения по умолчанию для дочернего маршрута, поэтому нужно выбрать одно
- Вы переходите к `CrisisList`, чей путь маршрута — `/`, но явно добавлять слэш не нужно

Рассмотрим следующую ссылку роутера, которая навигирует от корня приложения вниз к Dragon Crisis:

```angular-html
<a [routerLink]="['/crisis-center', 1]">Dragon Crisis</a>
```

- Первый элемент массива идентифицирует родительский маршрут \(`/crisis-center`\)
- Для этого родительского маршрута нет параметров
- Второй элемент идентифицирует дочерний маршрут деталей о конкретном кризисе \(`/:id`\)
- Дочерний маршрут деталей требует параметр маршрута `id`
- Вы добавили `id` Dragon Crisis как второй элемент массива \(`1`\)
- Результирующий путь — `/crisis-center/1`

Также можно переопределить шаблон `App` исключительно с маршрутами Crisis Center:

```angular-ts
@Component({
  template: `
    <h1 class="title">Angular Router</h1>
    <nav>
      <a [routerLink]="['/crisis-center']">Crisis Center</a>
      <a [routerLink]="['/crisis-center/1', {foo: 'foo'}]">Dragon Crisis</a>
      <a [routerLink]="['/crisis-center/2']">Shark Crisis</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
```

Итого, можно писать приложения с одним, двумя или более уровнями маршрутизации.
Массив параметров ссылки даёт гибкость представлять любую глубину маршрутизации и любую допустимую последовательность путей маршрутов, \(обязательных\) параметров роутера и \(опциональных\) объектов параметров маршрута.

## `LocationStrategy` и стили URL браузера {#locationstrategy-and-browser-url-styles}

Когда роутер переходит к новому представлению компонента, он обновляет location и историю браузера URL для этого представления.

Современные браузеры HTML5 поддерживают [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries 'HTML5 browser history push-state') — технику, которая меняет location и историю браузера без запуска запроса страницы к серверу.
Роутер может составить «естественный» URL, неотличимый от того, который иначе потребовал бы загрузки страницы.

Вот URL Crisis Center в этом стиле «HTML5 pushState»:

```text
localhost:3002/crisis-center
```

Старые браузеры отправляют запросы страниц на сервер при изменении URL location, если изменение не происходит после «#» \(называемого «hash»\).
Роутеры могут воспользоваться этим исключением, составляя URL маршрутов в приложении с хешами.
Вот «hash URL», который маршрутизирует к Crisis Center.

```text
localhost:3002/src/#/crisis-center
```

Роутер поддерживает оба стиля двумя провайдерами `LocationStrategy`:

| Провайдеры             | Подробности                          |
| :--------------------- | :----------------------------------- |
| `PathLocationStrategy` | Стиль «HTML5 pushState» по умолчанию. |
| `HashLocationStrategy` | Стиль «hash URL».                    |

Функция `RouterModule.forRoot()` устанавливает `LocationStrategy` в `PathLocationStrategy`, делая её стратегией по умолчанию.
Также есть опция переключиться на `HashLocationStrategy` с переопределением во время процесса bootstrap.

HELPFUL: Подробнее о провайдерах и процессе bootstrap см. [Внедрение зависимостей](guide/di/defining-dependency-providers).
