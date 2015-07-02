class ClassDecorator {
  final dynamic value;

  const ClassDecorator(this.value);
}

class ParamDecorator {
  final dynamic value;

  const ParamDecorator(this.value);
}

ClassDecorator classDecorator(value) {
  return new ClassDecorator(value);
}

ParamDecorator paramDecorator(value) {
  return new ParamDecorator(value);
}
