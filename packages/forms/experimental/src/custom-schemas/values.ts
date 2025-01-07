export const defaultFormValues = {
  username: 'pirojok',
  passwords: {
    password: '12345678',
    confirmationPassword: '12345678',
  },
  shippingAddress: {
    address1: '111',
    address2: '11',
    zip: 12310,
  },
  billingAddress: {
    isSameAsBilling: false,
    address: {
      address1: '11',
      address2: '11',
      zip: 0,
    },
  },
  languages: ['en'],
};
