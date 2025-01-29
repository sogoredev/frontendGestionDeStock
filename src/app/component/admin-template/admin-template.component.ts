import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { LoginService } from "../../services/login.service";
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: ['./admin-template.component.css']
})
export class AdminTemplateComponent implements OnInit {

  @ViewChild('myDrawer') myDrawer!: MatDrawer;
  isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver,
              public authService: LoginService) { }

  ngOnInit(): void {
    // Détecter si l'écran est de taille mobile
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  // Méthode pour fermer le drawer après la navigation
  closeDrawerOnNavigation() {
    if (this.isMobile) {
      this.myDrawer.close(); 
    }
  }

  public logout() {
    this.authService.logout();
  }
}