import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from '../../user.model';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  showOrganismeField: boolean = false;

  userConnect: User | undefined

  @Output() closeModal = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private userService: UserService, private logService: LogService) {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^(?!\s*$|\d+$)[a-zA-Z\s]+$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^(?!\s*$|\d+$)[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.min(700000000), Validators.max(789999999)]],
      role: ['administrateur', [Validators.required]], // Rôle par défaut : administrateur
      organisme: [''] // Organisme initialisé à vide
    });

    // Écoute les changements de valeur du champ "role"
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });

  }
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.userConnect = userData? JSON.parse(userData) as User : undefined;
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

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value).subscribe(
        response => {
          if(this.userConnect && this.userConnect._id) {
            if (this.userConnect && this.userConnect._id) {
              this.logService.logAction(this.userConnect._id, 'Création utilisateur', response._id);
            }
          }
          Swal.fire('Succès', 'L\'utilisateur a été créé avec succès.', 'success');
          this.closeModal.emit();
        },
        error => {
          console.error('Erreur lors de la création de l\'utilisateur', error);
          Swal.fire('Erreur', 'Une erreur s\'est produite lors de la création de l\'utilisateur.', 'error');
        }
      );
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
