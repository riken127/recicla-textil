import {Link} from './link'

export class Post {
  constructor(
    public _id: string,
    public benefactorId: string,
    public title: string,
    public content: string,
    public image: string,
    public createdAt: Date,
    public updatedAt: Date,
    public links: Link[]
  ) {
  }
}
