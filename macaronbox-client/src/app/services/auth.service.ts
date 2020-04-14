import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  postAuth(user:any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<any>(environment.serverUrl + 'api/authenticate', JSON.stringify(user), httpOptions);
  }

  isAuth(): Observable<any> {
    return this.http.get<any>(environment.serverUrl + 'api/user');
  }
}
