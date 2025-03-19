import {ClientModel} from "./client.model";
import {ProduitModel} from "./produit.model";
import { UserModel } from "./user.model";

export interface VenteModel{
  idVente: string | null,
  description: string | null,
  quantite: number,
  reduction: number | null,
  note: string | null,
  clientDTO: ClientModel,
  produitsVend: ProduitModel[],
  montant?:number;
  dateVente?:string;
  status?:string;
  utilisateurVente?:UserModel;
}
