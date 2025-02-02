import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { ProduitService } from "../../../services/produit.service";
import { VenteService } from "../../../services/vente.service";
import { ProduitModel } from "../../../models/produit.model";
import { ClientService } from "../../../services/client.service";
import { ClientModel } from "../../../models/client.model";
import { VenteModel } from "../../../models/vente.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ErrorDialogComponent } from "../../popup-dialog/error-dialog/error-dialog.component";

@Component({
  selector: 'app-add-vente',
  templateUrl: './add-vente.component.html',
  styleUrl: './add-vente.component.css',
})
export class AddVenteComponent implements OnInit {

  venteListForm!: FormGroup;
  listProd!: ProduitModel[];
  listClient!: ClientModel[];
  produitsSelectionnes: any[] = [];
  spinnerProgress: boolean = false;
  public dataSource: any;
  filteredProd: ProduitModel[] = [];
  displayedColumns = ['designation', 'quantite', "prixUnitaire", 'reduction', 'montant', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog,
    private route: Router,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private venteService: VenteService,
    private prodService: ProduitService,
    private clientService: ClientService) {
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    
    // Initialisation des produits et clients
    this.prodService.listProduit()
      .subscribe(data => {
        this.listProd = data;
      }, error => {
        console.log(error);
      });

    this.clientService.listClient()
      .subscribe(data => {
        this.listClient = data;
      }, error => {
        console.log(error);
      });

    // Initialisation du formulaire
    this.venteListForm = this.fb.group({
      description: [''],
      reduction: [''],
      quantite: ['', Validators.required],
      note: [''],
      produitsVend: [[], Validators.required],
      clientDTO: [''],
      // Ajoute les contrôles pour le nouveau client
      nom: [''],
      prenom: [''],
      adresse: [''],
      telephone: ['', Validators.required],
      email: [''],
    });

    // Configuration du paginator et du sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Initialisation des produits
    this.prodService.listProduit().subscribe(
      (data) => {
        this.listProd = data;
        this.filteredProd = data; 
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Méthode pour filtrer les produits en fonction de la recherche
  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProd = this.listProd.filter((prod) =>
      prod.designation.toLowerCase().includes(searchValue)
    );
  
  }

  // Méthode pour afficher un SnackBar de succès
  showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['success'],
    });
  }

  // Méthode pour afficher un SnackBar d'erreur
  showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['error'], 
    });
  }

  // Méthode pour afficher un SnackBar d'information
  showInfoSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['info'], 
    });
  }

  onSelectProduit(prod: ProduitModel) {
    // Vérifier si le produit est déjà sélectionné
    const produitExiste = this.produitsSelectionnes.some(produit => produit.idProd === prod.idProd);

    if (produitExiste) {
      // Afficher un message ou notifier l'utilisateur que le produit est déjà sélectionné
      this.snackBar.open("Le produit " + prod.designation + " est déjà sélectionné.", 'Fermer', { duration: 3500 });
      return;
    }

    // Ajoutez le produit avec une quantité et un prix unitaire par défaut
    let produitAjoute = {
      ...prod,
      quantite: prod.quantite,
      prixUnitaire: prod.prixUnitaire,
    };

    // Ajouter le produit à la liste des produits sélectionnés
    this.produitsSelectionnes.push(produitAjoute);

    // Mettre à jour la dataSource du tableau avec les produits sélectionnés
    this.dataSource.data = this.produitsSelectionnes;

    // Mettre à jour les produits sélectionnés dans le formulaire
    this.venteListForm.patchValue({
      produitsVend: this.produitsSelectionnes
    });
  }


  ajoutVente() {
    if (!this.venteListForm.invalid) {
      this.venteListForm.markAllAsTouched();
      return;
    }

    // Si un nouveau client est saisi, ajoute-le d'abord
    if (this.venteListForm.value.telephone) {
      this.ajouterNouveauClientEtEnregistrerVente();
      return;
    }

    // Si un client existant est sélectionné, ajoute la vente directement
    this.enregistrerVente();
  }

  ajouterNouveauClientEtEnregistrerVente() {
    const nouveauClient: ClientModel = {
      idClient: null,
      nom: this.venteListForm.value.nom,
      prenom: this.venteListForm.value.prenom,
      adresse: this.venteListForm.value.adresse,
      telephone: this.venteListForm.value.telephone,
      email: this.venteListForm.value.email,
    };

    this.clientService.ajoutClient(nouveauClient).subscribe({
      next: (client) => {
        // Une fois le client créé, mets à jour le formulaire de vente avec le nouveau client
        this.venteListForm.patchValue({
          clientDTO: client, // Associe le nouveau client à la vente
        });

        // Enregistrer la vente avec le nouveau client
        this.enregistrerVente();
      },
      error: (err) => {
        // ClientDuplicateException
        if (err.status === 409) {
          this.dialog.open(ErrorDialogComponent, {
            data: { message: err.error }
          });
          //  ClientNotFoundException
        } else if (err.status === 404) {
          this.dialog.open(ErrorDialogComponent, {
            data: { message: err.error }
          });
          // EmailIncorrectException && EmptyException
        } else if (err.status === 400) {
          this.dialog.open(ErrorDialogComponent, {
            data: { message: err.error }
          });
        } else {
          console.log(err);
        }
        this.spinnerProgress = false;
      },
    });
  }

  enregistrerVente() {
    this.spinnerProgress = true;
    const vente: VenteModel = {
      idVente: null,
      description: this.venteListForm.value.description,
      quantite: this.venteListForm.value.quantite,
      reduction: this.venteListForm.value.reduction,
      note: this.venteListForm.value.note,
      produitsVend: this.venteListForm.value.produitsVend,
      clientDTO: this.venteListForm.value.clientDTO,
    };

    this.venteService.ajoutVente(vente).subscribe({
      next: (value) => {
        this.spinnerProgress = false;
        this.snackBar.open('Vente enregistrée avec succès!', 'Fermer', { duration: 3500 });
        this.route.navigateByUrl('/admin/vente');
      },
      error: (err) => {
        this.spinnerProgress = false;
        this.gestionErreurs(err);
      },
    });
  }

  gestionErreurs(err: any): void {
    if (err.status === 409) {
      this.dialog.open(ErrorDialogComponent, {
        data: { message: err.error },
      });
    } else if (err.status === 404) {
      this.dialog.open(ErrorDialogComponent, {
        data: { message: err.error },
      });
    } else if (err.status === 400) {
      this.dialog.open(ErrorDialogComponent, {
        data: { message: err.error },
      });
    } else {
      console.error(err);
    }
  }

  supprimer(index: any) {
    // Suppression du produit sélectionné de la liste
    this.produitsSelectionnes.splice(index, 1);
    this.dataSource.data = this.produitsSelectionnes;

    // Mettre à jour le formulaire après la suppression
    this.venteListForm.patchValue({
      produitsVend: this.produitsSelectionnes
    });
  }

  retour() {
    this.location.back();
  }

  annuler() {
    this.venteListForm = this.fb.group({
      description: [''],
      reduction: [''],
      quantite: [''],
      note: [''],
      produitsVend: [[]],
      clientDTO: [''],
    });
  }

  formatTelephone(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    if (input.length > 0) {
      input = input.match(/.{1,2}/g)?.join('-') || input;
    }
    this.venteListForm.get('telephone')?.setValue(input, { emitEvent: false });
  }
}

