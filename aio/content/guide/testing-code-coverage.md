{@a code-coverage}

# Descubre cuánto código estás probando

El CLI puede ejecutar tests unitarios y crear informes de la cobertura del codigo por ellos.
Los informes de cobertura de código muestran las partes de tu código que pueden no estar siento probadas corretamente por sus test unitarios.

<div class="alert is-helpful">

  Para la aplicación de muestra que describen las guías de prueba, visita la <live-example name="testing" embedded-style noDownload>aplicación de muestra</live-example>.

  Para las características de las pruebas en las guías de pruebas, visita <live-example name="testing" stackblitz="specs" noDownload>pruebas</live-example>.

</div>


Para generar un informe de cobertura ejecuta el siguiente comando en la raíz del proyecto.

<code-example language="sh" class="code-shell">
  ng test --no-watch --code-coverage
</code-example>

Cuando las pruebas terminan, el comando crea una nueva carpeta `/coverage` en el proyecto. Abre el archivo `index.html` para ver un informe con tu código y los valores de cobertura de código.

Si quieres crear informes de cobertura de código cada vez que ejecutes los test, puedes configurar la siguiente opción en el archivo de configuración del CLI, `angular.json`:

```
  "test": {
    "options": {
      "codeCoverage": true
    }
  }
```

## Imponer la cobertura de código

Los porcentajes de cobertura de código te permiten estimar cuánto porcentaje de tu código es probado.
Si tu equipo decide fijar una cantidad mínima de código para ser probada unitariamente puedes imponer este mínimo con el CLI de Angular.

Por ejemplo, supongamos que quieres que el código tenga un mínimo de 80% de cobertura de código.
Para habilitarlo, abre el archivo de configuración de la plataforma de pruebas de [Karma](https://karma-runner.github.io), `karma.conf.js`, y añada lo siguiente en la clave `coverageIstanbulReporter:`.

```
coverageIstanbulReporter: {
  reports: [ 'html', 'lcovonly' ],
  fixWebpackSourcePaths: true,
  thresholds: {
    statements: 80,
    lines: 80,
    branches: 80,
    functions: 80
  }
}
```

La propiedad de los `thresholds` hace que la herramienta aplique un mínimo del 80% de cobertura de código cuando se ejecuten las pruebas unitarias en el proyecto.

