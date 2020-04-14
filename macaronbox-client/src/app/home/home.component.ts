import { FileService } from './../services/file.service';
import { environment } from './../../environments/environment';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  files: any[];
  currentPath: string;

  constructor(private authService: AuthService, private fileService: FileService, private router: Router) { }

  ngOnInit(): void {
    this.checkUser();
    this.getRootFiles();
  }

  checkUser() {
    this.authService.isAuth().subscribe(
      res => {

      },
      err => {
        this.router.navigate(['login']);
      }
    )
  }

  getRootFiles() {
    this.currentPath = '';
    this.getFolderFiles(this.currentPath, true);
  }

  getFolderFiles(folderPath:string, isDir:boolean) {
    if(isDir) {
      this.currentPath = folderPath;
      this.fileService.getFolderFiles(folderPath).subscribe(
        res => {
          this.files = res;
        },
        err => {
          this.router.navigate(['login']);
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

      this.getFolderFiles(path, true);
    }
  }
}
