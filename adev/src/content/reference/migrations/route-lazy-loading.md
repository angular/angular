# Миграция на ленивую загрузку маршрутов

Этот схематик помогает разработчикам преобразовать маршруты с немедленной загрузкой компонентов на ленивую загрузку. Это позволяет процессу сборки разбить production-бандл на более мелкие части, избегая большого JS-бандла, включающего все маршруты, что негативно сказывается на начальной загрузке страницы приложения.

Запустите схематик с помощью следующей команды:

```shell
ng generate @angular/core:route-lazy-loading
```

### Параметр конфигурации `path` {#path-config-option}

По умолчанию миграция обходит всё приложение. Если вы хотите применить миграцию только к части файлов, можно передать аргумент `path` следующим образом:

```shell
ng generate @angular/core:route-lazy-loading --path src/app/sub-component
```

Значение параметра `path` — это относительный путь внутри проекта.

### Как это работает? {#how-does-it-work}

Схематик пытается найти все места, где определены маршруты приложения:

- `RouterModule.forRoot` и `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- переменные типа `Routes` или `Route[]` (например, `const routes: Routes = [{...}]`)

Миграция проверяет все компоненты в маршрутах, определяет, являются ли они standalone и загружаются немедленно, и если да — преобразует их в маршруты с ленивой загрузкой.

#### До {#before}

```typescript
// app.module.ts
import {Home} from './home';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // Home является standalone и загружается немедленно
        component: Home,
      },
    ]),
  ],
})
export class AppModule {}
```

#### После {#after}

```typescript
// app.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // ↓ Home теперь загружается лениво
        loadComponent: () => import('./home').then((m) => m.Home),
      },
    ]),
  ],
})
export class AppModule {}
```

Эта миграция также собирает информацию обо всех компонентах, объявленных в NgModules, и выводит список маршрутов, которые их используют (включая соответствующее расположение файла). Рассмотрите возможность сделать эти компоненты standalone и запустить миграцию снова. Для преобразования компонентов в standalone можно использовать существующую миграцию ([см.](reference/migrations/standalone)).
