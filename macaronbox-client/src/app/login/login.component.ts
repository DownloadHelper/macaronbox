import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  message: string = null;

  showFistAuthForm: boolean = false;

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  editForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  login() {
    if(this.loginForm.valid) {
      this.message = null;
      this.authService.postAuth(this.loginForm.value).subscribe(
        res => {
          console.log(res);
          if(!res.isFirstAuth) {
            this.router.navigate(['']);
          } else {
            this.showFistAuthForm = true;
            this.loginForm.reset();
          }
        },
        err => {
          this.loginForm.reset();
          console.warn(err.error.message);
          this.message = err.error.message;
        })
    };
  }

  editUser() {
    if(this.editForm.valid) {
      this.message = null;
      this.authService.editUser(this.editForm.value).subscribe(
        res => {
          this.loginForm.controls['username'].setValue(res);
          this.logout();
        },
        err => {
          this.editForm.reset();
          console.warn(err.error.message);
          this.message = err.error.message;
        })
    };
  }

  logout() {
    this.authService.logout().subscribe(
      res => {
        console.log(res);
      },
      err => {
        if(err.status === 401) {
          this.snackBar.open("username and password have been changed", "OK", {
            duration: 3000,
          });
          this.showFistAuthForm = false;
        } else {
          this.snackBar.open(err.error, "OK");
        }
      })
  }
}
