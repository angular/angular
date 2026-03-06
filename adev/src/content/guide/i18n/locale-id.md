# Обращение к локалям по идентификатору {#refer-to-locales-by-id}

Angular использует _идентификатор локали_ Unicode (Unicode locale ID) для поиска корректных данных локали при интернационализации текстовых строк.

<docs-callout title="Unicode locale ID">

- Идентификатор локали соответствует [основной спецификации Unicode Common Locale Data Repository (CLDR)][UnicodeCldrDevelopmentCoreSpecification].
  Подробнее об идентификаторах локалей см. в разделе [Идентификаторы языка и локали Unicode][UnicodeCldrDevelopmentCoreSpecificationLocaleIDs].

- CLDR и Angular используют [теги BCP 47][RfcEditorInfoBcp47] в качестве основы для идентификатора локали.

</docs-callout>

Идентификатор локали задаёт язык, страну и необязательный код для дальнейших вариантов или подразделений.
Идентификатор локали состоит из идентификатора языка, дефиса \(`-`\) и расширения локали.

```html
{language_id}-{locale_extension}
```

HELPFUL: Для точного перевода вашего Angular-проекта необходимо заранее определить целевые языки и локали.

Многие страны используют один язык, но различаются в его употреблении.
Различия включают грамматику, пунктуацию, форматы валюты, десятичных чисел, дат и т. д.

Для примеров в этом руководстве используются следующие языки и локали.

| Язык     | Локаль                   | Unicode locale ID |
| :------- | :----------------------- | :---------------- |
| Английский | Канада                 | `en-CA`           |
| Английский | США                    | `en-US`           |
| Французский | Канада                | `fr-CA`           |
| Французский | Франция               | `fr-FR`           |

[Репозиторий Angular][GithubAngularAngularTreeMasterPackagesCommonLocales] включает распространённые локали.

<docs-callout>
Список кодов языков см. в [ISO 639-2](https://www.loc.gov/standards/iso639-2).
</docs-callout>

## Установка идентификатора исходной локали {#set-the-source-locale-id}

Используйте Angular CLI для задания исходного языка, на котором написаны шаблоны компонентов и код.

По умолчанию Angular использует `en-US` в качестве исходной локали проекта.

Чтобы изменить исходную локаль проекта для сборки, выполните следующие действия.

1. Откройте файл конфигурации сборки рабочего пространства [`angular.json`][GuideWorkspaceConfig].
2. Добавьте или измените поле `sourceLocale` в разделе `i18n`:

```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": "ca" // Use your desired locale code
      }
    }
  }
}
```

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/format-data-locale" title="Форматирование данных в зависимости от локали"/>
</docs-pill-row>

[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/main/packages/common/locales 'angular/packages/common/locales | angular/angular | GitHub'
[RfcEditorInfoBcp47]: https://www.rfc-editor.org/info/bcp47 'BCP 47 | RFC Editor'
[UnicodeCldrDevelopmentCoreSpecification]: https://cldr.unicode.org/index/cldr-spec 'Core Specification | Unicode CLDR Project'
[UnicodeCldrDevelopmentCoreSpecificationLocaleIDs]: https://cldr.unicode.org/index/cldr-spec/picking-the-right-language-code 'Unicode Language and Locale Identifiers - Core Specification | Unicode CLDR Project'
