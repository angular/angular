# Обращение к локалям по идентификатору

Angular использует _идентификатор локали_ Unicode (Unicode locale ID) для поиска соответствующих данных локали при
интернационализации текстовых строк.

<docs-callout title="Идентификатор локали Unicode">

- ID локали соответствует основной
  спецификации [Unicode Common Locale Data Repository (CLDR)][UnicodeCldrDevelopmentCoreSpecification].
  Для получения дополнительной информации об ID локалей
  см. [Идентификаторы языка и локали Unicode][UnicodeCldrDevelopmentCoreSpecificationLocaleIDs].

- CLDR и Angular используют [теги BCP 47][RfcEditorInfoBcp47] в качестве основы для ID локали.

</docs-callout>

Идентификатор локали определяет язык, страну и необязательный код для дополнительных вариантов или регионов.
ID локали состоит из идентификатора языка, символа дефиса (`-`) и расширения локали.

```html
{language_id}-{locale_extension}
```

ПОЛЕЗНО: Чтобы точно перевести ваш Angular-проект, необходимо решить, на какие языки и локали вы ориентируетесь при
интернационализации.

Многие страны используют один и тот же язык, но различаются в особенностях его использования.
Различия включают грамматику, пунктуацию, форматы валют, десятичных чисел, дат и так далее.

Для примеров в этом руководстве используются следующие языки и локали.

| Язык        | Локаль                    | ID локали Unicode |
| :---------- | :------------------------ | :---------------- |
| Английский  | Канада                    | `en-CA`           |
| Английский  | Соединенные Штаты Америки | `en-US`           |
| Французский | Канада                    | `fr-CA`           |
| Французский | Франция                   | `fr-FR`           |

[Репозиторий Angular][GithubAngularAngularTreeMasterPackagesCommonLocales] содержит распространенные локали.

<docs-callout>
Список кодов языков см. в стандарте [ISO 639-2](https://www.loc.gov/standards/iso639-2).
</docs-callout>

## Установка ID исходной локали

Используйте Angular CLI, чтобы задать исходный язык, на котором вы пишете шаблон компонента и код.

По умолчанию Angular использует `en-US` в качестве исходной локали вашего проекта.

Чтобы изменить исходную локаль вашего проекта для сборки, выполните следующие действия.

1. Откройте файл конфигурации сборки рабочего пространства [`angular.json`][GuideWorkspaceConfig].
2. Добавьте или измените поле `sourceLocale` внутри секции `i18n`:

```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": "ca"  // Используйте нужный код локали
      }
    }
  }
}
```

## Что дальше

<docs-pill-row>
  <docs-pill href="guide/i18n/format-data-locale" title="Форматирование данных на основе локали"/>
</docs-pill-row>

[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/main/packages/common/locales 'angular/packages/common/locales | angular/angular | GitHub'
[RfcEditorInfoBcp47]: https://www.rfc-editor.org/info/bcp47 'BCP 47 | RFC Editor'
[UnicodeCldrDevelopmentCoreSpecification]: https://cldr.unicode.org/index/cldr-spec 'Core Specification | Unicode CLDR Project'
[UnicodeCldrDevelopmentCoreSpecificationLocaleID]: https://cldr.unicode.org/index/cldr-spec/picking-the-right-language-code 'Unicode Language and Locale Identifiers - Core Specification | Unicode CLDR Project'
