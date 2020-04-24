import { AuthService } from './services/auth.service';
import { CONFIG } from './models/config';
import { ConfigService } from './services/config.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'Macaronbox';
  isLoggedIn: boolean = false;

  constructor(private configService: ConfigService, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getConfig();
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
    });
  }
}
