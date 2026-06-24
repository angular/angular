# Миграция на маршруты с ленивой загрузкой

Эта схема помогает разработчикам преобразовать маршруты компонентов с активной загрузкой (eagerly loaded) в маршруты с
ленивой загрузкой (lazy loaded). Это позволяет процессу сборки разделять продакшн-бандл на более мелкие чанки, избегая
создания большого JS-бандла, включающего все маршруты, что негативно сказывается на начальной загрузке приложения.

Запустите схему, используя следующую команду:

```shell
ng generate @angular/core:route-lazy-loading
```

### Опция конфигурации `path`

По умолчанию миграция проходит по всему приложению. Если вы хотите применить эту миграцию к подмножеству файлов, вы
можете передать аргумент пути, как показано ниже:

```shell
ng generate @angular/core:route-lazy-loading --path src/app/sub-component
```

Значение параметра path — это относительный путь внутри проекта.

### Как это работает?

Схема попытается найти все места, где определены маршруты приложения:

- `RouterModule.forRoot` и `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- `provideRoutes`
- переменные типа `Routes` или `Route[]` (например, `const routes: Routes = [{...}]`)

Миграция проверит все компоненты в маршрутах, определит, являются ли они standalone-компонентами и загружаются ли они
сразу. Если это так, она преобразует их в маршруты с ленивой загрузкой.

#### До

```typescript
// app.module.ts
import {HomeComponent} from './home/home.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // HomeComponent является standalone-компонентом и загружается сразу
        component: HomeComponent,
      },
    ]),
  ],
})
export class AppModule {}
```

#### После

```typescript
// app.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // ↓ HomeComponent теперь загружается лениво
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
      },
    ]),
  ],
})
export class AppModule {}
```

Эта миграция также соберет информацию обо всех компонентах, объявленных в NgModules, и выведет список маршрутов, которые
их используют (включая соответствующее расположение файла). Рассмотрите возможность сделать эти компоненты
standalone-компонентами и запустите эту миграцию снова. Вы можете использовать существующую
миграцию ([см. здесь](reference/migrations/standalone)) для преобразования этих компонентов в standalone.
