# Миграция на синтаксис потока управления

[Синтаксис потока управления](guide/templates/control-flow) доступен начиная с Angular v17. Новый синтаксис встроен в
шаблон, поэтому вам больше не нужно импортировать `CommonModule`.

Этот схематик переводит весь существующий код вашего приложения на использование нового синтаксиса потока управления.

Запустите схематик с помощью следующей команды:

```shell
ng generate @angular/core:control-flow
```

## Breaking changes

### `@for` view reuse

Using `@for` block if a property used in the `track` expression changes but the object reference remains the same (in-place modification), Angular updates the view's bindings (including component inputs) instead of destroying and recreating the element.

This differs from `*ngFor`, which would execute a remount (destroy and recreate) of the element in a similar scenario if the `trackBy` function returned a different value.
