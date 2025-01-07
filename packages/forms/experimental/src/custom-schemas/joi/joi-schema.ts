import * as Joi from 'joi';

const addressSchema = Joi.object({
  address1: Joi.string().required().messages({
    'string.empty': 'Address 1 is required',
  }),
  address2: Joi.string().optional().allow(''),
  zip: Joi.number().min(10000).max(99999).required().messages({
    'number.base': 'Zip must be a number',
    'number.min': 'Zip must be at least 5 characters long',
    'any.required': 'Zip code is required',
  }),
});

const passwordFieldSchema = Joi.string()
  .min(8)
  .max(20)
  .custom((value: string, helpers: Joi.CustomHelpers) => {
    if (value === 'kevin') {
      return helpers.error('password.kevin');
    }
    return value;
  })
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be at most 20 characters long',
    'password.kevin': "Password cannot be 'kevin'",
  });

const passwordsSchema = Joi.object({
  password: passwordFieldSchema.required(),
  confirmationPassword: passwordFieldSchema.required(),
})
  .custom((value: {password: string; confirmationPassword: string}, helpers: Joi.CustomHelpers) => {
    if (value.password !== value.confirmationPassword) {
      return helpers.error('passwords.match');
    }
    return value;
  })
  .messages({
    'passwords.match': 'Passwords do not match',
  });

const billingAddressSchema = Joi.object({
  isSameAsBilling: Joi.boolean().required(),
  address: addressSchema.required(),
});

export const languagesSchema = Joi.array()
  .items(Joi.string().valid('en', 'es', 'fr', 'de'))
  .min(1)
  .messages({
    'array.min': 'Please select at least one language',
    'array.base': 'Invalid language selection',
  });

export const userSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
  }),
  passwords: passwordsSchema.required(),
  shippingAddress: addressSchema.required(),
  billingAddress: billingAddressSchema.required(),
  languages: languagesSchema.required(),
});
