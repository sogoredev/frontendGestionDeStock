import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {LoginService} from "../../services/login.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ErrorDialogComponent} from "../popup-dialog/error-dialog/error-dialog.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  public loginForm!: FormGroup;
  spinnerProgress: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private loginService: LoginService,
              private dialog: MatDialog) {
  }
  ngOnInit(): void {
    // recuperer les donnees / dataBinding
    this.loginForm = this.fb.group(
      {
        username: this.fb.control(''),
        password: this.fb.control('')
      }

    )
  }

  login() {
    this.spinnerProgress = true;
    let username = this.loginForm.value.username;
    let password = this.loginForm.value.password;
    this.loginService.login(username,password).subscribe({
      next: data => {
        this.spinnerProgress = false;
        this.loginService.loadProfile(data);
        this.router.navigateByUrl("/admin/dashboard")
      },
      error: err => {
        // StockDuplicateException
        if (err.status === 409) {
           console.error("Erreur lors de la connexion :", err);
            alert("Impossible de se connecter. Vérifiez votre connexion ou contactez l'administrateur. 409");
          //  EmptyException
        } else if(err.status === 404) {
           console.error("Erreur lors de la connexion :", err);
           alert("Impossible de se connecter. Vérifiez votre connexion ou contactez l'administrateur. 404");
          // Bad request
        }else if(err.status === 400) {
          this.dialog.open(ErrorDialogComponent, {
            data: {message: err.error}
          });
        }else if (err.status === 403) {
          console.error("Erreur lors de la connexion :", err);
                     alert("Impossible de se connecte. Vérifiez votre connexion ou contactez l'administrateur. 403");
        }
        else{
          console.log(err);
        }
        this.spinnerProgress = false;
      }
    });
  }
}
