<docs-decorative-header title="Siqnallarla formalar" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

VACİB: Siqnal Formaları [eksperimentaldir](/reference/releases#experimental). API gələcək buraxılışlarda dəyişə bilər. Riskləri anlamadan eksperimental API-ləri istehsalat (production) tətbiqlərində istifadə etməkdən çəkinin.

Siqnal Formaları, məlumat modeliniz və istifadəçi interfeysi (UI) arasında avtomatik sinxronizasiyanı təmin etmək üçün Angular siqnallarından istifadə edərək forma vəziyyətini idarə edir.

Bu bələdçi sizə Siqnal Formaları ilə formalar yaratmaq üçün əsas anlayışları izah edir. İşləmə prinsipi belədir:

## İlk formanızı yaratmaq

### 1. `signal()` ilə forma modeli yaradın

Hər bir forma, formanızın məlumat modelini saxlayan bir siqnal yaratmaqla başlayır:

```ts
interface LoginData {
  email: string;
  password: string;
}

const loginModel = signal<LoginData>({
  email: '',
  password: '',
});
```

### 2. Forma modelini `form()` funksiyasına ötürərək `FieldTree` yaradın

Daha sonra, forma modelinizi `form()` funksiyasına ötürərək **sahə ağacı (field tree)** yaradırsınız. Bu, modelinizin strukturunu əks etdirən bir obyektdir və sahələrə nöqtə (dot notation) vasitəsilə daxil olmağa imkan verir:

```ts
const loginForm = form(loginModel);

// Sahələrə birbaşa xüsusiyyət adı ilə müraciət edin
loginForm.email;
loginForm.password;
```

### 3. HTML girişlərini (inputs) `[formField]` direktivi ilə bağlayın

Bundan sonra, `[formField]` direktivindən istifadə edərək HTML girişlərinizi formaya bağlayırsınız. Bu, onlar arasında ikitərəfli bağlama (two-way binding) yaradır:

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

Nəticədə, istifadəçi tərəfindən edilən dəyişikliklər (məsələn, sahəyə yazı yazmaq) avtomatik olaraq formanı yeniləyir.

QEYD: `[formField]` direktivi həmçinin uyğun gəldikdə `required`, `disabled` və `readonly` kimi atributlar üçün sahə vəziyyətini sinxronlaşdırır.

### 4. Sahə dəyərlərini `value()` ilə oxuyun

Sahə vəziyyətinə müraciət etmək üçün sahəni funksiya kimi çağıra bilərsiniz. Bu, sahənin dəyəri, doğrulama (validation) statusu və qarşılıqlı əlaqə vəziyyəti üçün reaktiv siqnalları ehtiva edən `FieldState` obyektini qaytarır:

```ts
loginForm.email(); // value(), valid(), touched() və s. olan FieldState qaytarır.
```

Sahənin cari dəyərini oxumaq üçün `value()` siqnalına müraciət edin:

```html
<!-- İstifadəçi yazdıqca avtomatik yenilənən forma dəyərini göstərin -->
<p>Email: {{ loginForm.email().value() }}</p>
```

```ts
// Cari dəyəri əldə edin
const currentEmail = loginForm.email().value();
```

### 5. Sahə dəyərlərini `set()` ilə yeniləyin

`value.set()` metodundan istifadə edərək sahənin dəyərini proqramlı şəkildə yeniləyə bilərsiniz. Bu, həm sahəni, həm də əsas model siqnalını yeniləyir:

```ts
// Dəyəri proqramlı şəkildə yeniləyin
loginForm.email().value.set('alice@wonderland.com');
```

Nəticədə həm sahə dəyəri, həm də model siqnalı avtomatik yenilənir:

```ts
// Model siqnalı da yenilənir
console.log(loginModel().email); // 'alice@wonderland.com'
```

Budur tam bir nümunə:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.css"/>
</docs-code-multifile>

## Əsas istifadə {#basic-usage}

`[formField]` direktivi bütün standart HTML giriş tipləri ilə işləyir. Ən çox yayılan nümunələr bunlardır:

### Mətn girişləri (Text inputs)

Mətn girişləri müxtəlif `type` atributları və `textarea` elementləri ilə işləyir:

```html
<!-- Mətn və email -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### Rəqəmlər

Rəqəm girişləri sətirlər (strings) və rəqəmlər arasında avtomatik çevrilmə aparır:

```html
<!-- Rəqəm - avtomatik rəqəm tipinə çevrilir -->
<input type="number" [formField]="form.age" />
```

#### Tarix və vaxt

Tarix girişləri dəyərləri `YYYY-MM-DD` sətirləri kimi, vaxt girişləri isə `HH:mm` formatında saxlayır:

```html
<!-- Tarix və vaxt - ISO formatlı sətirlər kimi saxlanılır -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

Tarix sətirlərini `Date` obyektlərinə çevirmək lazımdırsa, sahə dəyərini `Date()` funksiyasına ötürərək bunu edə bilərsiniz:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Çoxsətirli (Multiline) mətn

`textarea` elementləri mətn girişləri ilə eyni şəkildə işləyir:

```html
<!-- Textarea -->
<textarea [formField]="form.message" rows="4"></textarea>
```

### İşarə qutuları (Checkboxes)

İşarə qutuları (checkbooks) boolean dəyərlərinə bağlanır:

```html
<!-- Tək işarə qutusu -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  Şərtlərlə razıyam
</label>
```

#### Çoxsaylı işarə qutuları (Multiple checkboxes)

Birdən çox seçim üçün hər biri üçün ayrı bir boolean `formField` yaradın:

```html
<label>
  <input type="checkbox" [formField]="form.emailNotifications" />
  Email bildirişləri
</label>
<label>
  <input type="checkbox" [formField]="form.smsNotifications" />
  SMS bildirişləri
</label>
```

### Radio düymələri (Radio buttons)

Radio düymələri işarə qutuları kimi işləyir. Radio düymələri eyni `[formField]` dəyərindən istifadə etdiyi müddətcə, Siqnal Formaları avtomatik olaraq onların hamısına eyni `name` atributunu bağlayacaq:

```html
<label>
  <input type="radio" value="free" [formField]="form.plan" />
  Pulsuz
</label>
<label>
  <input type="radio" value="premium" [formField]="form.plan" />
  Premium
</label>
```

İstifadəçi radio düyməsini seçdikdə, `formField` həmin radio düyməsinin `value` atributundakı dəyəri saxlayır. Məsələn, "Premium" seçmək `form.plan().value()` dəyərini `"premium"` olaraq təyin edir.

### Seçim siyahıları (Select dropdowns)

`select` elementləri həm statik, həm də dinamik seçimlərlə işləyir:

```angular-html
<!-- Statik seçimlər -->
<select [formField]="form.country">
  <option value="">Ölkə seçin</option>
  <option value="us">Amerika Birləşmiş Ştatları</option>
  <option value="ca">Kanada</option>
</select>

<!-- @for ilə dinamik seçimlər -->
<select [formField]="form.productId">
  <option value="">Məhsul seçin</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

QEYD: Çoxlu seçim (`<select multiple>`) hazırda `[formField]` direktivi tərəfindən dəstəklənmir.

## Doğrulama və vəziyyət (Validation and state)

Siqnal Formaları forma sahələrinizə tətbiq edə biləcəyiniz daxili doğrulayıcılar (validators) təqdim edir. Doğrulama əlavə etmək üçün `form()` funksiyasına ikinci arqument kimi bir sxem (schema) funksiyası ötürün:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

Sxem funksiyası, doğrulama qaydalarını konfiqurasiya etmək üçün sahələrinizə yol göstərən bir **sxem yolu (schema path)** parametri qəbul edir.

Ümumi doğrulayıcılara aşağıdakılar daxildir:

- **`required()`** - Sahənin dəyərinin olmasını təmin edir
- **`email()`** - Email formatını doğrulayır
- **`min()`** / **`max()`** - Rəqəm diapazonlarını doğrulayır
- **`minLength()`** / **`maxLength()`** - Sətir və ya kolleksiya uzunluğunu doğrulayır
- **`pattern()`** - Regex şablonuna qarşı doğrulayır

Həmçinin, doğrulayıcıya ikinci arqument kimi seçimlər obyekti ötürərək xəta mesajlarını fərdiləşdirə bilərsiniz:

```ts
required(schemaPath.email, {message: 'Email mütləqdir'});
email(schemaPath.email, {message: 'Zəhmət olmasa düzgün email ünvanı daxil edin'});
```

Hər bir forma sahəsi öz doğrulama vəziyyətini siqnallar vasitəsilə təqdim edir. Məsələn, doğrulamanın keçib-keçmədiyini görmək üçün `field().valid()`, istifadəçinin onunla qarşılıqlı əlaqədə olub-olmadığını görmək üçün `field().touched()` və doğrulama xətalarının siyahısını əldə etmək üçün `field().errors()` yoxlaya bilərsiniz.

Budur tam bir nümunə:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

### Sahə Vəziyyəti Siqnalları (Field State Signals)

Hər bir `field()` bu vəziyyət siqnallarını təmin edir:

| Vəziyyət     | Təsvir                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| `valid()`    | Sahə bütün doğrulama qaydalarından keçdikdə `true` qaytarır                      |
| `touched()`  | İstifadəçi sahəyə fokuslanıb sonra çıxdıqda (blur) `true` qaytarır               |
| `dirty()`    | İstifadəçi dəyəri dəyişdikdə `true` qaytarır                                     |
| `disabled()` | Sahə deaktiv edildikdə `true` qaytarır                                           |
| `readonly()` | Sahə yalnız oxunabilən (readonly) olduqda `true` qaytarır                        |
| `pending()`  | Asinxron doğrulama davam etdikdə `true` qaytarır                                 |
| `errors()`   | `kind` və `message` xüsusiyyətlərinə malik doğrulama xətaları massivini qaytarır |

## Növbəti addımlar

Siqnal Formaları və onların necə işlədiyi haqqında daha çox öyrənmək üçün ətraflı bələdçilərə baxın:

- [İcmal](guide/forms/signals/overview) - Siqnal Formalarına giriş və onlardan nə vaxt istifadə etməli
- [Form modelləri](guide/forms/signals/models) - Siqnallarla forma məlumatlarının yaradılması və idarə edilməsi
- [Sahə vəziyyətinin idarə edilməsi](guide/forms/signals/field-state-management) - Doğrulama vəziyyəti, qarşılıqlı əlaqənin izlənilməsi və sahə görünürlüğü ilə işləmək
- [Doğrulama (Validation)](guide/forms/signals/validation) - Daxili doğrulayıcılar, xüsusi doğrulama qaydaları və asinxron doğrulama
