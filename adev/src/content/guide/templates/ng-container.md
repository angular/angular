# Группировка элементов с ng-container {#grouping-elements-with-ng-container}

`<ng-container>` — это специальный элемент в Angular, который группирует несколько элементов или отмечает место в шаблоне без отображения реального элемента в DOM.

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

К `<ng-container>` можно применять директивы для добавления поведения или конфигурации к части шаблона.

Angular игнорирует все привязки атрибутов и обработчики событий, применённые к `<ng-container>`, включая применённые через директиву.

## Использование `<ng-container>` для отображения динамического контента {#using-ng-container-to-display-dynamic-contents}

`<ng-container>` может выступать заполнителем для рендеринга динамического контента.

### Рендеринг компонентов {#rendering-components}

Можно использовать встроенную директиву Angular `NgComponentOutlet` для динамического рендеринга компонента в место расположения `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngComponentOutlet]="profileComponent()" />
  `,
})
export class UserProfile {
  isAdmin = input(false);
  profileComponent = computed(() => (this.isAdmin() ? AdminProfile : BasicUserProfile));
}
```

В примере выше директива `NgComponentOutlet` динамически рендерит либо `AdminProfile`, либо `BasicUserProfile` в место расположения элемента `<ng-container>`.

### Рендеринг фрагментов шаблона {#rendering-template-fragments}

Можно использовать встроенную директиву Angular `NgTemplateOutlet` для динамического рендеринга фрагмента шаблона в место расположения `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngTemplateOutlet]="profileTemplate()" />

    <ng-template #admin>This is the admin profile</ng-template>
    <ng-template #basic>This is the basic profile</ng-template>
  `,
})
export class UserProfile {
  isAdmin = input(false);
  adminTemplate = viewChild('admin', {read: TemplateRef});
  basicTemplate = viewChild('basic', {read: TemplateRef});
  profileTemplate = computed(() => (this.isAdmin() ? this.adminTemplate() : this.basicTemplate()));
}
```

В примере выше директива `ngTemplateOutlet` динамически рендерит один из двух фрагментов шаблона в место расположения элемента `<ng-container>`.

Подробнее о `NgTemplateOutlet` см. на [странице документации NgTemplateOutlet API](api/common/NgTemplateOutlet).

## Использование `<ng-container>` со структурными директивами {#using-ng-container-with-structural-directives}

Структурные директивы также можно применять к элементам `<ng-container>`. Распространённые примеры включают `ngIf` и `ngFor`.

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

## Использование `<ng-container>` для внедрения зависимостей {#using-ng-container-for-injection}

Подробнее о системе внедрения зависимостей Angular см. в [руководстве по внедрению зависимостей](guide/di).

При применении директивы к `<ng-container>` дочерние элементы могут внедрять директиву или то, что она предоставляет. Используйте это, когда нужно декларативно предоставить значение определённой части шаблона.

```angular-ts
@Directive({
  selector: '[theme]',
})
export class Theme {
  // Create an input that accepts 'light' or 'dark`, defaulting to 'light'.
  mode = input<'light' | 'dark'>('light');
}
```

```angular-html
<ng-container theme="dark">
  <profile-pic />
  <user-bio />
</ng-container>
```

В примере выше компоненты `ProfilePic` и `UserBio` могут внедрять директиву `Theme` и применять стили на основе её `mode`.
