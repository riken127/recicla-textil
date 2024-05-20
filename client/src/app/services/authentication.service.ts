import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface EntityAuthData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3000/auth';
  private loginRoute = '/login';

  constructor(private http: HttpClient) { }

  authenticateUser(user: { password: string | null | undefined; username: string | null | undefined }): Observable<{
  token: string | null;
  statusCode: number
}> {
  return this.http.post(`${this.apiUrl}${this.loginRoute}`, {username: user.username, password: user.password, rest: true}, { observe: 'response', withCredentials: true })
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


  private extractToken(response: HttpResponse<any>): string | null {
    const cookieHeader = response.headers.get('Cookie');

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

    if (!tokenCookie) {
      return null;
    }

    return tokenCookie.split('=')[1];
  }

}
