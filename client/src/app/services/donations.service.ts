import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Donation } from '../models/donation';
import { map } from 'rxjs/operators';
import { Item } from '../models/item';

@Injectable({
  providedIn: 'root',
})
export class DonationsService {
  private static apiUrl = 'http://localhost:3000/donations';

  constructor(private http: HttpClient) {}

  public getAllDonations(): Observable<Donation[]> | null {
    return this.http
      .post<Donation[]>(
        `${DonationsService.apiUrl}` + '/all',
        {},
        { observe: 'response', withCredentials: true }
      )
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error fetching donations');
          }
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getDonation(id: string): Observable<Donation> | null {
    return this.http
      .get<any | Donation>(`${DonationsService.apiUrl}/${id}`, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (response instanceof Donation) {
            return response;
          } else {
            throw new Error('Error getting donation');
          }
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public addDonation(donation: Donation): Observable<string> | null {
    return this.http
      .post<any>(`${DonationsService.apiUrl}/`, donation, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (
            response.status === 200 &&
            response.body &&
            response.body.result
          ) {
            return response.body.result;
          }
          return null;
        })
      );
  }

  public updateDonation(donation: Donation): Observable<boolean> | null {
    return this.http
      .put<any>(`${DonationsService.apiUrl}/${donation._id}`, donation, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return true;
          }
          return false;
        })
      );
  }

  public deleteDonation(id: string): Observable<boolean> | null {
    return this.http.delete<any>(`${DonationsService.apiUrl}/${id}`, {}).pipe(
      map((response) => {
        if (response.statusCode === 200) {
          return true;
        }
        return false;
      })
    );
  }

  public getAllItems(donationId: string): Observable<Item[]> | null {
    return this.http
      .post<Item[]>(
        `${DonationsService.apiUrl}/${donationId}/items/all`,
        {},
        { observe: 'response', withCredentials: true }
      )
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error(
              'Error fetching items from donation with id ' + donationId + '.'
            );
          }
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getItem(donationId: string, itemId: string): Observable<Item> | null {
    return this.http
      .get<any | Item>(
        `${DonationsService.apiUrl}/${donationId}/items/${itemId}`,
        {}
      )
      .pipe(
        map((response) => {
          if (response instanceof Item) {
            return response;
          } else {
            throw new Error('Error getting item');
          }
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public addItem(donationId: string, item: Item): Observable<boolean> | null {
    return this.http
      .post<any>(`${DonationsService.apiUrl}/${donationId}/items/`, item, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          if (response.status === 200 || response.status === 201) {
            return true;
          }
          return false;
        })
      );
  }

  public updateItem(
    donationId: string,
    itemId: string,
    item: Item
  ): Observable<boolean> | null {
    return this.http
      .put<any>(
        `${DonationsService.apiUrl}/${donationId}/items/${itemId}`,
        item,
        {}
      )
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      );
  }

  public deleteItem(
    donationId: string,
    itemId: string
  ): Observable<boolean> | null {
    return this.http
      .delete<any>(
        `${DonationsService.apiUrl}/${donationId}/items/${itemId}`,
        {}
      )
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      );
  }
}
