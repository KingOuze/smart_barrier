import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';
import { User } from '../../user.model';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  user: User | undefined ;

  constructor(private router: Router, private authService: AuthService, private logService: LogService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) as User : undefined;
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  activateMenuItem(event: MouseEvent): void {
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    (event.currentTarget as HTMLElement).classList.add('active');
  }

  isAdmin(): boolean {
    return this.user?.role === 'administrateur';
  }

  isUser(): boolean {
    return this.user?.role === 'agent';
  }

  //deconnexion de l'utilisateur
  logout(): void {

    if(this.user != undefined) {
      if (this.user && this.user._id) {
        this.logService.logLogout(this.user._id);
      }
    }
    this.authService.logout();

  }
}
