import { TestBed } from '@angular/core/testing';
import { AuthenticationService, EntityAuthData } from './authentication.service';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { HttpClient } from '@angular/common/http';
import { firstValueFrom} from "rxjs";

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let http: HttpClient;

  beforeEach(() => {
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [AuthenticationService]
    });
    service = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpClient);
  });

  it('user exists, and credentials are correct.', () => {
    service.authenticateUser({username: 'anakin', password: '123'})
        .subscribe(authentication => {
        expect(authentication.statusCode).toBe(200);
      })
  });
  it('user does not exist.', () => {
    service.authenticateUser({username: 'imnotevenrealxd', password: '123'})
        .subscribe(authentication => {
        expect(authentication.statusCode).toBe(401);
      })
  });
  it('user exists, with wrong password.', () => {
    service.authenticateUser({username: 'anakin', password: 'incorrectpassword'})
        .subscribe(authentication => {
        expect(authentication.statusCode).toBe(401);
      })
  });

});

