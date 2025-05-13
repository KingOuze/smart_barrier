import { Component, Output, EventEmitter } from '@angular/core';
import { VoitureService } from '../../services/voiture.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';  // Import SweetAlert
import { User } from '../../user.model';
import { LogService } from '../../services/log-service.service';


declare var $: any;  // Declare jQuery as any to avoid TypeScript errors
@Component({
  selector: 'app-voiture-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './voiture-create.component.html',
  styleUrl: './voiture-create.component.css'
})
export class VoitureCreateComponent {
  @Output() closeModal = new EventEmitter<void>();
  voitureForm: FormGroup;
  userConnect: User | undefined; // Récupérer l'utilisateur connecté
  //showModal: boolean = true; // Contrôle l'affichage du modal

  constructor(private fb: FormBuilder, private voitureService: VoitureService, private logService: LogService) {


    this.voitureForm = this.fb.group({
      plaque: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3,4}[A-Z]{2}$/)]],
      modele: ['', Validators.required],
      organisme: ['', Validators.required],
      contact: ['', [Validators.required, Validators.email]],
      archived: [false],
      estCible: [false]
    });
  }
    ngOnInit(): void {
      const userData = localStorage.getItem('user');
      this.userConnect = userData? JSON.parse(userData) as User : undefined;
    }

    formatPlaque(event: Event): void {
      const input = event.target as HTMLInputElement;
      let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Nettoyage de l'entrée

      let parts = [];
      let position = 0;

      // Partie 1 : Extraction des 2 premières lettres uniquement
      let part1Letters = [];
      for (let i = 0; i < value.length && part1Letters.length < 2; i++) {
        if (/[A-Z]/.test(value[i])) {
          part1Letters.push(value[i]);
          position = i + 1; // Position après la dernière lettre trouvée
        }
      }
      if (part1Letters.length > 0) {
        parts.push(part1Letters.join(''));
      }

      // Partie 2 : Extraction des chiffres après les lettres
      const chiffres = value.substr(position)
        .replace(/[^0-9]/g, '')
        .substr(0, 4);
      if (chiffres.length > 0) {
        parts.push(chiffres);
        position += chiffres.length;

        // Partie 3 : Lettres restantes uniquement si des chiffres sont présents
        const lettres = value.substr(position)
          .replace(/[^A-Z]/g, '')
          .substr(0, 2);
        if (lettres.length > 0) {
          parts.push(lettres);
        }
      }

      // Assemblage sans tirets
      let formatted = parts.join('').substr(0, 8);

      input.value = formatted;
      this.voitureForm.get('plaque')?.setValue(formatted, { emitEvent: false });
    }



  onSubmit() {
    if (this.voitureForm.valid) {
      this.voitureService.createVoiture(this.voitureForm.value).subscribe(response => {
        if(this.userConnect && this.userConnect._id) {
          this.logService.logAction(this.userConnect._id, 'Création voiture', response._id);
        }
        Swal.fire('Success', 'Voiture créée avec succès!', 'success');
        this.closeModal.emit();
        window.location.reload();
      }, error => {
        Swal.fire('Error', 'Échec de la création de la voiture!', 'error');
      });
    } else {
      this.voitureForm.markAllAsTouched();
    }
  }

  get plaque() {
    return this.voitureForm.get('plaque');
  }

  get modele() {
    return this.voitureForm.get('modele');
  }

  get organisme() {
    return this.voitureForm.get('organisme');
  }

  get contact() {
    return this.voitureForm.get('contact');
  }

  isFormComplete(): boolean {
    return this.voitureForm.valid;
  }
}
