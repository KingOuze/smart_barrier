import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../user.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  @Input() user!: User;
  userForm!: FormGroup;
  passwordStrength: string = '';
  passwordStrengthMessage: string = '';
  passwordStrengthWidth: string = '0%';
  showPassword: boolean = false;
  showVerifyPassword: boolean = false;
  showOrganismeField: boolean = false;
  userConnect: User | undefined ;

  @Output() closeModal = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private userService: UserService, private logService: LogService) {}

  ngOnInit(): void {

    const userData = localStorage.getItem('user');
    this.userConnect = userData ? JSON.parse(userData) as User : undefined;

    this.userForm = this.fb.group({
      nom: [this.user.nom, [Validators.required, Validators.pattern(/^(?!\s*$|\d+$)[a-zA-Z\s]+$/)]],
      prenom: [this.user.prenom, [Validators.required, Validators.pattern(/^(?!\s*$|\d+$)[a-zA-Z\s]+$/)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.minLength(5)]],
      verifierMotDePasse: ['', []],
      telephone: [this.user.telephone, [Validators.required, Validators.min(700000000), Validators.max(789999999)]],
      role: [this.user.role, [Validators.required]],
      organisme: [this.user.organisme]
    }, { validators: this.passwordMatchValidator });

    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });
  }

  onRoleChange(role: string) {
    const organismeControl = this.userForm.get('organisme');

    if (role === 'administrateur') {
      // Si le rôle est "administrateur", définir l'organisme sur "Smart Barriere" et masquer le champ
      organismeControl?.setValue('Smart Barriere');
      organismeControl?.clearValidators(); // Supprimer le validateur "required"
      this.showOrganismeField = false;
    } else {
      // Sinon, réinitialiser l'organisme à vide, afficher le champ et ajouter le validateur "required"
      organismeControl?.setValue('');
      organismeControl?.setValidators(Validators.required); // Ajouter le validateur "required"
      this.showOrganismeField = true;
    }

    // Mettre à jour l'état de validation du contrôle
    organismeControl?.updateValueAndValidity();
  }

  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const motDePasse = formGroup.get('motDePasse')?.value;
    const verifierMotDePasse = formGroup.get('verifierMotDePasse')?.value;
    return motDePasse && verifierMotDePasse && motDePasse !== verifierMotDePasse ? { mismatch: true } : null;
  }

  checkPasswordStrength() {
    const password = this.userForm.get('motDePasse')?.value;
    let strength = 0;

    if (password.length >= 5) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password) || /[\W_]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        this.passwordStrength = 'Faible';
        this.passwordStrengthMessage = 'Mot de passe faible';
        this.passwordStrengthWidth = '33%';
        break;
      case 2:
        this.passwordStrength = 'Moyen';
        this.passwordStrengthMessage = 'Mot de passe moyen';
        this.passwordStrengthWidth = '66%';
        break;
      case 3:
        this.passwordStrength = 'Fort';
        this.passwordStrengthMessage = 'Mot de passe fort';
        this.passwordStrengthWidth = '100%';
        break;
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'motDePasse') {
      this.showPassword = !this.showPassword;
    } else if (field === 'verifierMotDePasse') {
      this.showVerifyPassword = !this.showVerifyPassword;
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.updateUser(this.user._id!, this.userForm.value).subscribe(
        response => {
          if(this.userConnect){
            this.logService.logAction(this.userConnect?._id, 'Mise à jour utilisateur', this.user._id!);
          }
          Swal.fire('Succès', 'L\'utilisateur a été mis à jour avec succès.', 'success');
          this.closeModal.emit();
        },
        error => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
          Swal.fire('Erreur', 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.', 'error');
        }
      );
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
