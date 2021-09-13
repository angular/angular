# Manage marked text with custom IDs

{@a custom-id}

The Angular extractor generates a file with a translation unit entry for each `i18n` attribute in a template.
As described in [How meanings control text extraction and merging][AioGuideI18nCommonPrepareTransactionUnitIds], Angular assigns each translation unit a unique ID.
The following example displays translation units with unique IDs.

<code-example path="i18n/doc-files/messages.fr.xlf.html" header="messages.fr.xlf.html" region="generated-id"></code-example>

When you change the translatable text, the extractor generates a new ID for that translation unit.
In most cases a text change would also require a change to the translation.
Therefore, using a new ID keeps the text change in sync with translations.

However, some translation systems require a specific form or syntax for the ID.
To address this requirement, mark text with custom IDs.
While most developers don't need to use custom IDs, some may want to use IDs that have a unique syntax to convey additional metadata (such as the library, component, or area of the application in which the text appears).

Specify a custom ID in the `i18n` attribute by using the `@@` prefix.
The following example defines the `introductionHeader` custom ID.

<code-example path='i18n/doc-files/app.component.html' region='i18n-attribute-solo-id' header='app/app.component.html'></code-example>

When you specify a custom ID, the extractor generates a translation unit with the custom ID.

<code-example path="i18n/doc-files/messages.fr.xlf.html" header="messages.fr.xlf.html" region="custom-id"></code-example>

If you change the text, the extractor does *not* change the ID.
As a result, you don't have to take the extra step of updating the translation.
The drawback of using custom IDs is that if you change the text, your translation may be out-of-sync with the newly changed source text.

#### Use a custom ID with a description

Use a custom ID in combination with a description and a meaning to further help the translator.
The following example includes a description, followed by the custom ID.

<code-example path='i18n/doc-files/app.component.html' region='i18n-attribute-id' header='app/app.component.html'></code-example>

The following example adds a meaning.

<code-example path='i18n/doc-files/app.component.html' region='i18n-attribute-meaning-and-id' header='app/app.component.html'></code-example>

#### Define unique custom IDs

Be sure to define custom IDs that are unique.
If you use the same ID for two different text elements, the extraction tool extracts only the first one, and Angular uses its translation in place of both original text elements.

For example, in the following code snippet the same `myId` custom ID is defined for two different text elements.

```html
<h3 i18n="@@myId">Hello</h3>
<!-- ... -->
<p i18n="@@myId">Good bye</p>
```

The following displays the translation in French.

```xml
<trans-unit id="myId" datatype="html">
    <source>Hello</source>
    <target state="new">Bonjour</target>
</trans-unit>
```

Both elements now use the same translation (`Bonjour`), because both were defined with the same custom ID.

```html
<h3>Bonjour</h3>
<!-- ... -->
<p>Bonjour</p>
```

<!-- links -->

[AioGuideI18nCommonPrepareTransactionUnitIds]: guide/i18n-common-prepare#transaction-unit-ids "How meanings control text extraction and merging - Common Internationalization task #4: Prepare templates for translations | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2021-08-23
