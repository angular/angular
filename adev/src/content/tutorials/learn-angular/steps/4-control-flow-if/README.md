# Komponentlərdə Control Flow - `@if`

İstifadəçi üçün ekranda nə göstəriləcəyinə qərar vermək tətbiq inkişafında geniş yayılmış tapşırıqdır. Çox vaxt bu qərar şərtlərdən istifadə edilərək proqram vasitəsilə verilir.

Template-lərdə şərtli göstərimi ifadə etmək üçün Angular `@if` template sintaksisindən istifadə edir.

QEYD: Daha ətraflı məlumat üçün [control flow in the essentials guide](/essentials/templates#if-və-for-ilə-control-flow) bölməsinə baxın.

Bu fəaliyyətdə siz template-lərdə şərtlərdən necə istifadə etməyi öyrənəcəksiniz.

<hr/>

Template-də elementlərin şərtli göstərilməsini təmin edən sintaksis `@if`-dir.

Aşağıda komponent daxilində `@if` sintaksisinin istifadəsinə nümunə göstərilib:

```angular-ts
@Component({
  ...
  template: `
    @if (isLoggedIn) {
      <p>Welcome back, Friend!</p>
    }
  `,
})
export class App {
  isLoggedIn = true;
}
```

Diqqət edilməli iki məqam:

- `if` ifadəsinin əvvəlində `@` prefiksi var, çünki bu, [Angular template syntax](guide/templates) adlanan xüsusi sintaksis növüdür.
- v16 və daha köhnə versiyalardan istifadə edən tətbiqlər üçün ətraflı məlumatı [Angular documentation for NgIf](guide/directives/structural-directives) bölməsində tapa bilərsiniz.

<docs-workflow>

<docs-step title="`isServerRunning` adlı property yaradın">
`App` class-ına `isServerRunning` adlı `boolean` tipli property əlavə edin və ilkin dəyərini `true` olaraq təyin edin.
</docs-step>

<docs-step title="Template-də `@if` istifadə edin">
Template-i yeniləyərək `isServerRunning` dəyəri `true` olduqda `Yes, the server is running` mesajını göstərin.
</docs-step>

<docs-step title="Template-də `@else` istifadə edin">
Artıq Angular `@else` sintaksisi ilə else halını native şəkildə dəstəkləyir. Template-i yeniləyərək else halında `No, the server is not running` mesajını göstərin.

Nümunə:

```angular-html
template: `
@if (isServerRunning) {
  ...
} @else {
  ...
}
`;
```

Buradakı boş hissələri uyğun markup ilə doldurun.

</docs-step>

</docs-workflow>

Bu tip funksionallıq şərtli control flow adlanır. Növbəti mərhələdə template-də elementləri necə təkrarlamağı öyrənəcəksiniz.
