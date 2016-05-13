$SCRIPTS$

System.config({
  baseURL: '/',
  defaultJSExtensions: true
});

System.import("playground/src/web_workers/input/background_index")
    .then(
        function(m) {
          try {
            m.main();
          } catch (e) {
            console.error(e);
          }
        },
        function(error) { console.error("error loading background", error); });
