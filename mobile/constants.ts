import { MaterialIcons } from '@expo/vector-icons';

export interface Item {
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene' | 'Frios' | 'Frutas' | 'Padaria' | 'Bebidas' | 'PetShop' | 'Utilidades' | 'Escolar' | 'Outros'; 
}

export const groupIcons: Record<Item['grupo'], keyof typeof MaterialIcons.glyphMap> = {
  Alimentício: 'restaurant',
  Higiene: 'wash',
  Frios: 'ac-unit',
  Frutas: 'eco',
  Padaria: 'bakery-dining',
  Bebidas: 'local-drink',
  PetShop: 'pets',
  Utilidades: 'home-repair-service',
  Escolar: 'school',
  Outros: 'category',
};