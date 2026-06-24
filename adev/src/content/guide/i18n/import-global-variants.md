# Импорт глобальных вариантов данных локали

[Angular CLI][CliMain] автоматически включает данные локали, если вы запускаете команду [`ng build`][CliBuild] с опцией
`--localize`.

<!--todo: replace with docs-code -->

```shell
ng build --localize
```

HELPFUL: Базовая установка Angular уже содержит данные локали для английского языка в США \(`en-US`\).
[Angular CLI][CliMain] автоматически включает данные локали и устанавливает значение `LOCALE_ID`, когда вы используете
опцию `--localize` с командой [`ng build`][CliBuild].

Пакет `@angular/common` в npm содержит файлы данных локали.
Глобальные варианты данных локали доступны в `@angular/common/locales/global`.

## Пример `import` для французского языка

Например, вы можете импортировать глобальные варианты для французского языка \(`fr`\) в файле `main.ts`, где происходит
инициализация (bootstrap) приложения.

<docs-code header="src/main.ts (импорт локали)" path="adev/src/content/examples/i18n/src/main.ts" visibleRegion="global-locale"/>

HELPFUL: В приложении на основе `NgModules` импорт следует выполнять в вашем `app.module`.

[CliMain]: cli 'Обзор CLI и справочник команд | Angular'
[CliBuild]: cli/build 'ng build | CLI | Angular'
