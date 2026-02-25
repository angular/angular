# Component Class-ın Yenilənməsi

Angular-da komponentin məntiqi və davranışı komponentin TypeScript class-ında təyin olunur.

QEYD: Daha ətraflı məlumat üçün [showing dynamic text in the essentials guide](/essentials/templates#dinamik-mətnin-göstərilməsi) bölməsinə baxın.

Bu fəaliyyətdə siz komponent class-ını necə yeniləməyi və [interpolation](/guide/templates/binding#render-dynamic-text-with-text-interpolation) istifadəsini öyrənəcəksiniz.

<hr />

<docs-workflow>

<docs-step title="`city` adlı property əlavə edin">
`App` class-ına `city` adlı property əlavə edərək komponent class-ını yeniləyin.

```ts
export class App {
  city = 'San Francisco';
}
```

`city` property-si `string` tipindədir, lakin TypeScript-də [type inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) olduğu üçün tipi ayrıca yazmaya bilərsiniz. `city` property-si `App` class-ı daxilində istifadə oluna bilər və komponentin template hissəsində ona istinad etmək mümkündür.

<br>

Class property-sini template-də istifadə etmək üçün `{{ }}` sintaksisindən istifadə etməlisiniz.
</docs-step>

<docs-step title="Komponent template-ini yeniləyin">
`template` property-sini aşağıdakı HTML-ə uyğun olaraq yeniləyin:

```ts
template: `Hello {{ city }}`,
```

Bu interpolation nümunəsidir və Angular template sintaksisinin bir hissəsidir. Bu imkan sizə təkcə dinamik mətni template-də göstərmək deyil, həm də funksiyalar çağırmaq, ifadələr yazmaq və daha çoxunu etməyə şərait yaradır.
</docs-step>

<docs-step title="Interpolation ilə daha çox məşq">
Bunu yoxlayın — `{{ }}` daxilində `1 + 1` yazaraq əlavə bir interpolation əlavə edin:

```ts
template: `Hello {{ city }}, {{ 1 + 1 }}`,
```

Angular `{{ }}` daxilindəki məzmunu qiymətləndirir və nəticəni template-də render edir.
</docs-step>

</docs-workflow>

Bu, Angular template-ləri ilə mümkün olanların yalnız başlanğıcıdır. Daha çox öyrənməyə davam edin.
