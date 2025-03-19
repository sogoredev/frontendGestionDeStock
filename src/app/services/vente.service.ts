import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { VenteDAOModel } from '../models/venteDAO.model';
import { VenteModel } from '../models/vente.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {ClientModel} from "../models/client.model";
import {ApprovisionModel} from "../models/approvision.model";

@Injectable({
  providedIn: 'root'
})
export class VenteService {

  constructor(private http: HttpClient) { }

  public listVente(): Observable<VenteDAOModel[]> {
    return this.http.get<VenteDAOModel[]>(`${environment.backendHost}/vente/listeVente`);
  }

  public totalVente(){
    return  this.http.get<number>(`${environment.backendHost}/vente/totalVente`)
  }

  afficher(idVente: string): Observable<VenteDAOModel> {
    return this.http.get<VenteDAOModel>(`${environment.backendHost}/vente/afficherVente`, {
      params: new HttpParams().set('idVente', idVente)
    });
  }

  public modifierVente(vente: VenteModel): Observable<VenteModel> {
    return this.http.put<VenteModel>(`${environment.backendHost}/vente/modifier/${vente.idVente}`, vente, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  ajoutVente(vente: VenteModel) {
    return this.http.post<VenteModel>(`${environment.backendHost}/vente/effectuerVente`, vente, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  annuler(vente: VenteModel) {
    return this.http.post<VenteModel>(`${environment.backendHost}/vente/annulerVente`,vente, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  supprimer(venteId: string) {
    return this.http.put<VenteModel>(`${environment.backendHost}/vente/supprimerVente`, venteId, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
