import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  message: string = null;

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit() {
    if(this.loginForm.valid) {
      this.message = null;
      this.authService.postAuth(this.loginForm.value).subscribe(
        res => {
          console.log(res);
          this.router.navigate(['']);
        },
        err => {
          console.warn(err.error.message);
          this.message = err.error.message;
        })
    };
  }
}
