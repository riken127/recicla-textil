import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

export interface EntityAuthData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3000/auth';
  private loginRoute = '/login';

  constructor(private http: HttpClient) {
  }

  public isAuthenticated(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/check`, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status == 200) {
            return true;
          }

          return false;
        }),
        catchError(error => {
          return throwError(error);
        })
      )
  }

  public authenticateUser(user: {
    password: string | null | undefined;
    username: string | null | undefined
  }): Observable<{
    token: string | null;
    statusCode: number
  }> {
    return this.http.post(`${this.apiUrl}${this.loginRoute}`, {
      username: user.username,
      password: user.password,
      rest: true
    }, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          const token = this.extractToken(response);
          const statusCode = response.status;

          return {
            token: token,
            statusCode: statusCode,
          };
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public authenticateBenefactor(user: {
    password: string | null | undefined;
    username: string | null | undefined
  }): Observable<{
    token: string | null;
    statusCode: number
  }> {
    return this.http.post(`${this.apiUrl}${this.loginRoute}`, {
      username: user.username,
      password: user.password,
      rest: true,
      benefactor: true
    }, {observe: 'response', withCredentials: true})
      .pipe(
        map((response: HttpResponse<any>) => {
          const token = this.extractToken(response);
          const statusCode = response.status;

          return {
            token: token,
            statusCode: statusCode
          };
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  getDecodedToken(
    id: boolean,
    fName: boolean,
    lName: boolean
  ): Observable<any> {
    let params = new HttpParams();

    if (id) {
      params = params.append('id', id);
    }

    if (fName) {
      params = params.append('fName', fName);
    }

    if (lName) {
      params = params.append('lName', lName);
    }

    return this.http
      .get(`${this.apiUrl}/getToken`, {params, withCredentials: true})
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getBenefactorDecodedToken(id: boolean, name: boolean): Observable<any> {
    let params = new HttpParams();

    if (id) {
      params = params.append('id', id);
    }

    if (name) {
      params = params.append('name', name);
    }

    return this.http
      .get(`${this.apiUrl}/getToken`, {params, withCredentials: true})
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private extractToken(response: HttpResponse<any>): string | null {
    const cookieHeader = response.headers.get('Cookie');

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('token='));

    if (!tokenCookie) {
      return null;
    }

    return tokenCookie.split('=')[1];
  }
}
