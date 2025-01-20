import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {VenteService} from "../../services/vente.service";
import {VenteModel} from "../../models/vente.model";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";
import {ErrorDialogComponent} from "../popup-dialog/error-dialog/error-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {
  ConfirmationDialogVenteComponent
} from "../popup-dialog/confirmation-dialog-vente/confirmation-dialog-vente.component";
import { ConfirmationDialogSuppVenteComponent } from '../popup-dialog/confirmation-dialog-supp-vente/confirmation-dialog-supp-vente.component';
import {ApprovisionModel} from "../../models/approvision.model";

@Component({
  selector: 'app-vente',
  templateUrl: './vente.component.html',
  styleUrl: './vente.component.css',
  providers: [DatePipe],
})
export class VenteComponent implements OnInit{

  public dataSource: any;
  public listeVente!: Array<VenteModel>;
  spinnerProgress: boolean = false;
  displayedColumns = ['description','quantite','montant','reduction','dateVente','clientDTO','utilisateurVente','status','action']
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
              private venteService: VenteService,
              private datePipe: DatePipe,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit(): void {
    this.venteService.listVente()
      .subscribe(
        data => {
          this.listeVente = data;
          this.dataSource = new MatTableDataSource(this.listeVente);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        }
      )

  }

  ajouterVente() {
    this.router.navigateByUrl("/admin/addVente")
  }

  // Méthode pour formater la date
  formatDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  modifier(idVente: string) {
    this.router.navigateByUrl(`/admin/updateVente/${idVente}`)
  }

  supprimer(vente: VenteModel) {
    const dialogRef = this.dialog.open(ConfirmationDialogSuppVenteComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.spinnerProgress= true;
        this.venteService.supprimer(vente).subscribe(
          response => {
            this.spinnerProgress= false;
            this.ngOnInit();
            this.snackBar.open('Vente supprimer avec succès!', 'Fermer', { duration: 3500 });
            this.router.navigateByUrl("/admin/vente");
          },
          error => {
            if(error.status === 400){
              this.spinnerProgress= false;
              this.dialog.open(ErrorDialogComponent, {
                data: {message: error.error}
              });
            }
          }
        );
      }
    })
  }

  details() {

  }

  annuler(vente: VenteModel) {
    console.log(vente);
    const dialogRef = this.dialog.open(ConfirmationDialogVenteComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.spinnerProgress= true;
        this.venteService.annuler(vente).subscribe(
          response => {
            this.spinnerProgress= false;
            this.ngOnInit();
            this.snackBar.open('Vente annuler avec succès!', 'Fermer', { duration: 3500 });
            this.router.navigateByUrl("/admin/vente");
          },
          error => {
            if(error.status === 400){
              this.spinnerProgress= false;
              this.dialog.open(ErrorDialogComponent, {
                data: {message: error.error}
              });
            }
          }
        );
      }
    })
  }

  // Méthode pour appliquer le filtre
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
