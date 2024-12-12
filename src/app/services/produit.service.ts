import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {ProduitModel} from "../models/produit.model";
import {UserModel} from "../models/user.model";
import {StockModel} from "../models/stock.model";
import {ApprovisionModel} from "../models/approvision.model";

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  constructor(private http: HttpClient) { }

  // methode recuperation de la liste
  public listProduit():Observable<Array<ProduitModel>>{
    return this.http.get<Array<ProduitModel>>(`${environment.backendHost}/produit/listeProd`);
  }

  ajoutCat(prod: ProduitModel): Observable<ProduitModel> {
    return this.http.post<ProduitModel>(`${environment.backendHost}/produit/enregistrerProd`,(prod), {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  modifierProd(prod: ProduitModel) : Observable<ProduitModel> {
    return this.http.put<ProduitModel>(`${environment.backendHost}/produit/modifierProd/${prod.idProd}`, prod, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  afficher(idProd: string) : Observable<ProduitModel> {
    return this.http.get<ProduitModel>(`${environment.backendHost}/produit/afficherProd/${idProd}`);
  }

  supprimerProod(idProd: string) {
    return this.http.put<ProduitModel>(`${environment.backendHost}/produit/supprimerProd`, (idProd), {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
