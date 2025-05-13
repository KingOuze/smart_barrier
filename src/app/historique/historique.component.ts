import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from '../components/top-bar/top-bar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Log } from '../log';
import { LogService } from '../services/log-service.service';
import Swal from 'sweetalert2';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';


interface UserSession {
  userId: string;
  userDetails: any;
  sessions: Log[]; // Chaque session contient maintenant les actions
  lastLogin: Date;
  totalActions?: number;
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, TopBarComponent, SidebarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit {
  user: any;
  creation: number = 0;
  suppression: number = 0;
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  selectedLog: Log | null = null;
  selectedUserId: string | null = null;
  users: any[] = [];
  expandedLogs: { [key: string]: boolean } = {};
  searchTerm: string = '';
  dateFilter: string = '';
  totalUsers: any;
  totalLogins: any;
  averageSessionTime: any;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math: any = Math;
  userSessions: UserSession[] = [];
  filteredUserSessions: UserSession[] = [];
  paginatedUserSessions: UserSession[] = [];
  expandedUsers: { [key: string]: boolean } = {};

  constructor(
    private logService: LogService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadLogs();
    this.loadUsers();
  }

  ngOnInit() {
    this.loadUsersAndLogs();
  }

  loadUsersAndLogs() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.logService.getLogs().subscribe({
          next: (logs) => {
            this.logs = Array.isArray(logs) ? logs : [logs];
            this.processGroupedLogs();
            this.filterLogs();
          }
        });
      },
      error: (err) => console.error('Erreur utilisateurs:', err)
    });
  }

  processGroupedLogs() {
    const grouped = new Map<string, UserSession>();
    
    this.logs.forEach(log => {
      const user = this.users.find(u => u._id === log.userId);
      if (!user) return;

      if (!grouped.has(log.userId)) {
        grouped.set(log.userId, {
          userId: log.userId,
          userDetails: user,
          sessions: [],
          lastLogin: new Date(0),
          totalActions: 0
        });
      }

      const sessionGroup = grouped.get(log.userId)!;
      sessionGroup.sessions.push(log);
      sessionGroup.totalActions! += log.actions?.length || 0;
      
      // Mettre à jour la dernière connexion
      const loginDate = new Date(log.loginTime);
      if (loginDate > sessionGroup.lastLogin) {
        sessionGroup.lastLogin = loginDate;
      }
    });

    this.userSessions = Array.from(grouped.values()).map(session => ({
      ...session,
      sessions: session.sessions.sort((a, b) => 
        new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime())
    }));
  }

  getActionCount(log: Log): number {
    return log.actions?.length || 0;
  }

  getActionTypes(log: Log): string {
    return log.actions?.map(a => a.type).join(', ') || 'Aucune action';
  }

  filterLogs() {
    const term = this.searchTerm.toLowerCase();
    const date = this.dateFilter;

    this.filteredUserSessions = this.userSessions.filter(session => {
      const user = session.userDetails;
      const matchesSearch = user.prenom.toLowerCase().includes(term) ||
        user.nom.toLowerCase().includes(term) ||
        user.telephone.toLowerCase().includes(term);

      if (!date) return matchesSearch;

      return session.sessions.some(log => {
        const loginDate = new Date(log.loginTime).toISOString().split('T')[0];
        const logoutDate = log.logoutTime ? 
          new Date(log.logoutTime).toISOString().split('T')[0] : '';
        return loginDate === date || logoutDate === date;
      });
    });

    this.filteredUserSessions.sort((a, b) => 
      new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());
    
    this.currentPage = 1;
    this.updatePaginatedLogs();
  }

  updatePaginatedLogs() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUserSessions = this.filteredUserSessions.slice(start, end);
  }

  toggleExpand(userId: string) {
    this.expandedUsers[userId] = !this.expandedUsers[userId];
  }
  loadLogs() {
    this.logService.getLogs().subscribe({
      next: (data: any) => {
        this.logs = data;
        this.filteredLogs = data;
        this.filterLogs();
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des logs', err);
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      },
    });
  }


  nextPage() {
    if ((this.currentPage - 1) * this.itemsPerPage < this.logs.length) {
      this.currentPage++;
      this.updatePaginatedLogs();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedLogs();
    }
  }

  navigateToDetails(log: any) {
    if (log.actions != null && log.actions.length > 0) {
      const userId = log.userId;
      const logoutTime = log.logoutTime;

      this.router.navigate(['/details', userId, logoutTime]);
    } else {
      Swal.fire("Cet utilisateur n'a fait aucune action");
      return;
    }
  }

  getUserDetails(userId: string): any {
    this.user = this.users.find((user: { _id: string }) => user._id === userId);
    return this.user;
  }
}
