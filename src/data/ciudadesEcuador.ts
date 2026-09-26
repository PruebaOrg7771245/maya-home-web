// src/data/ciudadesEcuador.ts
//
// Lista de ciudades/localidades de Ecuador para el combobox del campo
// "Ciudad" del formulario de pedido. No es la lista administrativa oficial
// de cantones - es una lista curada de localidades reales (incluye pueblos
// turísticos y parroquias pequeñas), que es más útil en la práctica porque
// son los nombres que la gente realmente usa para identificar dónde vive.
//
// NOTA: se quitó un duplicado de "Salinas" que venía en la lista original
// (existen 2 lugares distintos con ese nombre en Ecuador) - se dejó una
// sola entrada porque mostrar el mismo texto 2 veces en un combobox simple
// no le sirve al cliente para distinguir cuál es cuál.

export const ciudadesEcuador: string[] = [
  "Alausí", "Ambato", "Archidona", "Atacames", "Atuntaqui", "Ayampe", "Ayangue",
  "Baeza", "Bahía de Caráquez", "Ballenita", "Baños", "Bellavista",
  "Canoa", "Carlos Julio Arosemena Tola", "Carrizal", "Catamayo", "Cayambe",
  "Chasqui", "Chimborazo", "Chugchilán", "Ciudadela Costa de Oro", "Cojimíes",
  "Cosanga", "Cotacachi", "Cotundo", "Crucita", "Cuenca", "Cumbayá",
  "Data de Posorja", "Data de Villamil", "Durán",
  "El Guabo", "Engabao", "Esmeraldas",
  "Floreana",
  "General Villamil", "Guaillabamba", "Gualaceo", "Guamote", "Guano", "Guaranda", "Guayaquil",
  "Hacienda Guambi", "Hacienda Mera", "Hacienda Zuleta", "Huaquillas", "Huigra",
  "Ibarra", "Ingapirca",
  "Jama", "Jaramijó",
  "La Libertad", "La Maná", "La Posta", "Las Tunas", "Lasso", "Latacunga", "Loja",
  "Macas", "Machachi", "Machala", "Machalilla", "Malacatos", "Manglaralto", "Manta",
  "Marian", "Mera", "Milagro", "Mindo", "Mompiche", "Montañita", "Montecristi",
  "Nanegalito", "Nono", "Nueva Loja",
  "Olón", "Otavalo",
  "Pallatanga", "Palora", "Papallacta", "Patate", "Paute", "Pedernales",
  "Pedro Vicente Maldonado", "Pifo", "Píllaro", "Piñas", "Portoviejo", "Porvenir",
  "Posorja", "Puembo", "Puerto Ayora", "Puerto Baquerizo Moreno", "Puerto Cayo",
  "Puerto Francisco de Orellana", "Puerto López", "Puerto Misahuallí", "Puerto Quito",
  "Puerto Villamil", "Pujilí", "Punta Blanca", "Puyo",
  "Quevedo", "Quilotoa", "Quito",
  "Río Arajuno", "Riobamba",
  "Salango", "Salasaca", "Salinas", "Same", "San Clemente", "San Cristóbal",
  "San Jacinto", "San Lorenzo", "San Miguel de los Bancos", "San Miguel de Salcedo",
  "San Pablo", "Sangolquí", "Santa Elena", "Santa Marianita", "Santa Rosa",
  "Santo Domingo de los Colorados", "Saraguro", "Sigchos", "Sucúa",
  "Tababela", "Tarapoa", "Tena", "Tonchigüe", "Tonsupa", "Tulcán", "Tumbabiro", "Tumbaco",
  "Urcuquí",
  "Vilcabamba",
  "Zamora", "Zumbagua",
];
