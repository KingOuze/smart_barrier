import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log-service.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.css']
})
export class AuthentificationComponent {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  showForgotPasswordModal: boolean = false;
  forgotEmail: string = '';
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private http: HttpClient, private logService: LogService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }



  get email() {
    return this.loginForm.get('email');
  }

  get motDePasse() {
    return this.loginForm.get('motDePasse');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        (response: any) => {

          // Sauvegarder le token et l'utilisateur dans le local storage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));


          this.logService.logLogin(response.user._id);
          window.location.href = '/dashboard/admin';
        },
        (error: any) => {
          console.error('Erreur lors de la connexion', error);
          this.errorMessage = error.error.message;
        }
      );
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  openForgotPasswordModal(event: Event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotEmail = '';
  }

  sendResetEmail() {
    this.http.post('http://localhost:5000/api/auth/forgot-password',  this.forgotPasswordForm.value )
      .subscribe(
        (response: any) => {
          Swal.fire('Succès', 'Mot de passe envoyé dans votre adresse email.', 'success');
          this.closeForgotPasswordModal();
        },
        (error: any) => {
          console.error('Erreur lors de la réinitialisation du mot de passe', error);
          Swal.fire('Erreur', 'Adresse Email Inconnu', 'error');
        }
      );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
