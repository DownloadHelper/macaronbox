import { FileService } from './../../services/file.service';
import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit {

  isLoadingDownload:boolean = false;

  fileName: string;
  fileTitle: string;
  filePath: string;

  streamPath: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private fileService: FileService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.fileName = params['fileName'];
      this.fileTitle = params['fileTitle'];
      this.filePath = params['filePath'];
     
      this.streamPath = environment.serverUrl + 'download/' + params['filePath'];
    });
  }

  downloadFile(fileName:string, filePath:string) {
    this.isLoadingDownload = true;
    // trick to force download
    this.forceDownloadFile(filePath, fileName);
  }

  forceDownloadFile(filePath:string, fileName:string) {
    const anchor = document.createElement('a');
    anchor.href = environment.serverUrl + 'download/' + filePath;
    anchor.download = fileName;
    anchor.target = '_self';
    anchor.click();
    this.isLoadingDownload = false;
  }

  goBack() {
    this.router.navigate(['home']);
  }

}
