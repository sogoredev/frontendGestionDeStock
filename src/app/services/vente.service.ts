import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  public listVente(): Observable<Array<VenteModel>> {
    return this.http.get<Array<VenteModel>>(`${environment.backendHost}/vente/listeVente`);
  }

  public totalVente(){
    return  this.http.get<number>(`${environment.backendHost}/vente/totalVente`)
  }

  afficher(idVente: string): Observable<VenteModel> {
    return this.http.get<VenteModel>(`${environment.backendHost}/vente/afficherVente`, {
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

  supprimer(vente: VenteModel) {
    return this.http.put<VenteModel>(`${environment.backendHost}/vente/supprimerVente`, vente, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
