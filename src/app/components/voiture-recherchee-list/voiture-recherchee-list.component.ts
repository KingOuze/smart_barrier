import { Component, OnInit } from '@angular/core';
import { VoitureRechercheeService } from '../../services/voiture-recherchee.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoitureRechercheCreateComponent } from "../voiture-recherchee-create/voiture-recherchee-create.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopBarComponent } from "../top-bar/top-bar.component";
import Swal from 'sweetalert2';
import { User } from '../../user.model';
import { VoitureService } from '../../services/voiture.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-voiture-recherchee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VoitureRechercheCreateComponent, SidebarComponent, TopBarComponent, RouterModule],
  templateUrl: './voiture-recherchee-list.component.html',
  styleUrls: ['./voiture-recherchee-list.component.css']
})
export class VoitureRechercheeListComponent implements OnInit {
  voituresRecherchees: any[] = [];
  filteredVoitures: any[] = [];
  showCreateModal: boolean = false;
  showModal: boolean = false;
  searchQuery: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 4;
  voitureForm: FormGroup;
  selectedVoiture: any = null;
  selectedVoitures: Set<string> = new Set();
  user: User | undefined;

  constructor(private router: Router, private fb: FormBuilder, private voitureService: VoitureRechercheeService, private voitureService2: VoitureService) {
    this.voitureForm = this.fb.group({
      plaque: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3,4}[A-Z]{2}$/)]],
      modele: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.min(700000000), Validators.max(789999999)]],
      contact: ['', [Validators.required, Validators.email]],
      archived: [false],
      estCible: [false]
    });
  }

  ngOnInit() {
    this.loadVoitures();
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) as User : undefined;
    if (!this.user) {
      this.router.navigate(['/login']);
    }
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
  isAdmin(): boolean {
    return this.user?.role === 'administrateur';
  }

  isUser(): boolean {
    return this.user?.role === 'agent';
  }

  loadVoitures(): void {
    this.voitureService.getVoituresRecherchees().subscribe(
      data => {
        this.voituresRecherchees = data;
        this.filterVoitures();
      },
      error => {
        console.error('Erreur lors du chargement des voitures', error);
      }
    );
  }

  filterVoitures(): void {
    let filtered = this.voituresRecherchees;

    if (this.searchQuery) {
      filtered = filtered.filter(voiture =>
        voiture.plaque.includes(this.searchQuery) ||
        voiture.modele.includes(this.searchQuery) ||
        voiture.contact.includes(this.searchQuery)
      );
    }

    if (this.statusFilter !== '') {
      const estCible = this.statusFilter === 'true';
      filtered = filtered.filter(voiture => voiture.estCible === estCible);
    }

    this.filteredVoitures = filtered;
    this.currentPage = 1;
  }

  toggleSelection(id: string) {
    if (this.selectedVoitures.has(id)) {
      this.selectedVoitures.delete(id);
    } else {
      this.selectedVoitures.add(id);
    }
  }

  isVoitureSelected(id: string): boolean {
    return this.selectedVoitures.has(id);
  }

  toggleSelectAll() {
    if (this.selectedVoitures.size === this.voituresRecherchees.length) {
      this.selectedVoitures.clear();
    } else {
      this.voituresRecherchees.forEach(voiture => this.selectedVoitures.add(voiture._id));
    }
  }

  areAllVoituresSelected(): boolean {
    return this.selectedVoitures.size === this.voituresRecherchees.length;
  }

  markSelectedAsRecherchees() {
    this.updateSelectedVoitures(true);
  }

  markSelectedAsTrouvees() {
    this.updateSelectedVoitures(false);
  }

  updateSelectedVoitures(estCible: boolean) {
    const updates = Array.from(this.selectedVoitures).map(id =>
      this.voitureService.updateVoitureRecherchee(id, { estCible }).toPromise()
    );

    Promise.all(updates)
      .then(() => {
        this.voituresRecherchees.forEach(voiture => {
          if (this.selectedVoitures.has(voiture._id)) {
            voiture.estCible = estCible;
          }
        });
        Swal.fire(estCible ? 'Recherché' : 'Trouvé', 'Les voitures sélectionnées ont été mises à jour.', 'success');
      })
      .catch(err => {
        console.error('Erreur lors de la mise à jour des voitures sélectionnées', err);
        Swal.fire('Erreur', 'Une erreur est survenue lors de la mise à jour des voitures sélectionnées.', 'error');
      });
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

  openUpdateModal(voiture: any): void {
    this.selectedVoiture = { ...voiture };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVoiture = null;
  }

  updateVoiture(): void {
    if (this.voitureForm.valid) {
      this.voitureService.updateVoitureRecherchee(this.selectedVoiture._id, this.voitureForm.value).subscribe(
        response => {
          console.log('Voiture mise à jour avec succès', response);
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'Voiture mise à jour',
            text: 'La voiture a été mise à jour avec succès.',
          });
          window.location.reload();
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
  }

  get plaque() {
    return this.voitureForm.get('plaque');
  }

  get modele() {
    return this.voitureForm.get('modele');
  }

  get telephone() {
    return this.voitureForm.get('telephone');
  }

  get contact() {
    return this.voitureForm.get('contact');
  }

  isFormComplete(): boolean {
    return this.voitureForm.valid;
  }

  toggleArchiveVoiture(id: string, isArchived: boolean): void {
    const action = isArchived ? 'unarchive' : 'archive';
    this.voitureService2.archiveVoiture(id, action).subscribe(
      data => {
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

  toggleEstCible(id: string) {
    this.voitureService.toggleEstCible(id).subscribe({
      next: (updatedVoiture) => {
        const voiture = this.voituresRecherchees.find(v => v._id === updatedVoiture._id);
        if (voiture) {
          voiture.estCible = updatedVoiture.estCible;

          if (updatedVoiture.estCible) {
            Swal.fire('Recherché', 'La voiture est maintenant recherchée.', 'success');
          } else {
            Swal.fire('Trouvé', 'La voiture est maintenant trouvée.', 'success');
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors du basculement de estCible', err);
        Swal.fire('Erreur', 'Une erreur est survenue lors du basculement de l\'état.', 'error');
      }
    });
  }
}
