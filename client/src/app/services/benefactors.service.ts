import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {catchError, Observable, throwError, of} from "rxjs";
import {Benefactor} from "../models/benefactor";
import {map} from "rxjs/operators";
import {Pickpoint} from "../models/pickpoint";
import {Post} from '../models/post';
import {Link} from '../models/link';
import {Offer} from '../models/offer';

@Injectable({
  providedIn: 'root'
})
export class BenefactorsService {
  private static apiUrl = 'http://localhost:3000/benefactors';



  constructor(private http: HttpClient) {}

  public getAllBenefactors(): Observable<Benefactor[]> | null {
    return this.http.post<Benefactor[]>(`${BenefactorsService.apiUrl}` + '/all', {rest: true}, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body.data;
          } else {
            throw new Error('Error fetching benefactors');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }

  public getBenefactor(id: string): Observable<Benefactor> | null {
    return this.http.get<Benefactor>(`${BenefactorsService.apiUrl}/${id}`, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting benefactor');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public addBenefactor(benefactor: Benefactor): Observable<boolean> | null {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/`, benefactor, {})
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updateBenefactor(benefactor: Benefactor): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/`, benefactor, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deleteBenefactor(id: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/${id}`, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getAllPickpoints(benefactorId: string): Observable<Pickpoint[]> | null {
    return this.http.post<Pickpoint[]>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints`, {}, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error fetching pickpoints for benefactor with id ' + benefactorId + '.');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }

  public getPickpoint(benefactorId: string, pickpointId: string): Observable<Pickpoint> | null {
    return this.http.get<Pickpoint>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting benefactor');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public addPickpoint(benefactorId: string, pickpoint: Pickpoint): Observable<boolean> | null {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/`, pickpoint, {})
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updatePickpoint(benefactorId: string, pickpointId: string, pickpoint: Pickpoint): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, pickpoint, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deletePickpoint(benefactorId: string, pickpointId: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public addPost(benefactorId: string, post: Post): Observable<boolean> | null {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/${benefactorId}/posts`, post, {})
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updatePost(benefactorId: string, postId: string, post: Post): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/${benefactorId}/posts/${postId}`, post, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deletePost(benefactorId: string, postId: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/${benefactorId}/posts/${postId}`, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getPosts(benefactorId: string): Observable<Post[]> | null {
    return this.http.get<Post[]>(`${BenefactorsService.apiUrl}/${benefactorId}/posts/`, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting benefactor');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public getLastPosts(limit: number, page: number): Observable<Post[]> | null {
    return this.http.post<Post[]>(`${BenefactorsService.apiUrl}/posts/all`, {limit: limit, page: page}, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting benefactor');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public addLink(postId: string, link: Link): Observable<boolean> | null {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links`, link, {})
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updateLink(postId: string, linkId: string, link: Link): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links/${linkId}`, link, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deleteLink(postId: string, linkId: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links/${linkId}`, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getLastOffers(limit: number, page: number): Observable<Offer[]> | null {
    return this.http.get<Offer[]>(`${BenefactorsService.apiUrl}/offers/all/${limit}/${page}}`, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting offers');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }


  public addOffer(benefactor: string, offer: Offer | null): Observable<boolean> {
    if (offer === null) {
      return of(false);
    }

    return this.http.post<any>(`${BenefactorsService.apiUrl}/offers/` + benefactor, offer, {})
      .pipe(
        map(response => {
          if (response.type === 'success') {
            return true;
          }
          return false;
        })
      );
  }



  public updateOffer(benefactor: string, offer: Offer): Observable<boolean> {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/offers/${benefactor}`, offer, {})
      .pipe(
        map(response => {
          return response.status === 200;
        }),
        catchError(error => {
          console.error('Error updating offer:', error);
          return of(false);
        })
      );
  }

  public disableOffer(benefactor: string, offer: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/offers/` + offer)
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }

          return false;
        })
      );
  }

  public getOffers(benefactor: string): Observable<Offer[]> | null {
    return this.http.get<Offer[]>(`${BenefactorsService.apiUrl}/offers/` + benefactor)
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }
}
