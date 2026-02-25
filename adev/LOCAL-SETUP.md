# Angular.dev saytını lokada işə salmaq və tərcümə

Bu fayl `adev` (angular.dev) saytını lokada necə qaldıracağınızı və harada tərcümə edəcəyinizi izah edir.

## Tələblər

- **Node.js** (v18+ tövsiyə olunur)
- **pnpm** 10.23.0 (layihə pnpm istifadə edir)

Əgər pnpm yoxdursa:

```bash
# Node ilə gələn corepack ilə
corepack enable
corepack prepare pnpm@10.23.0 --activate

# və ya npm ilə
npm install -g pnpm@10.23.0
```

## Lokal dev serveri işə salmaq

**Layihənin kök qovluğundan** (`angular`, `adev`-in bir üst qovluğu) bu əmrləri icra edin:

```bash
# 1. Bağımlılıqları quraşdırın (ilk dəfə uzun çəkə bilər)
pnpm install

# 2. Angular.dev dev serverini işə salın (ilk build vaxt aparır)
pnpm adev
# və ya log saxlayaraq (terminal bağlansa belə .tmp/adev.log oxunur):
# ./adev-run-with-log.sh
```

**Vacib:** İlk build təxminən **15–30 dəqiqə** çəkə bilər (18,000+ Bazel addım). Bu müddətdə terminalı bağlamayın. Build bitəndə server işləməyə davam edər; hazır olanda brauzerdə açın.

Server **http://localhost:4201** (və ya çıxışda göstərilən port) ünvanında açılacaq.

**Terminal öz-özünə bağlanırsa:** Cursor daxili terminalı uzun prosesdə bəzən bağlaya bilər. **Həll:** `pnpm adev` və ya `./adev-run-with-log.sh` əmrini **xarici terminalda** (GNOME Terminal, Konsole və s.) işə salın və pəncərəni açıq saxlayın. Log üçün `./adev-run-with-log.sh` istifadə etsəniz, çıxış həm ekranda, həm də `.tmp/adev.log`-da qalır.

### Problem olsa

**Build xətası və `bazel: missing input file`:**

```bash
pnpm bazel clean
# və ya
pnpm bazel clean --expunge
```

**"Server terminated abruptly (Socket closed)" və ya "permission denied" (/tmp/bazel_script_path...):**

- **Cursor/integrated terminal:** Arxa planda və ya Cursor terminalında proses uzun çəkəndə kəsilib "Socket closed" ola bilər. **Həll:** `pnpm adev`-i **xarici terminalda** (məs. GNOME Terminal, Konsole) işə salın və tam bitənə qədər açıq saxlayın.
- **Permission denied:** Əgər `/tmp`-də skript icra olunmursa, layihə qovluğunda öz TMPDIR-inizi istifadə edin:

```bash
cd /home/tapo/Desktop/projects/angular
mkdir -p .tmp
export TMPDIR="$(pwd)/.tmp"
# nvm (lazımdırsa)
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
pnpm adev
```

**.tmp** qovluğunu `.gitignore`-a əlavə etməyi unutmayın.

**Terminal öz-özünə bağlanır, xəta çıxmır:** Proses (Bazel/JVM) çox yaddaş istifadə edəndə sistem onu dayandıra bilər (OOM). Çıxışı itirməmək və səbəbi görmək üçün log ilə işə salın:

```bash
cd /home/tapo/Desktop/projects/angular
./adev-run-with-log.sh
```

Bütün çıxış **`.tmp/adev.log`** faylına yazılacaq; terminal bağlansa belə sonra `less .tmp/adev.log` və ya faylı açıb son sətirlərə baxın. Yaddaş çatışmazlığı olarsa logda "Killed" və ya "OutOfMemoryError" kimi sözlər görünə bilər. O zaman kompüteri yenidən başladıb başqa proqramları bağlayıb yenidən cəhd edin və ya Bazel üçün yaddaş limitini artırın (məs. `export BAZEL_JAVAC_OPTS="-J-Xmx4g"`).

## Tərcümə üçün məzmun haradadır?

Tərcümə edəcəyiniz mətnlər əsasən **Markdown** (.md) fayllarındadır:

| Qovluq                                             | Məzmun                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| `adev/src/content/guide/`                          | Bələdçilər (components, forms, routing, lifecycle və s.) |
| `adev/src/content/tutorials/`                      | Təlimatlar (first-app, signals, deferrable-views və s.)  |
| `adev/src/content/reference/`                      | Arayış sənədləri, CLI, migrasiyalar                      |
| `adev/src/content/tools/`                          | Alətlər (CLI, libraries)                                 |
| `adev/src/content/examples/`                       | Nümunə layihələri (konfiq və bəzi README)                |
| `adev/src/content/introduction/`                   | Giriş səhifələri                                         |
| `adev/src/content/ecosystem/`                      | Ekosistem (service-workers, rxjs-interop)                |
| `adev/src/content/aria/`                           | ARIA aksesebillik                                        |
| `adev/src/content/events/`, `adev/src/content/ai/` | Digər səhifələr                                          |

### Tərcümə təklifi

1. Bir qovluğu seçin (məs. `guide`) və oradakı `.md` fayllarını tərcümə edin.
2. Faylların adlarını və qovluq strukturunu eyni saxlayın ki, saytın routing-i pozulmasın.
3. Dəyişiklikdən sonra `pnpm adev` işlədikdə səhifələr avtomatik yenilənə bilər (ibazel watch rejimində).

API reference səhifələri Angular paketlərinin TypeScript kodundan avtomatik generasiya olunur; onları birbaşa bu qovluqlardan tərcümə etmək əvəzinə, ya build pipeline-ı uyğunlaşdırmaq, ya da ayrıca dil (i18n) mexanizmi əlavə etmək lazımdır.

---

**Kompüter donur / çox yavaşdır:** Az RAM və ya zəif prosessor olanda Bazel bütün resursları götürə bilər. Layihədə **`.bazelrc.user`** faylı var — paralel işlər azaldılıb (`--jobs=2`) və Bazel JVM yaddaşı məhdudlaşdırılıb (`-Xmx2g`). Yenə də donursa: `.bazelrc.user`-da `--jobs=1` və `-Xmx1536m` yazıb başqa proqramları bağlayıb yenidən cəhd edin.

---

**Qısa:** Kökdə `pnpm install`, sonra `pnpm adev` → http://localhost:4201. Tərcümə üçün `adev/src/content/` altındakı `.md` fayllarını redaktə edin.
