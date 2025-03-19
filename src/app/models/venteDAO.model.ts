import {VenteModel} from "./vente.model";
import {ProduitModel} from "./produit.model";

export interface VenteDAOModel{
  vente : VenteModel;
  produitList : ProduitModel[];
}
