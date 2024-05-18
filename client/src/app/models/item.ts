export class Item {
  constructor(public id: number,
              public brand: string,
              public weight: Weight,
              public size: string,
              public type: string,
              public photo: string) { }
}

export class Weight {
  constructor(public value: string,
              public unit: string) { }
}
