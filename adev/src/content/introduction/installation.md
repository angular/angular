<docs-decorative-header title="Quraşdırma" imgSrc="adev/src/assets/images/what_is_angular.svg"> 
<!-- markdownlint-disable-line -->
</docs-decorative-header>

Angular ilə onlayn başlanğıc mühitləri vasitəsilə və ya terminalınız üzərindən lokal olaraq sürətlə başlayın.

## Onlayn Oynayın

Əgər layihə qurulumu etmədən sadəcə brauzerinizdə Angular ilə təcrübə aparmaq istəyirsinizsə, onlayn sandbox mühitimizdən istifadə edə bilərsiniz:

<docs-card-container>
  <docs-card title="" href="/playground" link="Open on Playground">
  Angular tətbiqi ilə işləməyin ən sürətli yolu. Heç bir quraşdırma tələb olunmur.
  </docs-card>
</docs-card-container>

## Yeni layihəni lokal olaraq qurun

Əgər yeni layihəyə başlayırsınızsa, çox güman ki, Git kimi alətlərdən istifadə etmək üçün lokal layihə yaratmaq istəyəcəksiniz.

### Tələb olunan şərtlər

- **Node.js** - [v20.19.0 və ya daha yeni versiya](/reference/versions)
- **Mətn redaktoru** - Tövsiyə edirik [Visual Studio Code](https://code.visualstudio.com/)
- **Terminal** - Angular CLI əmrlərini işlətmək üçün tələb olunur
- **İnkişaf aləti (Development Tool)** - İnkişaf iş axınınızı yaxşılaşdırmaq üçün tövsiyə edirik: [Angular Language Service](/tools/language-service)

### Təlimatlar

Aşağıdakı bələdçi sizə lokal Angular layihəsini qurmağı göstərəcək.

#### Angular CLI-ı quraşdırın

Terminalı açın (Əgər [Visual Studio Code](https://code.visualstudio.com/) istifadə edirsinizsə, siz [integrated terminal](https://code.visualstudio.com/docs/editor/integrated-terminal)-ı aça bilərsiniz) və aşağıdakı əmri işlədin:

<docs-code-multifile>
  <docs-code
    header="npm"
    language="shell"
    >
    npm install -g @angular/cli
    </docs-code>
  <docs-code
    header="pnpm"
    language="shell"
    >
    pnpm install -g @angular/cli
    </docs-code>
  <docs-code
    header="yarn"
    language="shell"
    >
    yarn global add @angular/cli
    </docs-code>
  <docs-code
    header="bun"
    language="shell"
    >
    bun install -g @angular/cli
    </docs-code>

</docs-code-multifile>

Əgər bu əmri Windows və ya Unix sistemində işlədərkən problemlə qarşılaşırsınızsa, daha ətraflı məlumat üçün [CLI docs](/tools/cli/setup-local#install-the-angular-cli) baxın.

#### Yeni layihə yaradın

Terminalınızda `ng new` CLI əmri ilə istədiyiniz layihə adını daxil edin. Aşağıdakı nümunələrdə `my-first-angular-app` layihə adından istifadə edəcəyik.

```shell
ng new <project-name>
```

Layihəniz üçün bir sıra konfiqurasiya seçimləri təqdim olunacaq. İstədiyiniz seçimləri hərəkət və enter düymələri ilə seçin.

Əgər xüsusi üstünlükləriniz yoxdursa, sadəcə enter düyməsini basaraq standart seçimləri qəbul edib quraşdırmaya davam edə bilərsiniz.

Konfiqurasiya seçimlərini seçdikdən və CLI quraşdırmanı tamamladıqdan sonra aşağıdakı mesajı görməlisiniz:

```text
✔ Packages installed successfully.
    Successfully initialized git.
```

Bu mərhələdə layihənizi lokal olaraq işlətməyə hazırsınız!

#### Yeni layihənizi lokal olaraq işlətmək

Terminalınızda yeni Angular layihənizə keçin.

```shell
cd my-first-angular-app
```

Bu mərhələdə bütün asılılıqlarınız quraşdırılmış olmalıdır (bunu layihənizdə `node_modules` qovluğunun olub-olmadığını yoxlayaraq təsdiqləyə bilərsiniz), buna görə layihənizi aşağıdakı əmri işlədərək başlada bilərsiniz:

```shell
npm start
```

Əgər hər şey uğurla başa çatıbsa, terminalınızda oxşar təsdiq mesajını görməlisiniz:

```text
Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

İndi isə tətbiqinizi görmək üçün `Local` yoluna (məsələn, `http://localhost:4200`) daxil ola bilərsiniz. Kodlaşdırma uğurlu olsun! 🎉

### İnkişaf üçün AI-dan istifadə

Sevdiyiniz AI ilə işləyən IDE-də inkişaf etməyə başlamaq üçün [Angular prompt qaydaları və ən yaxşı təcrübələrlə](/ai/develop-with-ai) tanış olun.

## Növbəti addımlar

Angular layihənizi yaratdığınız üçün indi Angular haqqında daha çox məlumatı [Əsaslar bələdçimizdə (Essentials guide)](/essentials) öyrənə bilərsiniz və ya dərin bələdçilərimizdə mövzu seçə bilərsiniz!
