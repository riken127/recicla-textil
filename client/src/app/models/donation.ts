import {Item} from "./item";

interface AdditionalOffer {
  offerId: string,
  additionalPoints: number
}

export class Donation {
  constructor(
    public _id: string,
    public userId: string,
    public activityType: string,
    public timeStamp: string,
    public details: ItemContainer,
    public ip: string,
    public __v: number,
    public status: string,
    public offers: AdditionalOffer[],
    public totalAdditionalPoints: number
  ) {
  }
}

export class ItemContainer {
  constructor(
    public benefactorId: string,
    public pickpointId: string,
    public items: Item[],
    public totalWeight: number,
    public numberOfItems: number
  ) {
  }
}
