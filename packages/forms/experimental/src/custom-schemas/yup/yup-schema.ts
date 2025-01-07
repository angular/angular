import * as yup from 'yup';

const addressSchema = yup.object({
  address1: yup.string().required('Address 1 is required'),
  address2: yup.string(),
  zip: yup
    .number()
    .required('Zip code is required')
    .typeError('Zip must be a number')
    .min(10000, 'Zip must be at least 5 characters long'),
});

const passwordFieldSchema = yup
  .string()
  .required()
  .min(8, 'Password must be at least 8 characters long')
  .max(20, 'Password must be at most 20 characters long')
  .test('no-kevin', "Password cannot be 'kevin'", function (value: string | undefined) {
    return value !== 'kevin';
  });

const passwordsSchema = yup
  .object({
    password: passwordFieldSchema,
    confirmationPassword: passwordFieldSchema,
  })
  .test('passwords-match', 'Passwords do not match', function (value) {
    if (!value?.password || !value?.confirmationPassword) return false;
    return value.password === value.confirmationPassword;
  });

const billingAddressSchema = yup
  .object({
    isSameAsBilling: yup.boolean(),
    address: addressSchema,
  })
  .required();

export const languagesSchema = yup
  .array()
  .of(yup.string())
  .min(1, 'Please select at least one language')
  .test(
    'valid-languages',
    'Invalid language selection',
    function (value: (string | undefined)[] | undefined) {
      if (!value) return false;
      return value.every((lang) => lang && ['en', 'es', 'fr', 'de'].includes(lang));
    },
  );

export const userSchema = yup.object({
  username: yup.string().required('Username is required'),
  passwords: passwordsSchema,
  shippingAddress: addressSchema,
  billingAddress: billingAddressSchema,
  languages: languagesSchema,
});
