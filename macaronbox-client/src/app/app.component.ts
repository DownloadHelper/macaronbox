import { CONFIG } from './models/config';
import { ConfigService } from './services/config.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Macaronbox';

  constructor(private configService: ConfigService) { }

  ngOnInit(): void {
    this.getConfig();
  }

  getConfig() {
    this.configService.getConfig().subscribe(config => {
      CONFIG.useParseTorrentName = config.useParseTorrentName;
      CONFIG.useTmdbApi = config.useTmdbApi;
    });
  }
}
