library angular2.src.router.route_definition;

abstract class RouteDefinition {
  final String path;
  final String name;
  final bool useAsDefault;
  final String regex;
  final Function serializer;
  const RouteDefinition({this.path, this.name, this.useAsDefault : false, this.regex, this.serializer});
}
