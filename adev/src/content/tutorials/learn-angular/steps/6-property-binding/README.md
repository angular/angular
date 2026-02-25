# Angular-da Property Binding

Angular-da property binding HTML elementlərinin, Angular komponentlərinin və daha çoxunun property-lərinə dəyər təyin etməyə imkan verir.

Property binding vasitəsilə property və attribute-lərə dinamik olaraq dəyər təyin edə bilərsiniz. Məsələn, düymə xüsusiyyətlərini aktiv/deaktiv etmək, şəkil yolunu proqram vasitəsilə təyin etmək və komponentlər arasında dəyərləri paylaşmaq mümkündür.

QEYD: Daha ətraflı məlumat üçün [setting dynamic properties and attributes in the essentials guide](/essentials/templates#dinamik-property-və-attributların-təyin-edilməsi) bölməsinə baxın.

Bu fəaliyyətdə siz template-lərdə property binding-dən necə istifadə etməyi öyrənəcəksiniz.

<hr />

Elementin attribute-una binding etmək üçün attribute adını kvadrat mötərizələrə alın. Nümunə:

```angular-html
<img alt="photo" [src]="imageURL" />
```

Bu nümunədə `src` attribute-unun dəyəri class-dakı `imageURL` property-sinə bağlanır. `imageURL` hansı dəyərə malikdirsə, həmin dəyər `img` tag-ının `src` attribute-u kimi təyin olunacaq.

<docs-workflow>

<docs-step title="`isEditable` adlı property əlavə edin" header="app.ts" language="ts">
`app.ts` faylında `App` class-ına `isEditable` adlı property əlavə edin və ilkin dəyərini `true` olaraq təyin edin.

```ts {highlight:[2]}
export class App {
  isEditable = true;
}
```

</docs-step>

<docs-step title="`contentEditable`-ə binding edin" header="app.ts" language="ts">
Sonra `div` elementinin `contentEditable` attribute-unu `isEditable` property-sinə <code aria-label="square brackets">[]</code> sintaksisindən istifadə edərək bağlayın.

```angular-ts {highlight:[3]}
@Component({
  ...
  template: `<div [contentEditable]="isEditable"></div>`,
})
```

</docs-step>

</docs-workflow>

Artıq `div` redaktə edilə biləndir. Əla 👍

Property binding Angular-ın güclü xüsusiyyətlərindən biridir. Daha ətraflı öyrənmək üçün [Angular documentation](guide/templates/binding#css-class-and-style-property-bindings) bölməsinə baxa bilərsiniz.
