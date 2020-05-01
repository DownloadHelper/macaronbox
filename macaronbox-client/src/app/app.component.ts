import { AuthService } from './services/auth.service';
import { CONFIG } from './models/config';
import { ConfigService } from './services/config.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'Macaronbox';
  version: string = '';
  isLoggedIn: boolean = false;
  langs: string[] = ['en', 'fr'];
  currentLang: string = 'en';

  constructor(private translate: TranslateService, private configService: ConfigService, private authService: AuthService, 
              private router: Router, private snackBar: MatSnackBar) { 

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    if(localStorage.getItem('preference.lang')) this.currentLang = localStorage.getItem('preference.lang');
    translate.use(this.currentLang);
    localStorage.setItem('preference.lang', this.currentLang);
  }

  ngOnInit(): void {
    this.getConfig();
  }

  changeLang(lang:string) {
    this.translate.use(lang);
    localStorage.setItem('preference.lang', lang);
    this.currentLang = lang;
  }

  logout() {
    this.authService.logout().subscribe(
      res => {
        console.log(res);
      },
      err => {
        if(err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open(err.error, "OK");
        }
      });
  }

  getConfig() {
    this.configService.getConfig().subscribe(config => {
      CONFIG.useParseTorrentName = config.useParseTorrentName;
      CONFIG.useTmdbApi = config.useTmdbApi;
      CONFIG.version = config.version;
      this.version = config.version;
    });
  }
}
