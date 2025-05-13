import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoitureRechercheeService } from '../../services/voiture-recherchee.service';
import { CommonModule } from '@angular/common';
import { User } from '../../user.model';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-voiture-recherchee-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './voiture-recherchee-create.component.html',
  styleUrl: './voiture-recherchee-create.component.css'
})
export class VoitureRechercheCreateComponent {
  @Output() closeModal = new EventEmitter<void>();
  voitureForm: FormGroup;
  userConnect: User | undefined; // Récupérer l'utilisateur connecté

  constructor(private fb: FormBuilder, private voitureService: VoitureRechercheeService, private logService: LogService) {
    this.voitureForm = this.fb.group({
      plaque: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3,4}[A-Z]{2}$/)]],
      modele: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.min(700000000), Validators.max(789999999)]],
      contact: ['', [Validators.required, Validators.email]],
      archived: [false],
      estCible: [false]
    });
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

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.userConnect = userData? JSON.parse(userData) as User : undefined;
  }

  onSubmit() {
    if (this.voitureForm.valid) {
      const voitureData = {
        ...this.voitureForm.value,
        organisme: 'recherché',
        estCible: true
      };
      this.voitureService.createVoitureRecherchee(voitureData).subscribe(response => {
        if(this.userConnect && this.userConnect._id) {
          this.logService.logAction(this.userConnect._id, 'Création voiture recherchée', response._id);
        }
        console.log('Voiture créée avec succès', response);
        this.closeModal.emit();
      });
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

  get telephone() {
    return this.voitureForm.get('telephone');
  }

  get contact() {
    return this.voitureForm.get('contact');
  }

}
