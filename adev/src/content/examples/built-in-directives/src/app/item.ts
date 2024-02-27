export class Item {
  static nextId = 0;

  static items: Item[] = [
    new Item(0, 'Teapot', 'stout'),
    new Item(1, 'Lamp', 'bright'),
    new Item(2, 'Phone', 'slim'),
    new Item(3, 'Television', 'vintage'),
    new Item(4, 'Fishbowl'),
  ];

  constructor(
    public id: number,
    public name?: string,
    public feature?: string,
    public url?: string,
    public rate = 100,
  ) {
    this.id = id ? id : Item.nextId++;
  }

  clone(): Item {
    return Object.assign(new Item(this.id), this);
  }
}
