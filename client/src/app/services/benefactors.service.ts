import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";
import {catchError, Observable, of, throwError} from "rxjs";
import {Benefactor} from "../models/benefactor";
import {map} from "rxjs/operators";
import {Pickpoint} from "../models/pickpoint";
import {Post} from '../models/post';
import {Link} from '../models/link';
import {Prize} from '../models/prize';
import {Offer} from '../models/offer';

@Injectable({
  providedIn: 'root'
})
export class BenefactorsService {
  private static apiUrl = 'http://localhost:3000/benefactors';


  constructor(private http: HttpClient) {
  }

  getAllBenefactors(draw: number, start: number, length: number, searchValue: string, orderBy: string, columnIndex: number, status?: string): Observable<any> {
    const body = {
      draw,
      start,
      length,
      'search[value]': searchValue,
      'order[0][dir]': orderBy,
      'order[0][column]': columnIndex,
      status
    };

    return this.http.post<{ data: Benefactor[], draw: number, recordsTotal: number, recordsFiltered: number }>(`${BenefactorsService.apiUrl}/all`, body, {withCredentials: true, observe: 'response'})
      .pipe(
        map((response: HttpResponse<any>)=> {
          return {
            benefactors: response.body.data,
            draw: response.body.draw,
            recordsTotal: response.body.recordsTotal,
            recordsFiltered: response.body.recordsFiltered
          };
        })
      );
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
    return this.http.post<any>(`${BenefactorsService.apiUrl}/`, benefactor, {observe: 'response', withCredentials: true})
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updateBenefactor(benefactor: Benefactor): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl +'/' + benefactor._id}/`, benefactor, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deleteBenefactor(id: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/${id}`, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getAllPickpoints(benefactorId: string): Observable<Pickpoint[]> | null {
    return this.http.post<Pickpoint[]>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/all`, {}, {
      observe: 'response',
      withCredentials: true
    })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body.data;
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
    return this.http.get<Pickpoint>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, {
      observe: 'response',
      withCredentials: true
    })
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
    return this.http.post<any>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/`, {pickpoint, rest: true}, {withCredentials: true, observe: 'response'})
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updatePickpoint(benefactorId: string, pickpointId: string, pickpoint: Pickpoint): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, pickpoint, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
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
          if (response.type === 'success') {
            return true;
          }
          return false;
        })
      )
  }

  public addPost( post: Post): Observable<any> | null {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/${post.benefactorId}/posts`, post, {observe: 'response', withCredentials: true})
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.body;
          }
          return false;
        })
      )
  }

  public updatePost( post: Post): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/${post.benefactorId}/posts/${post._id}`, post, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deletePost( post: Post): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/${post.benefactorId}/posts/${post._id}`, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getPosts(benefactorId: string): Observable<Post[]> | null {
    return this.http.get<Post[]>(`${BenefactorsService.apiUrl}/${benefactorId}/posts/`, {
      observe: 'response',
      withCredentials: true
    })
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

  public getLastPosts(pageNumber: number, pageSize: number): Observable<Post[]> | null {
    return this.http.get<Post[]>(`${BenefactorsService.apiUrl}/posts/all/${pageSize}/${pageNumber}`,
 {observe: 'response', withCredentials: true})
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
    return this.http.post<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links`, link, {observe: 'response', withCredentials: true})
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public updateLink(postId: string, linkId: string, link: Link): Observable<boolean> | null {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links/${linkId}`, link, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deleteLink(postId: string, linkId: string): Observable<boolean> | null {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/posts/${postId}/links/${linkId}`, {observe: 'response', withCredentials: true})
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public getLastOffers(pageNumber: number, pageSize: number, searchQuery: string): Observable<Offer[]> | null {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('pageNumber', pageNumber.toString())
      .set('search', searchQuery);

    return this.http.get<Offer[]>(`${BenefactorsService.apiUrl}/offers/all`, { params, observe: 'response', withCredentials: true })
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



  public addOffer(benefactor: string, offer: Offer | null): Observable<any> {
    if (offer === null) {
      return of(false);
    }

    return this.http.post<any>(`${BenefactorsService.apiUrl}/offers/` + benefactor, offer, {})
      .pipe(
        map(response => {
          return response
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

  public addPrize(prize: Prize): Observable<any> {
    return this.http.post<any>(`${BenefactorsService.apiUrl}/store/`, prize)
      .pipe(
        map(response => {
          return response
        })
      );
  }

  public updatePrize(prize: Prize): Observable<boolean> {
    return this.http.put<any>(`${BenefactorsService.apiUrl}/store/` + prize._id, prize)
      .pipe(
        map(response => {
          if (response.status === 200) {
            return true;
          }

          return false;
        })
      )
  }

  public deletePrize(id: string): Observable<boolean> {
    return this.http.delete<any>(`${BenefactorsService.apiUrl}/store/` + id)
      .pipe(
        map(response => {
          return response.type === 'success'
        })
      )
  }

  public getPrize(id: string): Observable<any> {
    return this.http.get<Prize>(`${BenefactorsService.apiUrl}/store/` + id, {
      observe: 'response',
      withCredentials: true
    })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error(response.body!.message)
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public getBenefactorPrizes(id: string): Observable<Prize[]> {
    return this.http.get<Prize[]>(`${BenefactorsService.apiUrl}/store/benefactor/` + id, {
      observe: 'response',
      withCredentials: true
    })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error(response.body!.message)
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }

  public getAllPrizes(pageNumber: number, pageSize: number, searchQuery: string): Observable<Prize[]> | null {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('pageNumber', pageNumber.toString())
      .set('search', searchQuery)

    return this.http.get<Prize[]>(`${BenefactorsService.apiUrl}/prizes/all`,
      {params, observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error getting offers.')
          }
        }),
        catchError(error => {
          return throwError(error)
        })
      );
  }

}
