# Contribuye a Angular

¡Nos encantaría que contribuyeras a Angular y que ayudaras a hacerlo aún mejor de lo que es hoy!
Como colaborador, estos son los lineamientos que nos gustaría que siguieras:

 - [Código de conducta](#coc)
 - [¿Preguntas o problemas?](#question)
 - [_Issues_ y _bugs_](#issue)
 - [Solicitud de funcionalidades](#feature)
 - [Lineamientos para la creación de _issues_ y _PR_](#submit)
 - [Reglas del código](#rules)
 - [Convención para el mensaje de los _commits_](#commit)
 - [Firma del Acuerdo de Licencia de Colaborador (CLA)](#cla)


## <a name="coc"></a> Código de conducta

Ayúdanos a mantener Angular abierto e inclusivo.
Por favor lee y sigue nuestro [Código de conducta][coc].


## <a name="question"></a> ¿Tienes alguna pregunta o problema?

No abras *issues* para preguntas de soporte general ya que queremos mantener los *issues* de GitHub para reporte de *bugs* y solicitud de funcionalidades.
En su lugar, recomendamos utilizar [Stack Overflow](https://stackoverflow.com/questions/tagged/angular) para hacer preguntas relacionadas con soporte. Al crear una nueva pregunta en Stack Overflow, asegúrate de agregar el etiqueta (tag) de `angular`.

Stack Overflow es mucho mejor para hacer preguntas ya que:

- Hay miles de personas dispuestas a ayudar en preguntas y respuestas de Stack Overflow
que  permanecen disponibles para el público, por lo que tu pregunta o respuesta podría ayudar a otra persona.
- El sistema de votación de Stack Overflow asegura que las mejores respuestas sobresalgan y sean visibles.

Para ahorrar tu tiempo y el nuestro, cerraremos sistemáticamente todos los *issues* que sean solicitudes de soporte general y redirigiremos a las personas a Stack Overflow.

Si deseas chatear sobre alguna pregunta en tiempo real, puedes hacerlo a través de nuestro [canal de Gitter][gitter].


## <a name="issue"></a> ¿Encontraste un Bug?

Si encontraste un error en el código fuente, puedes ayudarnos [creando un *issue*](#submit-issue) en nuestro [repositorio de GitHub][github].
O incluso mejor, puedes [crear un *Pull Request*](#submit-pr) con la solución.


## <a name="feature"></a> ¿Falta alguna funcionalidad?
Puedes solicitar una nueva funcionalidad [creando un *issue*](#submit-issue) en nuestro repositorio de GitHub.
Si deseas implementar una nueva funcionalidad, por favor considera el tamaño del cambio para determinar los pasos correctos para continuar:

* Para un **cambio significativo**, primero abre un *issue* y describe tu propuesta para que pueda ser discutida.
  Este proceso nos permite coordinar mejor nuestros esfuerzos, evitar trabajo duplicado y ayudarte a diseñar el cambio para que sea aceptado con éxito en el proyecto.

  **Nota**: Agregar un nuevo tema a la documentación o reescribir significativamente un tema, también cuenta como *cambio significativo*.

* **Cambios pequeños** pueden ser elaborados y directamente [creados como un _pull request_](#submit-pr).


## <a name="submit"></a> Lineamientos para la creación de _issues_ y _pull requests_


### <a name="submit-issue"></a> Creación de _issues_

Antes de crear un *issue*, por favor busca en el el *issue tracker*, quizá un *issue* para tu problema ya existe y la discusión puede informarte sobre soluciones alternativas disponibles.

Queremos solucionar todos los problemas lo antes posible, pero antes de corregir un bug necesitamos reproducirlo y confirmarlo.
Para reproducir errores, requerimos que proporciones una reproducción mínima.
Tener un escenario reproducible mínimo nos brinda una gran cantidad de información importante sin tener que ir y venir con preguntas adicionales.

Una reproducción mínima nos permite confirmar rápidamente un bug (o señalar un problema de código), así también confirmar que estamos solucionando el problema correcto.

Requerimos una reproducción mínima para ahorrar tiempo a los encargados del mantenimiento y en última instancia, poder corregir más bugs.
A menudo los desarrolladores encuentran problemas de código mientras preparan una reproducción mínima.
Entendemos que a veces puede ser difícil extraer porciones esenciales de código de un código más grande, pero realmente necesitamos aislar el problema antes de poder solucionarlo.

Desafortunadamente no podemos investigar/corregir errores sin una reproducción mínima, por lo que si no tenemos tu retroalimentación del bug, vamos a cerrar el *issue* ya que no tiene suficiente información para reproducirse.

Puedes presentar nuevos *issues* seleccionando nuestra [plantilla de _issues_](https://github.com/angular/angular/issues/new/choose) y complentando la plantilla.


### <a name="submit-pr"></a> Creación de un Pull Requests (PR)

Antes de crear tu Pull Request (PR) considera los siguientes lineamientos:

1. Busca en [GitHub](https://github.com/angular/angular/pulls) PRs que estén abiertos o cerrados y que estén relacionados con el que vas a crear.
  No deseas duplicar los esfuerzos existentes.

2. Asegúrate de que el PR describa el problema que estás solucionando o que documente el diseño de la funcionalidad que deseas agregar.
   Discutir el diseño por adelantado ayuda a garantizar que estemos listos para aceptar tu trabajo.

3. Por favor firma nuestro [Acuerdo de Licencia de Colaborador (CLA)](#cla) antes de crear PRs.
   No podemos aceptar el código sin el Acuerdo de Licencia de Colaborador (CLA) firmado.
   Asegúrate de crear todas las contribuciones de Git con la dirección de correo electrónico asociada con tu firma del Acuerdo de Licencia de Colaborador (CLA).

4. Haz *fork* del repositorio angular/angular.

5. Haz tus cambios en una nueva rama de Git:

     ```shell
     git checkout -b my-fix-branch master
     ```

6. Crea tu correción, **incluyendo casos de prueba apropiados**.

7. Sigue nuestras [Reglas de código](#rules).

8. Ejecuta todo el conjunto de pruebas de Angular, tal como está descrito en la [documentación del desarrollador][dev-doc], y asegúrate de que todas las pruebas pasen.

9. Crea un commit de tus cambios utilizando un mensaje de commit descriptivo que siga nuestra [convención para el mensaje de los commits](#commit).
   Es necesario cumplir con estas convenciones porque las notas de las versiones se generan automáticamente a partir de estos mensajes.

     ```shell
     git commit -a
     ```
    Nota: la opción de la línea de comandos de Git `-a` automaticamente hará "add" y "rm" a los archivos editados.

10. Haz push de tu rama a GitHub:

    ```shell
    git push origin my-fix-branch
    ```

11. En GitHub, crea un pull request a `angular:master`.

   Si solicitamos cambios a través de revisiones de código, sigue las siguientes indicaciones:

   * Haz los cambios requeridos.
   * Ejecuta nuevamente el conjunto de pruebas de Angular para asegurar que todas las pruebas aún están pasando.
   * Haz rebase de tu rama a la rama master y haz push con la opción `-f` a tu repositorio de Github (esto actualizará tu Pull Request):

      ```shell
      git rebase master -i
      git push -f
      ```

¡Es todo! ¡Muchas gracias por tu contribución!


#### Después del merge de tu pull request

Después de que se hizo merge de tu pull request, puedes eliminar de forma segura tu rama y hacer pull de los cambios del repositorio principal (upstream):

* Elimina la rama remota en GitHub a través de la interfaz de usuario web de GitHub o en tu línea de comandos de la siguiente manera:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Muévete a la rama master:

    ```shell
    git checkout master -f
    ```

* Elimina tu rama local:

    ```shell
    git branch -D my-fix-branch
    ```

* Actualiza tu rama master con la última versión del fork (upstream):

    ```shell
    git pull --ff upstream master
    ```


## <a name="rules"></a> Reglas del código
Para garantizar la coherencia en todo el código fuente, ten en cuenta estas reglas mientras trabajas:

* Todas las funcionalidades o solución de bugs **deben ser probadas** por una o más pruebas (pruebas unitarias).
* Todos los métodos públicos del API **deben ser documentados**.
* Seguimos la [guía de estilo JavaScript de Google][js-style-guide], pero cada línea no debe exceder **100 caracteres**.

   Un formateador automatizado está disponible, revisar [DEVELOPER.md](docs/DEVELOPER.md#clang-format).


## <a name="commit"></a> Formato para el mensaje de los commits

*Esta especificación está inspirada y reemplaza el [Formato de mensaje de commits de AngularJS][commit-message-format].*

Tenemos reglas muy precisas sobre cómo deben formatearse nuestros mensajes de los commits de Git.
Este formato permite tener **un historial de commits más facil de leer**.

Cada mensaje de un commit consta del **header**, el **body**, y el **footer**.


```
<header>
<LINEA VACIA>
<body>
<LINEA VACIA>
<footer>
```

El `header` es obligatorio y debe ajustarse al formato del [mensaje del header del commit](#commit-header).

El `body` es obligatorio para todos los commits excepto los que tenga scope "docs".
Cuando el body es requerido debe tener al menos 20 caracteres.

El `footer` es opcional.

Cualquier línea del mensaje del commit no puede tener más de 100 caracteres.


#### <a href="commit-header"></a>Mensaje del header del commit

```
<tipo>(<alcance>): <resumen>
  │       │             │
  │       │             └─⫸ Resumen corto escrito en modo imperativo, tiempo presente. Sin mayúsculas. Sin punto final.
  │       │
  │       └─⫸ Alcance del commit: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|platform-webworker|
  │                          platform-webworker-dynamic|router|service-worker|upgrade|zone.js|
  │                          packaging|changelog|dev-infra|docs-infra|migrations|ngcc|ve
  │
  └─⫸ Tipo de commit: build|ci|docs|feat|fix|perf|refactor|style|test
```

El `<tipo>` y `<resumen>` son obligatorios, el `(<alcance>)` es opcional.


##### Tipo

El tipo debe ser uno de los siguientes:

* **build**: cambios que afectan el sistema de compilación o dependencias externas (ejemplos de scopes: gulp, broccoli, npm)
* **ci**: cambios en nuestros archivos y scripts de configuración de CI (ejemplos de scopes: Circle, BrowserStack, SauceLabs)
* **docs**: cambios en la documentación
* **feat**: una nueva funcionalidad
* **fix**: una solución de un bug
* **perf**: un cambio de código que mejora el rendimiento.
* **refactor**: un cambio de código que no corrige ningún error ni agrega ninguna funcionalidad
* **style**: cambios que no afectan el significado del código (espacios en blanco, formato, falta de punto y coma, etc.)
* **test**: se agregan pruebas faltantes o se corrigen pruebas existentes


##### Alcance
El alcance debe ser el nombre del paquete npm afectado (tal como lo percibe la persona que lee el registro de cambios generado a partir de los mensajes de commit).

La siguiente es la lista de alcances permitidos:

* `animations`
* `bazel`
* `benchpress`
* `common`
* `compiler`
* `compiler-cli`
* `core`
* `elements`
* `forms`
* `http`
* `language-service`
* `localize`
* `platform-browser`
* `platform-browser-dynamic`
* `platform-server`
* `platform-webworker`
* `platform-webworker-dynamic`
* `router`
* `service-worker`
* `upgrade`
* `zone.js`

Actualmente hay algunas excepciones a la regla "usar el nombre de paquete":

* `packaging`: usado para cambios que cambian el diseño de los paquetes de npm en todos nuestros paquetes. Ejemplos: cambios de la ruta públic, package.json cambios hechos a todos los paquetes, cambios a archivos o formatos d.ts, cambios a bundles, etc.

* `changelog`: utilizado para actualizar las notas de la versión en CHANGELOG.md

* `dev-infra`: utilizado para cambios relacionados con dev-infra dentro de los directorios /scripts, /tools y /dev-infra

* `docs-infra`: utilizado para cambios relacionados con la documentación (angular.io) dentro del directorio /aio del repositorio

* `migrations`: utilizado para los cambios en las migraciones `ng update`.

* `ngcc`: usado para los cambios del [Compilador de compatibilidad de Angular](./packages/compiler-cli/ngcc/README.md)

* `ve`: utilizado para cambios específicos de ViewEngine (legacy compiler/renderer).

* alcance vacío: útil para cambios de `style`, `test` y `refactor` que se realizan en todos los paquetes (ejemplo: `style: add missing semicolons`) y para cambios de la documentación que no están relacionados a un paquete en específico(ejemplo: `docs: corrige error gramatical en el tutorial`).


##### Resumen

Usa el campo resumen para proporcionar una descripción breve del cambio:

* usa el modo imperativo, tiempo presente: "cambia" no "cambió" o "cambios"
* no debe de contener ninguna letra mayúscula
* no debe de conter punto (.) al final


#### Mensaje del cuerpo del commit

Tal como en el resumen, usa el modo imperativo, tiempo presente: "cambia" no "cambió" o "cambios".

Explica la razón del cambio en el el mensaje del cuerpo del commit. Este mensaje de confirmación debe explicar _por qué_ está realizando el cambio.
Puedes incluir una comparación del comportamiento anterior con el nuevo comportamiento para ilustrar el impacto del cambio.


#### Mensaje del footer del commit

El footer puede contener información sobre cambios significativos y también es el lugar para hacer referencia a issues de GitHub, tickets de Jira y otros PRs que están relacionados con el commit.

```
CAMBIO SIGNIFICATIVO: <resumen del cambio significativo>
<LINEA VACIA>
<descripción del cambio significativo + instrucciones para la migración>
<LINEA VACIA>
<LINEA VACIA>
Soluciona #<issue número>
```

La sección de cambios significativos debería comenzar con la frase "CAMBIO SIGNIFICATIVO: " seguido de un resumen del cambio significativo, una línea en blanco y una descripción detallada del cambio significativo que también incluya instrucciones de migración.


### Revirtiendo commits

Si el commit revierte un commit previo, el commit debería comenzar con `revert: `, seguido por el header del commit revertido.

El contenido del mensaje del commit debería contener:

- Información sobre el SHA del commit que se revierte en el siguiente formato: `Esto revierte el commit <SHA>`,
- Una descripción clara de la razón para revertir el mensaje del _commit_.


## <a name="cla"></a> Firma del Acuerdo de Licencia de Colaborador (CLA)

Por favor firma nuestro Acuerdo de Licencia de Colaborador (CLA) antes de crear _pull requests_. Para que cualquier cambio de código sea aceptado, el Acuerdo de Licencia de Colaborador (CLA) debe ser firmado. ¡Es un proceso rápido, lo prometemos!

* Para las personas, tenemos un [formulario simple][individual-cla].
* Para corporaciones, necesitaremos que
  [impriman, firmen, escaneen y envíen por email, fax o correo el formulario][corporate-cla].

Si tiene más de una cuenta de GitHub o varias direcciones de correo electrónico asociadas con una sola cuenta de GitHub, debes firmar el CLA utilizando la dirección de correo electrónico principal de la cuenta de GitHub utilizada para crear los commits de Git y la creación de PRs.

Los siguientes documentos pueden ayudarte a resolver problemas con cuentas de GitHub y múltiples direcciones de correo electrónico:

  * https://help.github.com/articles/setting-your-commit-email-address-in-git/
  * https://stackoverflow.com/questions/37245303/what-does-usera-committed-with-userb-13-days-ago-on-github-mean
  * https://help.github.com/articles/about-commit-email-addresses/
  * https://help.github.com/articles/blocking-command-line-pushes-that-expose-your-personal-email-address/




[angular-group]: https://groups.google.com/forum/#!forum/angular
[coc]: https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
[corporate-cla]: http://code.google.com/legal/corporate-cla-v1.0.html
[dev-doc]: https://github.com/angular/angular/blob/master/docs/DEVELOPER.md
[github]: https://github.com/angular/angular
[gitter]: https://gitter.im/angular/angular
[individual-cla]: http://code.google.com/legal/individual-cla-v1.0.html
[js-style-guide]: https://google.github.io/styleguide/jsguide.html
[jsfiddle]: http://jsfiddle.net
[plunker]: http://plnkr.co/edit
[runnable]: http://runnable.com
[stackoverflow]: http://stackoverflow.com/questions/tagged/angular
