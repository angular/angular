export const SIMPLE_RECORD = [
  {
    children: [
      {
        children: [],
        directives: [
          {
            isComponent: false,
            isElement: false,
            name: 'TooltipDirective',
            lifecycle: {},
            changeDetection: 5,
          },
          {
            changeDetection: 5,
            isElement: false,
            isComponent: true,
            lifecycle: {},
            name: 'TodoComponent',
          },
        ],
      },
    ],
    directives: [
      {
        isComponent: false,
        isElement: false,
        name: 'NgForOf',
        lifecycle: { ngDoCheck: 7 },
        changeDetection: 0,
      },
    ],
  },
];
export const SIMPLE_FORMATTED_RECORD = [
  {
    value: 7,
    label: '[NgForOf]',
    children: [
      {
        value: 10,
        label: 'TodoComponent[TooltipDirective]',
        children: [],
        instances: 1,
        original: {
          children: [],
          directives: [
            {
              isComponent: false,
              isElement: false,
              name: 'TooltipDirective',
              lifecycle: {},
              changeDetection: 5,
            },
            {
              changeDetection: 5,
              isElement: false,
              isComponent: true,
              lifecycle: {},
              name: 'TodoComponent',
            },
          ],
        },
      },
    ],
    instances: 1,
    original: SIMPLE_RECORD[0],
  },
];
export const NESTED_RECORD = [
  {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [],
                                    directives: [
                                      {
                                        isComponent: false,
                                        isElement: false,
                                        name: 'TooltipDirective',
                                        lifecycle: {},
                                        changeDetection: 0,
                                      },
                                      {
                                        changeDetection: 0,
                                        isElement: false,
                                        isComponent: true,
                                        lifecycle: {},
                                        name: 'TodoComponent',
                                      },
                                    ],
                                  },
                                  {
                                    children: [],
                                    directives: [
                                      {
                                        isComponent: false,
                                        isElement: false,
                                        name: 'TooltipDirective',
                                        lifecycle: {},
                                        changeDetection: 0,
                                      },
                                      {
                                        changeDetection: 0,
                                        isElement: false,
                                        isComponent: true,
                                        lifecycle: {},
                                        name: 'TodoComponent',
                                      },
                                    ],
                                  },
                                  {
                                    children: [],
                                    directives: [
                                      {
                                        isComponent: false,
                                        isElement: false,
                                        name: 'TooltipDirective',
                                        lifecycle: {},
                                        changeDetection: 0,
                                      },
                                      {
                                        changeDetection: 0,
                                        isElement: false,
                                        isComponent: true,
                                        lifecycle: {},
                                        name: 'TodoComponent',
                                      },
                                    ],
                                  },
                                ],
                                directives: [
                                  {
                                    isComponent: false,
                                    isElement: false,
                                    name: 'NgForOf',
                                    lifecycle: { ngDoCheck: 7 },
                                    changeDetection: 0,
                                  },
                                ],
                              },
                            ],
                            directives: [
                              {
                                changeDetection: 9,
                                isElement: false,
                                isComponent: true,
                                lifecycle: {},
                                name: 'TodosComponent',
                              },
                            ],
                          },
                        ],
                        directives: [
                          {
                            isComponent: false,
                            isElement: false,
                            name: 'RouterOutlet',
                            lifecycle: {},
                            changeDetection: 0,
                          },
                        ],
                      },
                    ],
                    directives: [
                      {
                        changeDetection: 1,
                        isElement: false,
                        isComponent: true,
                        lifecycle: {},
                        name: 'AppComponent',
                      },
                    ],
                  },
                ],
                directives: [
                  { isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 },
                ],
              },
              {
                children: [],
                directives: [
                  {
                    changeDetection: 1,
                    isElement: false,
                    isComponent: true,
                    lifecycle: {},
                    name: 'HeavyComponent',
                  },
                ],
              },
            ],
            directives: [
              {
                changeDetection: 1,
                isElement: false,
                isComponent: true,
                lifecycle: {},
                name: 'DemoAppComponent',
              },
            ],
          },
        ],
        directives: [{ isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 }],
      },
    ],
    directives: [
      {
        changeDetection: 1,
        isElement: false,
        isComponent: true,
        lifecycle: {},
        name: 'AppComponent',
      },
    ],
  },
  {
    children: [],
    directives: [
      {
        changeDetection: 1,
        isElement: true,
        isComponent: true,
        lifecycle: {},
        name: 'ZippyComponent',
      },
    ],
  },
];
export const NESTED_FORMATTED_RECORD = [
  {
    value: 1,
    label: 'AppComponent',
    children: [
      {
        value: 0,
        label: '[RouterOutlet]',
        children: [
          {
            value: 1,
            label: 'DemoAppComponent',
            children: [
              {
                value: 0,
                label: '[RouterOutlet]',
                children: [
                  {
                    value: 1,
                    label: 'AppComponent',
                    children: [
                      {
                        value: 0,
                        label: '[RouterOutlet]',
                        children: [
                          {
                            value: 9,
                            label: 'TodosComponent',
                            children: [
                              {
                                value: 7,
                                label: '[NgForOf]',
                                children: [
                                  {
                                    value: 0,
                                    label: 'TodoComponent[TooltipDirective]',
                                    children: [],
                                    instances: 1,
                                    original: {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    value: 0,
                                    label: 'TodoComponent[TooltipDirective]',
                                    children: [],
                                    instances: 1,
                                    original: {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    value: 0,
                                    label: 'TodoComponent[TooltipDirective]',
                                    children: [],
                                    instances: 1,
                                    original: {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  },
                                ],
                                instances: 1,
                                original: {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              },
                            ],
                            instances: 1,
                            original: {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          },
                        ],
                        instances: 1,
                        original: {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          ],
                          directives: [
                            {
                              isComponent: false,
                              isElement: false,
                              name: 'RouterOutlet',
                              lifecycle: {},
                              changeDetection: 0,
                            },
                          ],
                        },
                      },
                    ],
                    instances: 1,
                    original: {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          ],
                          directives: [
                            {
                              isComponent: false,
                              isElement: false,
                              name: 'RouterOutlet',
                              lifecycle: {},
                              changeDetection: 0,
                            },
                          ],
                        },
                      ],
                      directives: [
                        {
                          changeDetection: 1,
                          isElement: false,
                          isComponent: true,
                          lifecycle: {},
                          name: 'AppComponent',
                        },
                      ],
                    },
                  },
                ],
                instances: 1,
                original: {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          ],
                          directives: [
                            {
                              isComponent: false,
                              isElement: false,
                              name: 'RouterOutlet',
                              lifecycle: {},
                              changeDetection: 0,
                            },
                          ],
                        },
                      ],
                      directives: [
                        {
                          changeDetection: 1,
                          isElement: false,
                          isComponent: true,
                          lifecycle: {},
                          name: 'AppComponent',
                        },
                      ],
                    },
                  ],
                  directives: [
                    { isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 },
                  ],
                },
              },
              {
                value: 1,
                label: 'HeavyComponent',
                children: [],
                instances: 1,
                original: {
                  children: [],
                  directives: [
                    {
                      changeDetection: 1,
                      isElement: false,
                      isComponent: true,
                      lifecycle: {},
                      name: 'HeavyComponent',
                    },
                  ],
                },
              },
            ],
            instances: 1,
            original: {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          ],
                          directives: [
                            {
                              isComponent: false,
                              isElement: false,
                              name: 'RouterOutlet',
                              lifecycle: {},
                              changeDetection: 0,
                            },
                          ],
                        },
                      ],
                      directives: [
                        {
                          changeDetection: 1,
                          isElement: false,
                          isComponent: true,
                          lifecycle: {},
                          name: 'AppComponent',
                        },
                      ],
                    },
                  ],
                  directives: [
                    { isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 },
                  ],
                },
                {
                  children: [],
                  directives: [
                    {
                      changeDetection: 1,
                      isElement: false,
                      isComponent: true,
                      lifecycle: {},
                      name: 'HeavyComponent',
                    },
                  ],
                },
              ],
              directives: [
                {
                  changeDetection: 1,
                  isElement: false,
                  isComponent: true,
                  lifecycle: {},
                  name: 'DemoAppComponent',
                },
              ],
            },
          },
        ],
        instances: 1,
        original: {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                    {
                                      children: [],
                                      directives: [
                                        {
                                          isComponent: false,
                                          isElement: false,
                                          name: 'TooltipDirective',
                                          lifecycle: {},
                                          changeDetection: 0,
                                        },
                                        {
                                          changeDetection: 0,
                                          isElement: false,
                                          isComponent: true,
                                          lifecycle: {},
                                          name: 'TodoComponent',
                                        },
                                      ],
                                    },
                                  ],
                                  directives: [
                                    {
                                      isComponent: false,
                                      isElement: false,
                                      name: 'NgForOf',
                                      lifecycle: { ngDoCheck: 7 },
                                      changeDetection: 0,
                                    },
                                  ],
                                },
                              ],
                              directives: [
                                {
                                  changeDetection: 9,
                                  isElement: false,
                                  isComponent: true,
                                  lifecycle: {},
                                  name: 'TodosComponent',
                                },
                              ],
                            },
                          ],
                          directives: [
                            {
                              isComponent: false,
                              isElement: false,
                              name: 'RouterOutlet',
                              lifecycle: {},
                              changeDetection: 0,
                            },
                          ],
                        },
                      ],
                      directives: [
                        {
                          changeDetection: 1,
                          isElement: false,
                          isComponent: true,
                          lifecycle: {},
                          name: 'AppComponent',
                        },
                      ],
                    },
                  ],
                  directives: [
                    { isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 },
                  ],
                },
                {
                  children: [],
                  directives: [
                    {
                      changeDetection: 1,
                      isElement: false,
                      isComponent: true,
                      lifecycle: {},
                      name: 'HeavyComponent',
                    },
                  ],
                },
              ],
              directives: [
                {
                  changeDetection: 1,
                  isElement: false,
                  isComponent: true,
                  lifecycle: {},
                  name: 'DemoAppComponent',
                },
              ],
            },
          ],
          directives: [
            { isComponent: false, isElement: false, name: 'RouterOutlet', lifecycle: {}, changeDetection: 0 },
          ],
        },
      },
    ],
    instances: 1,
    original: NESTED_RECORD[0],
  },
  {
    value: 1,
    label: 'ZippyComponent',
    children: [],
    instances: 1,
    original: {
      children: [],
      directives: [
        {
          changeDetection: 1,
          isElement: true,
          isComponent: true,
          lifecycle: {},
          name: 'ZippyComponent',
        },
      ],
    },
  },
];
