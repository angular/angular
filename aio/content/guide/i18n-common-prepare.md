# Prepare templates for translations

{@a template-translations}

To translate the templates of your application, prepare the text for a translator or translation service by marking text, attributes, and other elements with the Angular `i18n` attribute.
Complete the following actions to mark text, attributes, and other elements with the Angular `i18n` attribute.

1.  [Mark text for translations][AioGuideI18nCommonPrepareMarkTextForTranslations].
1.  [Add helpful descriptions and meanings][AioGuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings] to help the translator with additional information or context.
1.  [Translate text not for display][AioGuideI18nCommonPrepareTranslateTextNotForDisplay].
1.  [Mark element attributes for translations][AioGuideI18nCommonPrepareMarkElementAttributesForTranslations], such as the `title` attribute of an image.
1.  [Mark plurals and alternates for translation][AioGuideI18nCommonPrepareMarkPluralsAndAlternatesForTranslation] in order to comply with the pluralization rules and grammatical constructions of different languages.

### Mark text for translations

{@a i18n-attribute}

Mark the static text messages in your component templates for translation using the `i18n` attribute.
Place it on every element tag with fixed text to be translated.

For example, the following `<h1>` tag displays a simple English language greeting, "Hello i18n!".

<code-example path="i18n/doc-files/app.component.html" region="greeting" header="src/app/app.component.html"></code-example>

To mark the greeting for translation, add the `i18n` attribute to the `<h1>` tag.

<code-example path="i18n/doc-files/app.component.html" region="i18n-attribute" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

`i18n` is a custom attribute, recognized by Angular tools and compilers.
After translation, the compiler removes it.
It is not an Angular directive.

</div>

### Add helpful descriptions and meanings

{@a help-translator}

To translate a text message accurately, the translator may need additional information or context.
Add a *description* of the text message as the value of the `i18n` attribute.
The following example displays the value of the `i18n` attribute.

<code-example path="i18n/doc-files/app.component.html" region="i18n-attribute-desc" header="src/app/app.component.html"></code-example>

The translator may also need to know the meaning or intent of the text message within this particular application context, in order to translate it the same way as other text with the same meaning.
Start the `i18n` attribute value with the *meaning* and separate it from the *description* with the `|` character: `<meaning>|<description>`.

For example, you may want to indicate that the `<h1>` tag is a site header that needs to be translated the same way, whether it's used as a header or referenced in another section of text.
The following example shows how to indicate that the `<h1>` tag needs to be translated as a header or referenced elsewhere.

<code-example path="i18n/doc-files/app.component.html" region="i18n-attribute-meaning" header="src/app/app.component.html"></code-example>

The result is any text marked with `site header`, as the *meaning* is translated exactly the same way.

<!-- section break -->

{@a transaction-unit-ids}

<div class="callout is-helpful">
<header>How meanings control text extraction and merging</header>

The Angular extraction tool generates a translation unit entry for each `i18n` attribute in a template.
The Angular extraction tool assigns each translation unit a unique ID based on the *meaning* and *description*.
For more information about the Angular extraction tool, see [Work with translation files][AioGuideI18nCommonTranslationFiles] in this guide.

The same text elements with different *meanings* are extracted with different IDs.
For example, if the word "right" uses the following two definitions in two different locations, the word is translated differently and merged back into the application as different translation entries.

*   `correct` as in you are "right"
*   `direction` as in turn "right"

If the same text elements meet the following conditions, the text elements are extracted only once and use the same ID.

*   Same meaning or definition
*   Different descriptions

That one translation entry is merged back into the application wherever the same text elements appear.

</div>

### Translate text not for display

{@a no-element}

If you translate non-displayed text using the `<span>` tag, you create a new DOM element.
To avoid creating a new DOM element, wrap the text in an `<ng-container>` element.
The following example shows the `<ng-container>` element transformed into a non-displayed HTML comment.

<code-example path="i18n/src/app/app.component.html" region="i18n-ng-container"></code-example>

### Mark element attributes for translations

{@a translate-attributes}

HTML attributes such as `title` include text that should be translated along with the rest of the displayed text in the template.
The following example displays an image with a `title` attribute.

<code-example path="i18n/doc-files/app.component.html" region="i18n-title" header="src/app/app.component.html"></code-example>

To mark an attribute for translation, add `i18n-`*attribute* in which *attribute* is the attribute to translate.
The following example displays how to mark the `title` attribute on the `img` tag by adding `i18n-title`.

<code-example path="i18n/src/app/app.component.html" region="i18n-title-translate" header="src/app/app.component.html"></code-example>

Use `i18n-`*attribute* with any attribute of any element.
Also, to assign a meaning, description, and custom ID, use the `i18n-`*attribute*`="<meaning>|<description>@@<id>"` syntax.

### Mark plurals and alternates for translation

{@a plurals-alternates}

Different languages have different pluralization rules and grammatical constructions that increase the difficulty of translation.
To simplify translation, use International Components for Unicode (ICU) clauses with regular expressions, such as `plural` to mark the uses of plural numbers, and `select` to mark alternate text choices.

<div class="alert is-helpful">

The ICU clauses adhere to the [ICU Message Format][GithubUnicodeOrgIcuUserguideFormatParseMessages] specified in the [CLDR pluralization rules][UnicodeCldrIndexCldrSpecPluralRules].

</div>

#### Mark plurals

{@a plural-ICU}

Use the `plural` clause to mark expressions that may not be meaningful if translated word-for-word.

For example, if you want to display "updated x minutes ago" in English, you may want to display "just now", "one minute ago", or "*x* minutes ago" (with *x* as the actual number).
Other languages might express this cardinality differently.
The following example displays how to use a `plural` clause to express each of the three situations.

<code-example path="i18n/src/app/app.component.html" region="i18n-plural" header="src/app/app.component.html"></code-example>

Review the following details in the above example.

*   The first parameter, `minutes`, is bound to the component property (`minutes`), which determines the number of minutes.
*   The second parameter identifies this as a `plural` translation type.
*   The third parameter defines a pattern of pluralization categories and the matching values:
    *   For zero minutes, use `=0 {just now}`.
    *   For one minute, use `=1 {one minute}`.
    *   For any unmatched cardinality, use `other {{{minutes}} minutes ago}`.
        Use HTML markup and [interpolations][AioGuideGlossaryInterpolation], such as `{{{minutes}}` with the `plural` clause in expressions.
    *   After the pluralization category, put the default text (English) within braces (`{}`).

Pluralization categories include (depending on the language):

*   `=0` (or any other number)
*   `zero`
*   `one`
*   `two`
*   `few`
*   `many`
*   `other`

<div class="callout is-important">
<header>Locales may not support some pluralization categories</header>

Many locales don't support some of the pluralization categories.
For example, the default locale (`en-US`) and other locales (such as `es`) have very simple `plural()` functions that don't support the `few` category.
The following code example displays the [en-US][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL15L18] `plural()` function.

```typescript
function plural(n: number): number {
    let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
    if (i === 1 && v === 0) return 1;
    return 5;
}
```

The function will only ever return 1 (`one`) or 5 (`other`).
The `few` category will never match.
If none of the pluralization categories match, Angular will try to match `other`.
Use `other` as the standard fallback for a missing category.

For more information about pluralization categories, see [Choosing plural category names][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames] in the CLDR - Unicode Common Locale Data Repository.

</div>

### Mark alternates and nested expressions

{@a select-icu}
{@a nesting-icus}

If you need to display alternate text depending on the value of a variable, you need to translate all of the alternates.

The `select` clause, similar to the `plural` clause, marks choices for alternate text based on your defined string values.
For example, the following clause in the component template binds to the `gender` property of the component, which outputs one of the following string values: `"male"`, `"female"`, or `"other"`.
The clause maps the values to the appropriate translations.

<code-example path="i18n/src/app/app.component.html" region="i18n-select" header="src/app/app.component.html"></code-example>

Also, nest different clauses together, such as the `plural` and `select` clauses.
The following example displays nested clauses.

<code-example path="i18n/src/app/app.component.html" region="i18n-nested" header="src/app/app.component.html"></code-example>

<!-- links -->

[AioGuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings]: guide/i18n-common-prepare#add-helpful-descriptions-and-meanings "Add helpful descriptions and meanings - Prepare templates for translations | Angular"
[AioGuideI18nCommonPrepareMarkElementAttributesForTranslations]: guide/i18n-common-prepare#mark-element-attributes-for-translations "Mark element attributes for translations - Prepare templates for translations | Angular"
[AioGuideI18nCommonPrepareMarkPluralsAndAlternatesForTranslation]: guide/i18n-common-prepare#mark-plurals-and-alternates-for-translation "Mark plurals and alternates for translation - Prepare templates for translations | Angular"
[AioGuideI18nCommonPrepareMarkTextForTranslations]: guide/i18n-common-prepare#mark-text-for-translations "Prepare templates for translations | Angular"
[AioGuideI18nCommonPrepareTranslateTextNotForDisplay]: guide/i18n-common-prepare#translate-text-not-for-display "Translate text not for display - Prepare templates for translations | Angular"
[AioGuideI18nCommonTranslationFiles]: guide/i18n-common-translation-files "Work with translation files | Angular"

[AioGuideGlossaryInterpolation]: guide/glossary#interpolation "interpolation - Glossary | Angular"

<!-- external links -->

[GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL15L18]: https://github.com/angular/angular/blob/ecffc3557fe1bff9718c01277498e877ca44588d/packages/core/src/i18n/locale_en.ts#L15-L18 "Line 15 to 18 - angular/packages/core/src/i18n/locale_en.ts | angular/angular | GitHub"

[GithubUnicodeOrgIcuUserguideFormatParseMessages]: https://unicode-org.github.io/icu/userguide/format_parse/messages "ICU Message Format - ICU Documentation | Unicode | GitHub"

[UnicodeCldrIndexCldrSpecPluralRules]: http://cldr.unicode.org/index/cldr-spec/plural-rules "Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode"
[UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]: http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Choosing-Plural-Category-Names "Choosing Plural Category Names - Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode"

<!-- end links -->

@reviewed 2021-08-23
