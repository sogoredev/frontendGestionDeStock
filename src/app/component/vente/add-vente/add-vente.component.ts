import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {ProduitService} from "../../../services/produit.service";
import {VenteService} from "../../../services/vente.service";
import {ProduitModel} from "../../../models/produit.model";
import {ClientService} from "../../../services/client.service";
import {ClientModel} from "../../../models/client.model";
import {VenteModel} from "../../../models/vente.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ErrorDialogComponent} from "../../popup-dialog/error-dialog/error-dialog.component";

@Component({
  selector: 'app-add-vente',
  templateUrl: './add-vente.component.html',
  styleUrl: './add-vente.component.css'
})
export class AddVenteComponent implements OnInit{

  venteListForm!: FormGroup;
  listProd!: ProduitModel[];
  listClient!: ClientModel[];
  produitsSelectionnes: any[] = [];
  spinnerProgress: boolean = false;
  public dataSource: any;
  displayedColumns = ['designation','quantite',"prixUnitaire",'reduction','montant','action'];
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
  }

  onSelectProduit(prod: ProduitModel) {
    // Vérifier si le produit est déjà sélectionné
    const produitExiste = this.produitsSelectionnes.some(produit => produit.idProd === prod.idProd);

    if (produitExiste) {
      // Afficher un message ou notifier l'utilisateur que le produit est déjà sélectionné
      this.snackBar.open("Le produit "  + prod.designation + " est déjà sélectionné.", 'Fermer', { duration: 3500 });
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

  ajouterNouveauClient(): void {
    if (this.venteListForm.get('nom') ||
        this.venteListForm.get('prenom')||
        this.venteListForm.get('adresse') ||
        this.venteListForm.get('telephone')||
        this.venteListForm.get('email')) {
      this.snackBar.open('Veuillez remplir tous les champs du nouveau client.', 'Fermer', { duration: 3500 });
      return;
    }
  
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
        this.snackBar.open('Nouveau client ajouté avec succès!', 'Fermer', { duration: 3500 });
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'ajout du client.', 'Fermer', { duration: 3500 });
        console.error(err);
      },
    });
  }
  


  ajoutVente() {
    if (!this.venteListForm.invalid) {
      this.venteListForm.markAllAsTouched();
      return;
    }
  
    // Si un nouveau client est saisi, ajoute-le d'abord
    if (this.venteListForm.value.nom && this.venteListForm.value.prenom) {
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
        this.spinnerProgress = false;
        this.snackBar.open('Erreur lors de l\'ajout du client.', 'Fermer', { duration: 3500 });
        console.error(err);
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
  
    // Validation du format du téléphone
    if (input.length !== 8) {
      this.venteListForm.get('telephone')?.setErrors({ invalidTelephone: true });
    } else {
      this.venteListForm.get('telephone')?.setErrors(null);
    }
  }
}

