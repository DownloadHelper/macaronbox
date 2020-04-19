import { CONFIG } from './../models/config';
import { FileService } from './../services/file.service';
import { environment } from './../../environments/environment';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  files: any[];
  currentPath: string;

  videoExtensionList: string[] = ['mkv', 'avi', 'mts', 'm2ts', 'ts', 'mov', 'qt', 'wmv', 'amv', 'mp4', 'm4p', 'm4v', 
                                  'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v'];

  constructor(private authService: AuthService, private fileService: FileService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getRootFiles();
  }


  getRootFiles() {
    this.currentPath = '';
    this.getFolderFiles(this.currentPath);
  }

  goToFolderOrDownload(folderPath:string, isDir:boolean) {
    if(isDir) {
      this.getFolderFiles(folderPath);
    } else {
      this.downloadFile(folderPath);
    }
  }

  getFolderFiles(folderPath:string) {
    this.currentPath = folderPath;
    this.fileService.getFolderFiles(folderPath).subscribe(
      res => {
        this.files = res;
        res.forEach(file => {
          if(CONFIG.useParseTorrentName && CONFIG.useTmdbApi) {
            let isMovie = (file.season || file.episode) ? false : true; 
            if(!file.isDir) this.enrichFile(file.title, file.originalName, isMovie);
          }
        })
      },
      err => {
        if(err.status === 401) {
          this.router.navigate(['login']);
        } else {
          this.snackBar.open(err.error, "OK");
        }
      }
    )
  }

  downloadFile(filePath:string) {
    this.fileService.downloadFile(filePath).subscribe(
      res => {
        window.location.href = environment.serverUrl + res;
      },
      err => {
        if(err.status === 401) {
          this.router.navigate(['login']);
        } else {
          this.snackBar.open(err.error, "OK");
        }
      }
    )
  }

  enrichFile(fileName:string, originalName:string, isMovie:boolean = true) {
    let extension = originalName.split('.').pop();
    if(extension && this.videoExtensionList.includes(extension.toLocaleLowerCase())) {
      this.fileService.enrichFile(fileName, isMovie).subscribe(
        res => {
          if(res) {
            let fileToEnrich = this.files.find(file => file.originalName == originalName);
            if(res.poster_path) {
              fileToEnrich.poster = 'http://image.tmdb.org/t/p/w185/' + res.poster_path;
            }
            fileToEnrich.vote_average = res.vote_average;
            fileToEnrich.release_date = res.release_date;
            fileToEnrich.overview = res.overview;
            fileToEnrich.release_date = res.release_date;
            this.files = this.files.map(file => file.originalName == originalName ? fileToEnrich : file);
          }
        },
        err => {
          if(err.status === 401) {
            this.router.navigate(['login']);
          } else {
            this.snackBar.open(err.error, "OK");
          }
        }
      )
    }
  }

  goBack() {
    if(this.currentPath) {
      let splitPath = this.currentPath.split('/');
      let path = '';
      if(splitPath.length > 1) {
        splitPath.pop();
        path = splitPath.join('/');
      }

      this.getFolderFiles(path);
    }
  }
}
