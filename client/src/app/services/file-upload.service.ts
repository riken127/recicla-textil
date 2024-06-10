import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:3000';
  constructor(
    private http: HttpClient
  ) { }

  uploadBenefactorLogo(file: File, id: string): Observable<any> {
    let formData = new FormData();
    formData.append('entityType', 'benefactor');
    formData.append('entityId', id);
    formData.append('entitySubType', 'profile')
    formData.append('logo', file, `${id}-logo.jpg`);

    return this.http.post<any>(this.baseUrl + '/benefactors/upload/logo', formData, {observe: 'response', withCredentials: true})
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

  uploadBenefactorBanner(file: File, id: string): Observable<any> {
    let formData = new FormData();
    formData.append('entityType', 'benefactor');
    formData.append('entityId', id);
    formData.append('entitySubType', 'profile')
    formData.append('banner', file, `${id}-banner.jpg`);

    return this.http.post<any>(this.baseUrl + '/benefactors/upload/banner', formData, {observe: 'response', withCredentials: true})
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

  uploadPrizeImage(file: File, benefactorId: string, prizeId: string): Observable<any> {
    let formData = new FormData();
    formData.append("entityType", "benefactor");
    formData.append("entitySubType", "prize");
    formData.append("entityId", benefactorId)
    formData.append("prizeId", prizeId)
    formData.append("prize", file, `${prizeId}-prize.jpg`);

    return this.http.post<any>(this.baseUrl + '/benefactors/prizes/image/upload', formData, {
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

  uploadOfferImage(file: File, benefactorId: string, offerId: string): Observable<any> {
    let formData = new FormData();
    formData.append("entityType", "benefactor");
    formData.append("entitySubType", "offer");
    formData.append("entityId", benefactorId);
    formData.append("offerId", offerId);
    formData.append("offer", file, `${offerId}-offer.jpg`);

    return this.http.post<any>(this.baseUrl + '/benefactors/offers/image/upload', formData, {
      observe: 'response',
      withCredentials: true
    })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error(response.body!.message);
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }

  uploadPostImage(file: File, benefactorId: string, postId: string): Observable<any> {
    let formData = new FormData();
    formData.append("entityType", "benefactor");
    formData.append("entitySubType", "post");
    formData.append("entityId", benefactorId);
    formData.append("postId", postId);
    formData.append("post", file, `${postId}-post.jpg`);

    return this.http.post<any>(this.baseUrl + '/benefactors/posts/image/upload', formData, {
      observe: 'response',
      withCredentials: true
    })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error(response.body!.message);
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }
}
