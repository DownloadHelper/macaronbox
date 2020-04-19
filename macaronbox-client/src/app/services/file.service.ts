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
    return this.http.get<any[]>(environment.serverUrl + 'api/files?path=' + folderPath);
  }

  enrichFile(fileName: string, isMovie: boolean = true): Observable<any> {
    return this.http.get<any>(environment.serverUrl + 'api/files/enrich?fileName=' + fileName + '&isMovie=' + isMovie);
  }

  downloadFile(filePath: string): Observable<any> {
    return this.http.get<any>(environment.serverUrl + 'api/files/download?path=' + filePath);
  }
}
