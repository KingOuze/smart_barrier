import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoitureService } from '../../services/voiture.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { VoitureCreateComponent } from "../voiture-create/voiture-create.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { User } from '../../user.model';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-voiture-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VoitureCreateComponent, SidebarComponent],
  templateUrl: './voiture-list.component.html',
  styleUrl: './voiture-list.component.css'
})
export class VoitureListComponent implements OnInit {
  voitures: any[] = [];
  filteredVoitures: any[] = [];
  selectedVoiture: any = null;
  showModal: boolean = false;
  selectedVoitures: Set<string> = new Set();
  searchQuery: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  showCreateModal: boolean = false;
  voitureForm: FormGroup;
  userConnect: User | undefined

  constructor(private fb: FormBuilder,  private voitureService: VoitureService, private logService: LogService) {
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
    this.loadVoitures();
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

  loadVoitures(): void {
    this.voitureService.getVoitures().subscribe(
      data => {
        this.voitures = data;
        this.filterVoitures();
      },
      error => {
        console.error('Erreur lors du chargement des voitures', error);
      }
    );
  }

  filterVoitures(): void {
    let filtered = this.voitures.filter(voiture =>
      voiture.plaque.includes(this.searchQuery) ||
      voiture.modele.includes(this.searchQuery) ||
      voiture.contact.includes(this.searchQuery)
    );

    if (this.statusFilter) {
      filtered = filtered.filter(voiture =>
        this.statusFilter === 'actif' ? !voiture.archived : voiture.archived
      );
    }

    this.filteredVoitures = filtered;
    this.currentPage = 1;
  }

  toggleArchiveVoiture(id: string, isArchived: boolean): void {
    const action = isArchived ? 'unarchive' : 'archive';
    this.voitureService.archiveVoiture(id, action).subscribe(
      data => {
        if(this.userConnect && this.userConnect._id){
          this.logService.logAction(this.userConnect._id, `Archivage/désarchivage de la voiture `, id);
        }
        this.loadVoitures();
        Swal.fire({
          icon: 'success',
          title: isArchived ? 'Voiture désarchivée' : 'Voiture archivée',
          text: isArchived ? 'La voiture a été désarchivée avec succès.' : 'La voiture a été archivée avec succès.',
        });
      },
      error => {
        console.error('Erreur lors de l\'archivage/désarchivage de la voiture', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'archivage/désarchivage de la voiture.',
        });
      }
    );
  }

  toggleSelection(id: string): void {
    if (this.selectedVoitures.has(id)) {
      this.selectedVoitures.delete(id);
    } else {
      this.selectedVoitures.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedVoitures.size === this.filteredVoitures.length) {
      this.selectedVoitures.clear();
    } else {
      this.filteredVoitures.forEach(voiture => this.selectedVoitures.add(voiture._id));
    }
  }

  archiveSelectedVoitures(): void {
    this.updateSelectedVoitures('archive');
  }

  unarchiveSelectedVoitures(): void {
    this.updateSelectedVoitures('unarchive');
  }

  updateSelectedVoitures(action: string): void {
    const ids = Array.from(this.selectedVoitures);
    ids.forEach(id => {
      this.voitureService.archiveVoiture(id, action).subscribe(
        data => {
          this.loadVoitures();
          Swal.fire({
            icon: 'success',
            title: action === 'archive' ? 'Voitures archivées' : 'Voitures désarchivées',
            text: action === 'archive' ? 'Les voitures sélectionnées ont été archivées avec succès.' : 'Les voitures sélectionnées ont été désarchivées avec succès.',
          });
        },
        error => {
          console.error(`Erreur lors de l'${action} des voitures`, error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: `Une erreur est survenue lors de l'${action} des voitures.`,
          });
        }
      );
    });
  }

  openUpdateModal(voiture: any): void {
    this.selectedVoiture = { ...voiture };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVoiture = null;
  }

  updateVoiture(): void {

    const validUpdates = {
      plaque: this.selectedVoiture.plaque,
      modele: this.selectedVoiture.modele,
      contact: this.selectedVoiture.contact,
      archived: this.selectedVoiture.archived,
      estCible: this.selectedVoiture.estCible,
      organisme: this.selectedVoiture.organisme
    };

    this.voitureService.updateVoiture(this.selectedVoiture._id, validUpdates).subscribe(
      data => {
        if(this.userConnect && this.userConnect._id){
          this.logService.logAction(this.userConnect._id, `Mise à jour de la voiture `, this.selectedVoiture._id);
        }
        this.loadVoitures();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Voiture mise à jour',
          text: 'La voiture a été mise à jour avec succès.',
        });
      },
      error => {
        console.error('Erreur lors de la mise à jour de la voiture', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la mise à jour de la voiture.',
        });
      }
    );
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  get paginatedVoitures(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVoitures.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVoitures.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
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
