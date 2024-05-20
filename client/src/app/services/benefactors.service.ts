import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {catchError, Observable, pipe, throwError} from "rxjs";
import {Benefactor} from "../models/benefactor";
import {map} from "rxjs/operators";
import {Pickpoint} from "../models/pickpoint";

@Injectable({
  providedIn: 'root'
})
export class BenefactorsService {
  private static apiUrl = 'http://localhost:3000/benefactors';



  constructor(private http: HttpClient) { }

  public getAllBenefactors(): Observable<Benefactor[]> | null {
    return this.http.post<Benefactor[]>(`${BenefactorsService.apiUrl}` + '/all', {rest: true}, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>)  => {
          if (response.status === 200) {
            return response.body;
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
    return this.http.get<Benefactor>(`${BenefactorsService.apiUrl}/${id}`,{observe: 'response', withCredentials: true})
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
    return this.http.get<any | Pickpoint>(`${BenefactorsService.apiUrl}/${benefactorId}/pickpoints/${pickpointId}`, {})
      .pipe(
        map((response) => {
          if (response instanceof Pickpoint) {
            return response;
          } else {
            throw new Error('Error getting pickpoint');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
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
}
