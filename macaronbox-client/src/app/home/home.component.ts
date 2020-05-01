import { ConfigService } from './../services/config.service';
import { CONFIG } from './../models/config';
import { FileService } from './../services/file.service';
import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoading:boolean = false;

  files: any[];
  currentPath: string;

  searchModel: string = '';

  videoExtensionList: string[] = ['mkv', 'avi', 'mts', 'm2ts', 'ts', 'mov', 'qt', 'wmv', 'amv', 'mp4', 'm4p', 'm4v', 
                                  'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v'];

  constructor(private translate: TranslateService, private fileService: FileService, private configService: ConfigService, 
              private router: Router, private snackBar: MatSnackBar) {

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getFolderFiles(this.currentPath);
    });
   }

  ngOnInit(): void {
    this.getRootFiles();
    this.checkUpdate();
  }

  checkUpdate() {
    this.configService.checkUpdate().subscribe(res => {
      if(res.version > CONFIG.version) {
        this.snackBar.open("New version (v" + res.version + ") is available", "OK");
      }
    });
  }

  getRootFiles() {
    this.currentPath = '';
    this.getFolderFiles(this.currentPath);
  }

  goToFolderOrDownload(folderPath:string, isDir:boolean) {
    if(isDir) {
      this.searchModel = '';
      this.getFolderFiles(folderPath);
    } else {
      this.downloadFile(folderPath);
    }
  }

  getFolderFiles(folderPath:string) {
    this.currentPath = folderPath;
    this.isLoading = true;
    this.fileService.getFolderFiles(folderPath).subscribe(
      res => {
        this.files = res;
        res.forEach(file => {
          if(CONFIG.useParseTorrentName && CONFIG.useTmdbApi) {
            let isMovie = (file.season || file.episode) ? false : true; 
            if(!file.isDir) {
              if(file.season && file.episode) {
                this.enrichFile(file.title, file.originalName, isMovie, file.year, file.season, file.episode);
              } else {
                this.enrichFile(file.title, file.originalName, isMovie, file.year);
              }
            } else {
              this.isLoading = false;
            }
          } else {
            this.isLoading = false;
          }
        });

        if(res.length === 0) this.isLoading = false;
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

  enrichFile(fileName:string, originalName:string, isMovie:boolean = true, year:string = null, season:string = null, episode:string = null) {
    let extension = originalName.split('.').pop();

    if(extension && this.videoExtensionList.includes(extension.toLocaleLowerCase())) {
      this.fileService.enrichFile(this.translate.instant("LANGUAGE_CODE"), fileName, isMovie, season, episode, year).subscribe(
        res => {
          if(res) {
            let fileToEnrich = this.files.find(file => file.originalName == originalName);
            if(res.poster_path) {
              fileToEnrich.poster = 'http://image.tmdb.org/t/p/w185/' + res.poster_path;
            }
            fileToEnrich.vote_average = res.vote_average;
            fileToEnrich.release_date = res.release_date;
            fileToEnrich.overview = res.overview;
            if(res.episode_air_date) fileToEnrich.release_date = res.episode_air_date;
            if(res.episode_name) fileToEnrich.episode_name = res.episode_name;

            this.files = this.files.map(file => file.originalName == originalName ? fileToEnrich : file);
          }
          this.isLoading = false;
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
