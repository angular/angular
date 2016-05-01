export function normalizeValidator(validator) {
    if (validator.validate !== undefined) {
        return (c) => validator.validate(c);
    }
    else {
        return validator;
    }
}
export function normalizeAsyncValidator(validator) {
    if (validator.validate !== undefined) {
        return (c) => Promise.resolve(validator.validate(c));
    }
    else {
        return validator;
    }
}
