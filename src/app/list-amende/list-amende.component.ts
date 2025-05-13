import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../components/top-bar/top-bar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import Swal from 'sweetalert2';
import { Amende } from '../amende';
import { AmendeService } from '../services/amende-service.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../user.model';
import { LogService } from '../services/log-service.service';

@Component({
  selector: 'app-list-amende',
  imports: [CommonModule, TopBarComponent, SidebarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './list-amende.component.html',
  styleUrls: ['./list-amende.component.css']
})

export class ListAmendeComponent implements OnInit {
  
  amendes: any[] = [];
  filteredAmendes: any[] = [];
  searchQuery: string = '';
  plaqueQuery: string = '';
  dateQuery: string = '';
  selectedAmende: Amende | null = null;
  selectedAmendes: Amende[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math: any = Math;
  showCreateAmendeModal: boolean = false;
  showEditAmendeModal: boolean = false;

  userConnect: User | undefined

  constructor(private amendeService: AmendeService, private logService: LogService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.userConnect = userData? JSON.parse(userData) as User : undefined;
    this.loadAmendes();
  }

  loadAmendes(): void {
    this.amendeService.getAllAmendes().subscribe(
      (data: any) => {
        this.amendes = data;
        this.filteredAmendes = data;
        this.filterAmendes();
      },
      (error: any) => {
        console.error('Erreur lors du chargement des amendes', error);
      }
    );
  }

  filterAmendes(): void {
    this.filteredAmendes = this.amendes
      .filter(amende =>
        (amende.plaque && amende.plaque.toLowerCase().includes(this.plaqueQuery.toLowerCase())) ||
        (this.dateQuery && new Date(amende.date).toISOString().split('T')[0] === this.dateQuery)
      )
      .slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  toggleStatus(amende: Amende): void {
    const newStatus = !amende.status;
    this.amendeService.updateAmendeStatus(amende._id, newStatus).subscribe(
      (updatedAmende: Amende) => {
        // Mettre à jour l'amende dans la liste locale
        const index = this.amendes.findIndex(a => a._id === updatedAmende._id);
        if (index !== -1) {
          this.amendes[index].status = newStatus;
          this.filterAmendes();
        }

        // Log l'action
        if (this.userConnect && this.userConnect._id) {
          this.logService.logAction(this.userConnect._id, 'Changement de statut amende', amende._id);
        }
        
        Swal.fire('Succès', `L'amende a été marquée comme ${newStatus ? 'payée' : 'non payée'} avec succès.`, 'success');
      },
      (error: any) => {
        console.error('Erreur lors de la mise à jour du statut de l\'amende', error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la mise à jour du statut de l\'amende.', 'error');
      }
    );
  }

  nextPage(): void {
    if ((this.currentPage - 1) * this.itemsPerPage < this.amendes.length) {
      this.currentPage++;
      this.filterAmendes();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterAmendes();
    }
  }
}
