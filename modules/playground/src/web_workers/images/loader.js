importScripts("b64.js");
importScripts("../base_loader.js");

System.import("background_index")
  .then(
    function(m) {
      try {
        m.main();
      } catch (e) {
        console.error(e);
      }
    },
    function(error) { console.error("error loading background", error); });
