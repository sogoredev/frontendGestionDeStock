import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {CategorieService} from "../../../services/categorie.service";
import {CategorieModel} from "../../../models/categorie.model";
import {ErrorDialogComponent} from "../../popup-dialog/error-dialog/error-dialog.component";
import {ProduitService} from "../../../services/produit.service";
import {ProduitModel} from "../../../models/produit.model";
import {ValidDialogProduitComponent} from "../../popup-dialog/valid-dialog-produit/valid-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-prod',
  templateUrl: './add-prod.component.html',
  styleUrl: './add-prod.component.css'
})
export class AddProdComponent implements OnInit{

  prodListForm!: FormGroup;
  listCategorie!: CategorieModel[];
  spinnerProgress: boolean = false;
  

  constructor(private dialog: MatDialog,
              private route: Router,
              protected router: Router,
              private snackBar: MatSnackBar,
              private location: Location,
              private fb: FormBuilder,
              private catService: CategorieService,
              private prodService: ProduitService) {
  }



  ngOnInit(): void {

    this.catService.listeCat()
      .subscribe(
        data =>{
          this.listCategorie = data;
        },
        error => {
          console.log(error)
        }
      )

    this.prodListForm = this.fb.group({
      designation: ['', Validators.required],
      quantite: ['', Validators.required],
      prixUnitaire: ['', Validators.required],
      image: [''],
      note: [''],
      cat: ['', Validators.required],
    })

    this.annulerProd();
  }

  retour() {
    this.location.back()
  }

  ajoutProd() {
    if (this.prodListForm.valid) {
      this.spinnerProgress = true;
      let prod: ProduitModel = {
        idProd: null,
        designation: this.prodListForm.value.designation,
        quantite: this.prodListForm.value.quantite,
        prixUnitaire: this.prodListForm.value.prixUnitaire,
        image: this.prodListForm.value.image,
        categorieStockProdDTO: this.prodListForm.value.cat,
        note: this.prodListForm.value.note,
      };
      this.prodService.ajoutCat(prod).subscribe({
        next: value => {
          this.spinnerProgress = false;
          this.snackBar.open('Produit mis à jour avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigateByUrl('/admin/produit');
        },
        error: err => {
          // ProduitDuplicateException
          if (err.status === 409) {
            this.dialog.open(ErrorDialogComponent, {
              data: { message: err.error }
            });
            //  EmptyException
          } else if(err.status === 404) {
            this.dialog.open(ErrorDialogComponent, {
              data: { message: err.error }
            });
            // MontantQuantiteNullException
          }else if(err.status === 400) {
            this.dialog.open(ErrorDialogComponent, {
              data: {message: err.error}
            });
          }else{
            console.log(err);
          }
          this.spinnerProgress = false;
        }
      });
    } else {
      this.prodListForm.markAllAsTouched();
    }
  }

  annulerProd() {
    this.prodListForm = this.fb.group({
      designation: [''],
      quantite: [''],
      prixUnitaire: [''],
      image: [''],
      note: [''],
      cat: [''],
    })
  }
}
