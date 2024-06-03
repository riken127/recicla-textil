export class Offer {
  constructor(
    public _id: string,
    public startDate: Date,
    public endDate: Date,
    public benefactor: string,
    public title: string,
    public description: string,
    public image: string,
    public points: number,
    public active: boolean
  ) {
  }
}
