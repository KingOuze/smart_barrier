import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../services/log-service.service';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../components/top-bar/top-bar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
@Component({
  selector: 'app-log-details',
  imports: [CommonModule, TopBarComponent, SidebarComponent],
  templateUrl: './log-details.component.html',
  styleUrls: ['./log-details.component.css']
})
export class LogDetailsComponent implements OnInit {
  logId: any ;
  logDate: any;
  logDetails: any;

  constructor(private route: ActivatedRoute, private logService: LogService, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.logId = params.get('id');
      this.logDate = params.get('date');

      // Récupérer les détails du log en utilisant le service
      this.logService.getActions(this.logId, this.logDate).subscribe(
        data => {
          this.logDetails = data;
        },
        error => {
          console.error('Erreur lors de la récupération des détails du log', error);
        }
      );
    });
  }

  //fonction pour retourner au liste des logs
  goBack() {
    // Redirection vers la page de historiques
    this.router.navigate(['historiques']);
  }

}
