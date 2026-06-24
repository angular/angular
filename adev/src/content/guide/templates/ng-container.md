# Группировка элементов с помощью ng-container

`<ng-container>` — это специальный элемент в Angular, который группирует несколько элементов вместе или помечает место в
шаблоне без рендеринга реального элемента в DOM.

```angular-html
<!-- Component template -->
<section>
  <ng-container>
    <h3>User bio</h3>
    <p>Here's some info about the user</p>
  </ng-container>
</section>
```

```angular-html
<!-- Rendered DOM -->
<section>
  <h3>User bio</h3>
  <p>Here's some info about the user</p>
</section>
```

Вы можете применять директивы к `<ng-container>` для добавления поведения или конфигурации к части вашего шаблона.

Angular игнорирует все привязки атрибутов и слушатели событий, примененные к `<ng-container>`, включая те, что
применяются через директиву.

## Использование `<ng-container>` для отображения динамического контента

`<ng-container>` может выступать в качестве заполнителя (placeholder) для рендеринга динамического контента.

### Рендеринг компонентов

Вы можете использовать встроенную директиву Angular `NgComponentOutlet` для динамического рендеринга компонента в месте
расположения `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngComponentOutlet]="profileComponent()" />
  `
})
export class UserProfile {
  isAdmin = input(false);
  profileComponent = computed(() => this.isAdmin() ? AdminProfile : BasicUserProfile);
}
```

В приведенном выше примере директива `NgComponentOutlet` динамически рендерит `AdminProfile` или `BasicUserProfile` в
месте расположения элемента `<ng-container>`.

### Рендеринг фрагментов шаблона

Вы можете использовать встроенную директиву Angular `NgTemplateOutlet` для динамического рендеринга фрагмента шаблона в
месте расположения `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngTemplateOutlet]="profileTemplate()" />

    <ng-template #admin>This is the admin profile</ng-template>
    <ng-template #basic>This is the basic profile</ng-template>
  `
})
export class UserProfile {
  isAdmin = input(false);
  adminTemplate = viewChild('admin', {read: TemplateRef});
  basicTemplate = viewChild('basic', {read: TemplateRef});
  profileTemplate = computed(() => this.isAdmin() ? this.adminTemplate() : this.basicTemplate());
}
```

В приведенном выше примере директива `ngTemplateOutlet` динамически рендерит один из двух фрагментов шаблона в месте
расположения элемента `<ng-container>`.

Для получения дополнительной информации о NgTemplateOutlet
см. [страницу документации API NgTemplateOutlet](/api/common/NgTemplateOutlet).

## Использование `<ng-container>` со структурными директивами

Вы также можете применять структурные директивы к элементам `<ng-container>`. Распространенными примерами являются
`ngIf` и `ngFor`.

```angular-html
<ng-container *ngIf="permissions == 'admin'">
  <h1>Admin Dashboard</h1>
  <admin-infographic />
</ng-container>

<ng-container *ngFor="let item of items; index as i; trackBy: trackByFn">
  <h2>{{ item.title }}</h2>
  <p>{{ item.description }}</p>
</ng-container>
```

## Использование `<ng-container>` для внедрения зависимостей

См. руководство по Внедрению зависимостей (Dependency Injection) для получения дополнительной информации о системе DI в
Angular.

Когда вы применяете директиву к `<ng-container>`, дочерние элементы могут внедрять эту директиву или все, что она
предоставляет. Используйте это, когда хотите декларативно предоставить значение определенной части вашего шаблона.

```angular-ts
@Directive({
  selector: '[theme]',
})
export class Theme {
  // Создаем input, который принимает 'light' или 'dark', по умолчанию 'light'.
  mode = input<'light' | 'dark'>('light');
}
```

```angular-html
<ng-container theme="dark">
  <profile-pic />
  <user-bio />
</ng-container>
```

В приведенном выше примере компоненты `ProfilePic` и `UserBio` могут внедрить директиву `Theme` и применить стили на
основе ее свойства `mode`.
