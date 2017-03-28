// var first_time = true; // DIAGNOSTIC

function translate(html, rulesFile) {
  rulesFile.rulesToApply.forEach(function(rxDatum) {
    var rxRule = rulesFile.rules[rxDatum.pattern];
    // rxFrom is a rexexp
    var rxFrom = rxRule.from;
    if (rxDatum.from) {
      var from = rxDatum.from.replace('/', '\/');
      var rxTemp = rxFrom.toString();
      rxTemp = rxTemp.replace('%tag%', from);
      rxFrom = rxFromString(rxTemp);
    }
    // rxTo is a string
    var rxTo = rxRule.to;
    if (rxDatum.to) {
      var to = rxDatum.to;
      to = Array.isArray(to) ? to : [to];
      to = to.map(function (toItem) {
        return rxTo.replace("%tag%", toItem);
      });
      rxTo = to.join("\n    ");
    }

    /* DIAGNOSTIC
    if (first_time && rxDatum.pattern === 'zone_pkg') {
      first_time = false;

      console.log('zone_pkg');
      console.log('  rxFrom: '+rxFrom);
      console.log('  rxTo: '+rxTo);
      console.log('  replace: ' + html.replace(rxFrom, rxTo ));
    }
    */
    html = html.replace(rxFrom, rxTo);
  });

  return html;
}

function rxFromString(rxString) {
  var rx = /^\/(.*)\/(.*)/;
  var pieces = rx.exec(rxString);
  return RegExp(pieces[1], pieces[2]);
}

module.exports = {translate: translate};
