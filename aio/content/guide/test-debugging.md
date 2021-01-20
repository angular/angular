# Debugging tests

Si tus tests no están funcionando como esperas, puedes inspeccionarlos y hacer debug en el navegador.



<div class="alert is-helpful">
Para la aplicación de ejemplo que las guías de testing describe, consulta <live-example name="testing" embedded-style noDownload>app de ejemplo</live-example>.

Para las funcionalidades de los tests en las guías de testing, consulta  <live-example name="testing" stackblitz="specs" noDownload>tests</live-example>.

</div>

Puedes hacer debug de especificaciones en el navegador de la misma forma que haces debug a una aplicación.

1. Revela la ventana del navegador Karma. Consulta [configuración del testing](guide/testing#set-up-testing) si necesitas ayuda con este paso.
1. Haz click en el botón **DEBUG**; abrirá una nueva pestaña en el navegador y volverá a ejecutar los tests.
1. Abre las "Herramientas de desarrollador" del navegador (`Ctrl-Shift-I` en Windows; `Command-Option-I` in macOS).
1. Selecciona la sección "fuentes".
1. Abre el archivo test `1st.spec.ts` (Control/Command-P, luego escribe el nombre del archivo).
1. Coloca un breakpoint en el test. 
1. Actualiza tu navegador, se detendrá en el breakpoint establecido.

<div class="lightbox">
  <img src='generated/images/guide/testing/karma-1st-spec-debug.png' alt="Karma debugging">
</div>

<hr>

