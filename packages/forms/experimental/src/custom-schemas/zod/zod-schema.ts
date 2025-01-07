import {z} from 'zod';

const addressSchema = z.object({
  address1: z.string().nonempty('Address 1 is required'),
  address2: z.string().optional(),
  zip: z
    .number({
      required_error: 'Zip code is required',
      invalid_type_error: 'Zip must be a number',
    })
    .min(10000, {message: 'Zip must be at least 5 characters long'}),
});

const passwordFieldSchema = z
  .string()
  .min(8, {message: 'Password must be at least 8 characters long'})
  .max(20, {message: 'Password must be at most 20 characters long'})
  // Equivalent to noKevinValidator
  .refine((val) => val !== 'kevin', {
    message: "Password cannot be 'kevin'",
  });

const passwordsSchema = z
  .object({
    password: passwordFieldSchema,
    confirmationPassword: passwordFieldSchema,
  })
  .refine((data) => data.password === data.confirmationPassword, {
    message: 'Passwords do not match',
    path: ['confirmationPassword'],
    params: {code: 'match'},
  });

const billingAddressSchema = z.object({
  isSameAsBilling: z.boolean(),
  address: z.discriminatedUnion('isSameAsBilling', [
    z.object({
      isSameAsBilling: z.literal(false),
      address1: z.string().nonempty('Address 1 is required'),
      address2: z.string().optional(),
      zip: z.number().optional(),
    }),
    // When isSameAsBilling is false, use the full address validation
    z.object({
      isSameAsBilling: z.literal(true),
      address: addressSchema,
    }),
  ]),
});

export const languagesSchema = z
  .array(z.string())
  .min(1, {message: 'Please select at least one language'})
  .refine((langs) => langs.every((lang) => ['en', 'es', 'fr', 'de'].includes(lang)), {
    message: 'Invalid language selection',
  });

export const userSchema = z.object({
  username: z.string({}).nonempty('Username is required'),
  passwords: passwordsSchema,
  shippingAddress: addressSchema,
  billingAddress: billingAddressSchema,
  languages: languagesSchema,
});
