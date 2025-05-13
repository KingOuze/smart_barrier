import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopBarComponent } from '../components/top-bar/top-bar.component';
import { Color, NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopBarComponent, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Données pour les diagrammes
  public totalVoitures = 150;
  public voituresUrgence = 45;
  public voituresVolees = 20;

  // Diagramme en barres
  public barChartData = [
    { name: 'Total Voitures', value: this.totalVoitures },
    { name: 'Voitures Urgence', value: this.voituresUrgence },
    { name: 'Voitures Volées', value: this.voituresVolees }
  ];

  // Diagramme en courbes pour les amendes par jour
  public lineChartData = [
    {
      name: 'Amendes par jour',
      series: [
        { name: 'Janvier 1', value: 10 },
        { name: 'Janvier 2', value: 15 },
        { name: 'Janvier 3', value: 20 },
        { name: 'Janvier 4', value: 25 },
        { name: 'Janvier 5', value: 30 },
        { name: 'Janvier 6', value: 35 },
        { name: 'Janvier 7', value: 40 }
      ]
    }
  ];

  public colorScheme: Color = {
    domain: ['#5AA454', '#E44D25', '#C7B42C', '#AAAAAA'],
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal
  };

  // Utilisation de l'enum LegendPosition
  public legendPosition: LegendPosition = LegendPosition.Below;
window: any;

  constructor() { }

  ngOnInit(): void {
  }
}
