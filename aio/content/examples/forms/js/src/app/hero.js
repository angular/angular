// #docregion
(function(app) {
  app.Hero = Hero;
  
  function Hero(id, name, power, alterEgo) {
    this.id = id;
    this.name = name;
    this.power = power;
    this.alterEgo = alterEgo;
  }
})(window.app || (window.app = {}));
