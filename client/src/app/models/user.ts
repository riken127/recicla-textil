import {Address} from "./address";

export class User {
  constructor(public _id: string,
              public lastName: string,
              public firstName: string,
              public username: string,
              public email: string,
              public password: string,
              public image: string,
              public createdAt: Date,
              public updatedAt: Date,
              public roles: string[],
              public address: Address,
              public phone: string,
              public leafs: number,
              public language: string,
              public title: string[],
              public notify: boolean,
              public active: boolean) {
  }
}
