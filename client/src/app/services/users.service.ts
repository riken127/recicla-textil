import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {User} from "../models/user";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private static apiUrl = 'http://localhost:3000/users';


  constructor(private http: HttpClient) {}

  public getAllUsers(): Observable<User[]> | null {
    return this.http.post<User[]>(`${UsersService.apiUrl}` + '/all', {}, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw new Error('Error fetching users');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public getUser(id: string): Observable<User> | null {
    return this.http.get<any | User>(`${UsersService.apiUrl}/${id}`, {})
      .pipe(
        map((response) => {
          if (response instanceof User) {
            return response;
          } else {
            throw new Error('Error getting specified user');
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  public addUser(user: User): Observable<boolean> | null {
    return this.http.post<any>(`${UsersService.apiUrl}/`, user, {})
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }
  public updateUser(user: User): Observable<boolean> | null {
    return this.http.put<any>(`${UsersService.apiUrl}/`, user, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public deleteUser(id: string): Observable<boolean> | null {
    return this.http.delete<any>(`${UsersService.apiUrl}/${id}`, {})
      .pipe(
        map(response => {
          if (response.statusCode === 200) {
            return true;
          }
          return false;
        })
      )
  }

  public redeemPrize(prizeId: string): Observable<any> {
    return this.http.post<any>("http://localhost:3000/benefactors/store/redeem/" + prizeId, {})
      .pipe(
        map((response: HttpResponse<any>) => {
          return response
        })
      )
  }
}
