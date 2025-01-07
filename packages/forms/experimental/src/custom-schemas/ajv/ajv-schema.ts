import {JSONSchemaType} from 'ajv';

interface Address {
  address1: string;
  address2?: string;
  zip: number;
}

const addressSchema: JSONSchemaType<Address> = {
  type: 'object',
  properties: {
    address1: {type: 'string'},
    address2: {type: 'string', nullable: true},
    zip: {
      type: 'integer',
      minimum: 10000,
      maximum: 99999,
    },
  },
  required: ['address1', 'zip'],
  additionalProperties: false,
};

interface Passwords {
  password: string;
  confirmationPassword: string;
}

const passwordsSchema: JSONSchemaType<Passwords> = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 20,
      not: {const: 'kevin'},
    },
    confirmationPassword: {
      type: 'string',
      minLength: 8,
      maxLength: 20,
    },
  },
  required: ['password', 'confirmationPassword'],
  additionalProperties: false,
  if: {
    type: 'object',
    properties: {
      password: {type: 'string'},
      confirmationPassword: {type: 'string'},
    },
    required: ['password', 'confirmationPassword'],
  },
  then: {
    type: 'object',
    properties: {
      password: {type: 'string'},
      confirmationPassword: {
        type: 'string',
        const: {$data: '1/password'},
      },
    },
  },
  errorMessage: {
    'then.properties.confirmationPassword.const': 'Passwords do not match',
  },
};

interface BillingAddress {
  isSameAsBilling: boolean;
  address: Address;
}

const billingAddressSchema: JSONSchemaType<BillingAddress> = {
  type: 'object',
  properties: {
    isSameAsBilling: {type: 'boolean'},
    address: addressSchema,
  },
  required: ['isSameAsBilling', 'address'],
  additionalProperties: false,
};

export const languagesSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: {
    type: 'string',
    enum: ['en', 'es', 'fr', 'de'],
  },
  minItems: 1,
};

interface User {
  username: string;
  passwords: Passwords;
  shippingAddress: Address;
  billingAddress: BillingAddress;
  languages: string[];
}

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  required: ['username', 'passwords', 'shippingAddress', 'billingAddress', 'languages'],
  properties: {
    username: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    passwords: passwordsSchema,
    shippingAddress: addressSchema,
    billingAddress: billingAddressSchema,
    languages: languagesSchema,
  },
  additionalProperties: false,
};
