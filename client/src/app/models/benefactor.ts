import {Pickpoint} from "./pickpoint";
import {ConversionRatio} from "./conversion-ratio";
import {Address} from "./address";

export class Benefactor {
  constructor(public _id: string,
    public name: string,
    public address: Address,
    public username: string,
    public password: string,
    public email: string,
    public description: string,
    public phone: string,
    public logo: string,
    public banner: string,
    public createdAt: Date,
    public lastUpdateAt: Date,
    public pickpoints: Pickpoint[],
    public conversionRatio: ConversionRatio,
    public status: string) {}
}
