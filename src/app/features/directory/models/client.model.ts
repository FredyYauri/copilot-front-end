export interface Client {
  id: string;
  nombre: string;
  ruc: string | null;
  dni: string | null;
  direccion: string;
  distrito: string;
  referencia: string | null;
  telefono: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface ClientDetail extends Client {
  contacts: ClientContact[];
  commercialInfo: ClientCommercialInfo | null;
}

export interface ClientContact {
  id: string;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
  comentarios: string | null;
}

export interface ClientCommercialInfo {
  asesorComercial: string | null;
  codigoAsesor: string | null;
  medioCaptacion: string | null;
  centralRiesgo: string | null;
  lineaCredito: number | null;
  comentarios: string | null;
}

export interface CreateClientRequest {
  nombre: string;
  ruc: string | null;
  dni: string | null;
  direccion: string;
  distrito: string;
  referencia: string | null;
  telefono: string;
  contacts: CreateClientContact[] | null;
  commercialInfo: CreateClientCommercialInfo | null;
}

export interface CreateClientContact {
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
  comentarios: string | null;
}

export interface CreateClientCommercialInfo {
  asesorComercial: string | null;
  codigoAsesor: string | null;
  medioCaptacion: string | null;
  centralRiesgo: string | null;
  lineaCredito: number | null;
  comentarios: string | null;
}

export interface UpdateClientRequest {
  nombre: string;
  ruc: string | null;
  dni: string | null;
  direccion: string;
  distrito: string;
  referencia: string | null;
  telefono: string;
  isActive: boolean;
  contacts: CreateClientContact[] | null;
  commercialInfo: CreateClientCommercialInfo | null;
}

export interface ClientSearch {
  id: string;
  nombre: string;
  ruc: string | null;
  dni: string | null;
  telefono: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
