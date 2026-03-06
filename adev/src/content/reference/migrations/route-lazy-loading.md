# Миграция к ленивой загрузке маршрутов {#migration-to-lazy-loaded-routes}

Эта схема помогает разработчикам конвертировать маршруты с энергичной загрузкой компонентов в маршруты с ленивой загрузкой. Это позволяет процессу сборки разделить продакшен-бандл на меньшие фрагменты, чтобы избежать большого JS-бандла, включающего все маршруты, что негативно влияет на начальную загрузку страницы приложения.

Запустите схему с помощью следующей команды:

```shell
ng generate @angular/core:route-lazy-loading
```

### Параметр конфигурации `path` {#path-config-option}

По умолчанию миграция обрабатывает всё приложение. Если вы хотите применить миграцию к подмножеству файлов, передайте аргумент path, как показано ниже:

```shell
ng generate @angular/core:route-lazy-loading --path src/app/sub-component
```

Значение параметра path является относительным путём внутри проекта.

### Как это работает? {#how-does-it-work}

Схема попытается найти все места, где определены маршруты приложения:

- `RouterModule.forRoot` и `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- переменные типа `Routes` или `Route[]` (например, `const routes: Routes = [{...}]`)

Миграция проверит все компоненты в маршрутах, проверит, являются ли они Standalone и загружаются энергично, и если да, конвертирует их в маршруты с ленивой загрузкой.

#### До {#before}

```typescript
// app.module.ts
import {Home} from './home';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // Home является standalone и загружается энергично
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

Эта миграция также соберёт информацию обо всех компонентах, объявленных в NgModules, и выведет список маршрутов, которые их используют (включая соответствующее расположение файла). Рассмотрите возможность сделать эти компоненты Standalone и запустить миграцию повторно. Вы можете использовать существующую миграцию ([см.](reference/migrations/standalone)) для конвертации этих компонентов в Standalone.
