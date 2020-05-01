import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  getRootFiles(): Observable<any[]> {
    return this.http.get<any[]>(environment.serverUrl + 'api/files');
  }

  getFolderFiles(folderPath: string): Observable<any[]> {
    return this.http.get<any[]>(environment.serverUrl + 'api/files?path=' + folderPath, { withCredentials: true });
  }

  enrichFile(languageCode: string, fileName: string, isMovie: boolean = true, season?: string, episode?: string, year?: string): Observable<any> {
    let queryParams = '';
    if(languageCode) queryParams = queryParams + '&language=' + languageCode;
    if(season) queryParams = queryParams + '&season=' + season;
    if(episode) queryParams = queryParams + '&episode=' + episode;
    if(year) queryParams = queryParams + '&year=' + year;

    return this.http.get<any>(environment.serverUrl + 'api/files/enrich?fileName=' + fileName + '&isMovie=' + isMovie + queryParams, {withCredentials: true});
  }

  downloadFile(filePath: string): Observable<any> {
    return this.http.get<any>(environment.serverUrl + 'api/files/download?path=' + filePath, {withCredentials: true});
  }
}
