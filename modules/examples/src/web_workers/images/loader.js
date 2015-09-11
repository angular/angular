$SCRIPTS$
importScripts("b64.js");


System.config({
  baseURL: '/',
  defaultJSExtensions: true
});

System.import("examples/src/web_workers/images/background_index")
    .then(
        function(m) {
          console.log("running main");
          try {
            m.main();
          } catch (e) {
            console.error(e);
          }
        },
        function(error) { console.error("error loading background", error); });
