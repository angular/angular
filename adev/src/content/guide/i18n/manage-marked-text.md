# Управление помеченным текстом с помощью пользовательских ID

Экстрактор Angular генерирует файл с записью единицы перевода для каждого из следующих случаев:

- Каждый атрибут `i18n` в шаблоне компонента
- Каждая строка сообщения, помеченная тегом [`$localize`][ApiLocalizeInitLocalize] в коде компонента

Как описано в
разделе [Как смысловые значения управляют извлечением текста и слияниями][GuideI18nCommonPrepareHowMeaningsControlTextExtractionAndMerges],
Angular присваивает каждой единице перевода уникальный ID.

В следующем примере показаны единицы перевода с уникальными ID.

<docs-code header="messages.fr.xlf.html" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" region="generated-id"/>

При изменении переводимого текста экстрактор генерирует новый ID для этой единицы перевода.
В большинстве случаев изменения в исходном тексте также требуют изменения перевода.
Поэтому использование нового ID позволяет синхронизировать изменения текста с переводами.

Однако некоторые системы перевода требуют определенной формы или синтаксиса для ID.
Чтобы выполнить это требование, используйте пользовательский ID для маркировки текста.
Большинству разработчиков не нужно использовать пользовательский ID.
Если вы хотите использовать уникальный синтаксис для передачи дополнительных метаданных, используйте пользовательский
ID.
Дополнительные метаданные могут включать библиотеку, компонент или область приложения, в которой появляется текст.

Чтобы указать пользовательский ID в атрибуте `i18n` или строке сообщения с тегом [`$localize`][ApiLocalizeInitLocalize],
используйте префикс `@@`.
В следующем примере определяется пользовательский ID `introductionHeader` в элементе заголовка.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-solo-id"/>

В следующем примере определяется пользовательский ID `introductionHeader` для переменной.

```ts
variableText1 = $localize`:@@introductionHeader:Hello i18n!`;
```

Когда вы указываете пользовательский ID, экстрактор генерирует единицу перевода с этим ID.

<docs-code header="messages.fr.xlf.html" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" region="custom-id"/>

Если вы измените текст, экстрактор не изменит ID.
В результате вам не нужно предпринимать дополнительных шагов для обновления перевода.
Недостатком использования пользовательских ID является то, что при изменении текста ваш перевод может
рассинхронизироваться с новым исходным текстом.

## Использование пользовательского ID с описанием

Используйте пользовательский ID в сочетании с описанием и смысловым значением (meaning), чтобы дополнительно помочь
переводчику.

Следующий пример включает описание, за которым следует пользовательский ID.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-id"/>

В следующем примере определяются пользовательский ID `introductionHeader` и описание для переменной.

```ts
variableText2 = $localize`:An introduction header for this sample@@introductionHeader:Hello i18n!`;
```

В следующем примере добавляется смысловое значение.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-meaning-and-id"/>

В следующем примере определяется пользовательский ID `introductionHeader` для переменной.

```ts
variableText3 = $localize`:site header|An introduction header for this sample@@introductionHeader:Hello i18n!`;
```

### Определение уникальных пользовательских ID

Убедитесь, что определяемые вами пользовательские ID уникальны.
Если вы используете один и тот же ID для двух разных текстовых элементов, инструмент извлечения извлечет только первый
из них, и Angular будет использовать перевод вместо обоих исходных текстовых элементов.

Например, в следующем фрагменте кода один и тот же пользовательский ID `myId` определен для двух разных текстовых
элементов.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-duplicate-custom-id"/>

Ниже показан перевод на французский язык.

<docs-code header="src/locale/messages.fr.xlf" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" region="i18n-duplicate-custom-id"/>

Оба элемента теперь используют один и тот же перевод \(`Bonjour`\), так как оба были определены с одним и тем же
пользовательским ID.

<docs-code path="adev/src/content/examples/i18n/doc-files/rendered-output.html"/>

[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API | Angular'
[GuideI18nCommonPrepareHowMeaningsControlTextExtractionAndMerges]: guide/i18n/prepare#h1-example 'How meanings control text extraction and merges - Prepare components for translations | Angular'
