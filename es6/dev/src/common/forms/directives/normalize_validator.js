export function normalizeValidator(validator) {
    if (validator.validate !== undefined) {
        return (c) => validator.validate(c);
    }
    else {
        return validator;
    }
}
//# sourceMappingURL=normalize_validator.js.map