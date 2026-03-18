# Обращение к локалям по идентификатору

Angular использует _идентификатор локали Unicode_ \(Unicode locale ID\) для поиска правильных данных локали при интернационализации текстовых строк.

<docs-callout title="Unicode locale ID">

- Идентификатор локали соответствует [основной спецификации Unicode Common Locale Data Repository (CLDR)][UnicodeCldrDevelopmentCoreSpecification].
  Дополнительные сведения об идентификаторах локалей см. в [Unicode Language and Locale Identifiers][UnicodeCldrDevelopmentCoreSpecificationLocaleIDs].

- CLDR и Angular используют [теги BCP 47][RfcEditorInfoBcp47] в качестве основы для идентификатора локали

</docs-callout>

Идентификатор локали задаёт язык, страну и необязательный код для дополнительных вариантов или подразделений.
Идентификатор локали состоит из идентификатора языка, дефиса \(`-`\) и расширения локали.

```html
{language_id}-{locale_extension}
```

HELPFUL: Чтобы точно перевести ваш Angular-проект, необходимо определить, на какие языки и локали вы ориентируетесь при интернационализации.

Многие страны используют один и тот же язык, но различаются в его применении.
Различия включают грамматику, пунктуацию, форматы валюты, десятичных чисел, дат и т. д.

Для примеров в этом руководстве используйте следующие языки и локали.

| Язык    | Локаль                   | Unicode locale ID |
| :------ | :----------------------- | :---------------- |
| English | Canada                   | `en-CA`           |
| English | United States of America | `en-US`           |
| French  | Canada                   | `fr-CA`           |
| French  | France                   | `fr-FR`           |

[Репозиторий Angular][GithubAngularAngularTreeMasterPackagesCommonLocales] включает распространённые локали.

<docs-callout>
Список языковых кодов см. в [ISO 639-2](https://www.loc.gov/standards/iso639-2).
</docs-callout>

## Установка идентификатора исходной локали {#set-the-source-locale-id}

Используйте Angular CLI для установки исходного языка, на котором вы пишете шаблон компонента и код.

По умолчанию Angular использует `en-US` в качестве исходной локали вашего проекта.

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
  <docs-pill href="guide/i18n/format-data-locale" title="Форматирование данных на основе локали"/>
</docs-pill-row>

[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/main/packages/common/locales 'angular/packages/common/locales | angular/angular | GitHub'
[RfcEditorInfoBcp47]: https://www.rfc-editor.org/info/bcp47 'BCP 47 | RFC Editor'
[UnicodeCldrDevelopmentCoreSpecification]: https://cldr.unicode.org/index/cldr-spec 'Core Specification | Unicode CLDR Project'
[UnicodeCldrDevelopmentCoreSpecificationLocaleID]: https://cldr.unicode.org/index/cldr-spec/picking-the-right-language-code 'Unicode Language and Locale Identifiers - Core Specification | Unicode CLDR Project'
