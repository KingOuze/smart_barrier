import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../user.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditUserComponent } from "../edit-user/edit-user.component";
import { UserCreateComponent } from "../user-create/user-create.component";
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditUserComponent, UserCreateComponent, SidebarComponent, TopBarComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  selectedUser: User | null = null;
  selectedUsers: User[] = [];
  statusFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 4;
  Math: any = Math;
  showCreateUserModal: boolean = false;
  showEditUserModal: boolean = false;

  userConnect: User | undefined

  constructor(private userService: UserService, private logService: LogService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.userConnect = userData? JSON.parse(userData) as User : undefined;

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      data => {
        this.users = data;
        this.filteredUsers = data;
        this.filterUsers();
      },
      error => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    );
  }

  filterUsers(): void {
    let filtered = this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.telephone.includes(this.searchQuery) ||
      (user.organisme && user.organisme.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );

    if (this.statusFilter) {
      filtered = filtered.filter(user =>
        this.statusFilter === 'actif' ? !user.archived : user.archived
      );
    }

    this.filteredUsers = filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  openEditUserModal(user: User): void {
    this.selectedUser = user;
    this.showEditUserModal = true;
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.loadUsers(); // Recharger la liste des utilisateurs après modification
  }

  openCreateUserModal(): void {
    this.showCreateUserModal = true;
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal = false;
    this.loadUsers(); // Recharger la liste des utilisateurs après la création
  }

  archiveUser(user: User): void {
    this.userService.archiveUser(user._id!).subscribe(
      () => {
        if(this.userConnect && this.userConnect._id){
          this.logService.logAction(this.userConnect._id, 'Archivage utilisateur', user._id);
        }
        Swal.fire('Archivé!', 'L\'utilisateur a été archivé.', 'success');
        this.loadUsers(); // Recharger la liste des utilisateurs
      },
      error => {
        console.error('Erreur lors de l\'archivage de l\'utilisateur', error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de l\'archivage de l\'utilisateur.', 'error');
      }
    );
  }

  unarchiveUser(user: User): void {
    this.userService.unarchiveUser(user._id!).subscribe(
      () => {
        if(this.userConnect && this.userConnect._id){
          this.logService.logAction(this.userConnect._id, 'Désarchivage utilisateur', user._id);
        }
        Swal.fire('Désarchivé!', 'L\'utilisateur a été désarchivé.', 'success');
        this.loadUsers(); // Recharger la liste des utilisateurs
      },
      error => {
        console.error('Erreur lors de la désarchivage de l\'utilisateur', error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la désarchivage de l\'utilisateur.', 'error');
      }
    );
  }

  archiveSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      Swal.fire('Aucune sélection', 'Veuillez sélectionner au moins un utilisateur à archiver.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous archiver les utilisateurs sélectionnés?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, archiver!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedUsers.forEach(user => {
          this.userService.archiveUser(user._id!).subscribe(
            () => {
              if(this.userConnect && this.userConnect._id){
                this.logService.logAction(this.userConnect._id, 'Archivage utilisateur', user._id);
              }

              Swal.fire('Archivé!', 'Les utilisateurs sélectionnés ont été archivés.', 'success');
              this.loadUsers(); // Recharger la liste des utilisateurs
            },
            error => {
              console.error('Erreur lors de l\'archivage de l\'utilisateur', error);
              Swal.fire('Erreur', 'Une erreur s\'est produite lors de l\'archivage de l\'utilisateur.', 'error');
            }
          );
        });
      }
    });
  }

  unarchiveSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      Swal.fire('Aucune sélection', 'Veuillez sélectionner au moins un utilisateur à désarchiver.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous désarchiver les utilisateurs sélectionnés?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, désarchiver!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedUsers.forEach(user => {
          this.userService.unarchiveUser(user._id!).subscribe(
            () => {
              if(this.userConnect && this.userConnect._id){
                this.logService.logAction(this.userConnect._id, 'Désarchivage utilisateur', user._id);
              }
              Swal.fire('Désarchivé!', 'Les utilisateurs sélectionnés ont été désarchivés.', 'success');
              this.loadUsers(); // Recharger la liste des utilisateurs
            },
            error => {
              console.error('Erreur lors de la désarchivage de l\'utilisateur', error);
              Swal.fire('Erreur', 'Une erreur s\'est produite lors de la désarchivage de l\'utilisateur.', 'error');
            }
          );
        });
      }
    });
  }

  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      Swal.fire('Aucune sélection', 'Veuillez sélectionner au moins un utilisateur à supprimer.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous supprimer les utilisateurs sélectionnés?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedUsers.forEach(user => {
          this.userService.deleteUser(user._id!).subscribe(
            () => {
              if(this.userConnect && this.userConnect._id){
                this.logService.logAction(this.userConnect._id, 'Suppression utilisateur', user._id);
              }
              Swal.fire('Supprimé!', 'Les utilisateurs sélectionnés ont été supprimés.', 'success');
              this.loadUsers(); // Recharger la liste des utilisateurs
            },
            error => {
              console.error('Erreur lors de la suppression de l\'utilisateur', error);
              Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression de l\'utilisateur.', 'error');
            }
          );
        });
      }
    });
  }

  toggleSelection(user: User, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      const isChecked = target.checked;
      if (isChecked) {
        this.selectedUsers.push(user);
      } else {
        const index = this.selectedUsers.indexOf(user);
        if (index !== -1) {
          this.selectedUsers.splice(index, 1);
        }
      }
    }
  }

  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      const isChecked = target.checked;
      if (isChecked) {
        this.selectedUsers = [...this.filteredUsers];
      } else {
        this.selectedUsers = [];
      }
    }
  }

  isSelected(user: User): boolean {
    return this.selectedUsers.includes(user);
  }

  nextPage(): void {
    if ((this.currentPage - 1) * this.itemsPerPage < this.users.length) {
      this.currentPage++;
      this.filterUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterUsers();
    }
  }
}
