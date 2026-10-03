export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      baeume: {
        Row: {
          archiviert_am: string | null
          archiviert_von: string | null
          archivierungsgrund: string | null
          baum: string | null
          bewaesserungsbereich_id: string | null
          bewaesserungsgrund: string | null
          bezirk: string | null
          created_at: string
          durchfuehrung_von: string | null
          entwicklungsphase: string | null
          gattung_art: string | null
          hochwert: number | null
          id: string
          ist_archiviert: boolean
          objekt: string | null
          objektart: string | null
          pflanzjahr: number | null
          pflegebereich: number | null
          rechtswert: number | null
          stadtteil: string | null
          standalter: number | null
          zuletzt_bearbeitet_am: string | null
          zuletzt_bearbeitet_von: string | null
        }
        Insert: {
          archiviert_am?: string | null
          archiviert_von?: string | null
          archivierungsgrund?: string | null
          baum?: string | null
          bewaesserungsbereich_id?: string | null
          bewaesserungsgrund?: string | null
          bezirk?: string | null
          created_at?: string
          durchfuehrung_von?: string | null
          entwicklungsphase?: string | null
          gattung_art?: string | null
          hochwert?: number | null
          id?: string
          ist_archiviert?: boolean
          objekt?: string | null
          objektart?: string | null
          pflanzjahr?: number | null
          pflegebereich?: number | null
          rechtswert?: number | null
          stadtteil?: string | null
          standalter?: number | null
          zuletzt_bearbeitet_am?: string | null
          zuletzt_bearbeitet_von?: string | null
        }
        Update: {
          archiviert_am?: string | null
          archiviert_von?: string | null
          archivierungsgrund?: string | null
          baum?: string | null
          bewaesserungsbereich_id?: string | null
          bewaesserungsgrund?: string | null
          bezirk?: string | null
          created_at?: string
          durchfuehrung_von?: string | null
          entwicklungsphase?: string | null
          gattung_art?: string | null
          hochwert?: number | null
          id?: string
          ist_archiviert?: boolean
          objekt?: string | null
          objektart?: string | null
          pflanzjahr?: number | null
          pflegebereich?: number | null
          rechtswert?: number | null
          stadtteil?: string | null
          standalter?: number | null
          zuletzt_bearbeitet_am?: string | null
          zuletzt_bearbeitet_von?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baeume_archiviert_von_fkey"
            columns: ["archiviert_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baeume_bewaesserungsbereich_id_fkey"
            columns: ["bewaesserungsbereich_id"]
            referencedRelation: "bewaesserungsbereich"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baeume_zuletzt_bearbeitet_von_fkey"
            columns: ["zuletzt_bearbeitet_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      baum_import_aenderungen: {
        Row: {
          aktions_typ: string
          baum_id: string | null
          erstellt_am: string
          erstellt_von: string | null
          id: string
          import_lauf_id: string
          import_zeile_id: string | null
          nachher_snapshot: Json | null
          vorher_snapshot: Json | null
        }
        Insert: {
          aktions_typ: string
          baum_id?: string | null
          erstellt_am?: string
          erstellt_von?: string | null
          id?: string
          import_lauf_id: string
          import_zeile_id?: string | null
          nachher_snapshot?: Json | null
          vorher_snapshot?: Json | null
        }
        Update: {
          aktions_typ?: string
          baum_id?: string | null
          erstellt_am?: string
          erstellt_von?: string | null
          id?: string
          import_lauf_id?: string
          import_zeile_id?: string | null
          nachher_snapshot?: Json | null
          vorher_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "baum_import_aenderungen_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_aenderungen_erstellt_von_fkey"
            columns: ["erstellt_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_aenderungen_import_lauf_id_fkey"
            columns: ["import_lauf_id"]
            referencedRelation: "baum_import_lauf"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_aenderungen_import_zeile_id_fkey"
            columns: ["import_zeile_id"]
            referencedRelation: "baum_import_zeilen"
            referencedColumns: ["id"]
          },
        ]
      }
      baum_import_konflikte: {
        Row: {
          beschreibung: string | null
          bestehende_baum_id: string | null
          details: Json | null
          erstellt_am: string
          geloest_am: string | null
          geloest_von: string | null
          id: string
          import_lauf_id: string
          import_zeile_id: string | null
          konflikt_typ: string
          loesungsaktion: string | null
          loesungsstatus: string
          schweregrad: string
          titel: string
        }
        Insert: {
          beschreibung?: string | null
          bestehende_baum_id?: string | null
          details?: Json | null
          erstellt_am?: string
          geloest_am?: string | null
          geloest_von?: string | null
          id?: string
          import_lauf_id: string
          import_zeile_id?: string | null
          konflikt_typ: string
          loesungsaktion?: string | null
          loesungsstatus?: string
          schweregrad?: string
          titel: string
        }
        Update: {
          beschreibung?: string | null
          bestehende_baum_id?: string | null
          details?: Json | null
          erstellt_am?: string
          geloest_am?: string | null
          geloest_von?: string | null
          id?: string
          import_lauf_id?: string
          import_zeile_id?: string | null
          konflikt_typ?: string
          loesungsaktion?: string | null
          loesungsstatus?: string
          schweregrad?: string
          titel?: string
        }
        Relationships: [
          {
            foreignKeyName: "baum_import_konflikte_bestehende_baum_id_fkey"
            columns: ["bestehende_baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_konflikte_geloest_von_fkey"
            columns: ["geloest_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_konflikte_import_lauf_id_fkey"
            columns: ["import_lauf_id"]
            referencedRelation: "baum_import_lauf"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_konflikte_import_zeile_id_fkey"
            columns: ["import_zeile_id"]
            referencedRelation: "baum_import_zeilen"
            referencedColumns: ["id"]
          },
        ]
      }
      baum_import_lauf: {
        Row: {
          anzahl_aktualisiert: number
          anzahl_angelegt: number
          anzahl_archiviert: number
          anzahl_fehler: number
          anzahl_gematcht: number
          anzahl_gueltig: number
          anzahl_konflikte: number
          anzahl_neu: number
          anzahl_nicht_mehr_enthalten: number
          anzahl_uebersprungen: number
          anzahl_warnungen: number
          anzahl_zeilen: number
          dateiname: string
          dateityp: string
          erstellt_am: string
          erstellt_von: string | null
          id: string
          notizen: string | null
          rollback_verfuegbar: boolean
          status: string
          uebernommen_am: string | null
          uebernommen_von: string | null
          zurueckgesetzt_am: string | null
          zurueckgesetzt_von: string | null
        }
        Insert: {
          anzahl_aktualisiert?: number
          anzahl_angelegt?: number
          anzahl_archiviert?: number
          anzahl_fehler?: number
          anzahl_gematcht?: number
          anzahl_gueltig?: number
          anzahl_konflikte?: number
          anzahl_neu?: number
          anzahl_nicht_mehr_enthalten?: number
          anzahl_uebersprungen?: number
          anzahl_warnungen?: number
          anzahl_zeilen?: number
          dateiname: string
          dateityp: string
          erstellt_am?: string
          erstellt_von?: string | null
          id?: string
          notizen?: string | null
          rollback_verfuegbar?: boolean
          status?: string
          uebernommen_am?: string | null
          uebernommen_von?: string | null
          zurueckgesetzt_am?: string | null
          zurueckgesetzt_von?: string | null
        }
        Update: {
          anzahl_aktualisiert?: number
          anzahl_angelegt?: number
          anzahl_archiviert?: number
          anzahl_fehler?: number
          anzahl_gematcht?: number
          anzahl_gueltig?: number
          anzahl_konflikte?: number
          anzahl_neu?: number
          anzahl_nicht_mehr_enthalten?: number
          anzahl_uebersprungen?: number
          anzahl_warnungen?: number
          anzahl_zeilen?: number
          dateiname?: string
          dateityp?: string
          erstellt_am?: string
          erstellt_von?: string | null
          id?: string
          notizen?: string | null
          rollback_verfuegbar?: boolean
          status?: string
          uebernommen_am?: string | null
          uebernommen_von?: string | null
          zurueckgesetzt_am?: string | null
          zurueckgesetzt_von?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baum_import_lauf_erstellt_von_fkey"
            columns: ["erstellt_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_lauf_uebernommen_von_fkey"
            columns: ["uebernommen_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_lauf_zurueckgesetzt_von_fkey"
            columns: ["zurueckgesetzt_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      baum_import_zeilen: {
        Row: {
          angewendete_aktion: string | null
          baum: string | null
          bewaesserungsbereich_kategorie: string | null
          bewaesserungsbereich_name: string | null
          bezirk: string | null
          durchfuehrung_von: string | null
          erstellt_am: string
          gattung_art: string | null
          gematchte_baum_id: string | null
          gematchte_bewaesserungsbereich_id: string | null
          hochwert: number | null
          id: string
          import_lauf_id: string
          ist_leerzeile: boolean
          ist_verarbeitet: boolean
          match_status: string
          moegliche_match_ids: Json | null
          objekt: string | null
          objektart: string | null
          pflanzjahr: number | null
          pflegebereich: number | null
          rechtswert: number | null
          roh_baum: string | null
          roh_bewaesserungsbereich: string | null
          roh_bewaesserungsbereich_kategorie: string | null
          roh_bezirk: string | null
          roh_durchfuehrung_von: string | null
          roh_gattung_art: string | null
          roh_hochwert: string | null
          roh_objekt: string | null
          roh_objektart: string | null
          roh_pflanzjahr: string | null
          roh_pflegebereich: string | null
          roh_rechtswert: string | null
          roh_stadtteil: string | null
          stadtteil: string | null
          validierungsfehler: Json | null
          validierungsstatus: string
          validierungswarnungen: Json | null
          zeilennummer: number
        }
        Insert: {
          angewendete_aktion?: string | null
          baum?: string | null
          bewaesserungsbereich_kategorie?: string | null
          bewaesserungsbereich_name?: string | null
          bezirk?: string | null
          durchfuehrung_von?: string | null
          erstellt_am?: string
          gattung_art?: string | null
          gematchte_baum_id?: string | null
          gematchte_bewaesserungsbereich_id?: string | null
          hochwert?: number | null
          id?: string
          import_lauf_id: string
          ist_leerzeile?: boolean
          ist_verarbeitet?: boolean
          match_status?: string
          moegliche_match_ids?: Json | null
          objekt?: string | null
          objektart?: string | null
          pflanzjahr?: number | null
          pflegebereich?: number | null
          rechtswert?: number | null
          roh_baum?: string | null
          roh_bewaesserungsbereich?: string | null
          roh_bewaesserungsbereich_kategorie?: string | null
          roh_bezirk?: string | null
          roh_durchfuehrung_von?: string | null
          roh_gattung_art?: string | null
          roh_hochwert?: string | null
          roh_objekt?: string | null
          roh_objektart?: string | null
          roh_pflanzjahr?: string | null
          roh_pflegebereich?: string | null
          roh_rechtswert?: string | null
          roh_stadtteil?: string | null
          stadtteil?: string | null
          validierungsfehler?: Json | null
          validierungsstatus?: string
          validierungswarnungen?: Json | null
          zeilennummer: number
        }
        Update: {
          angewendete_aktion?: string | null
          baum?: string | null
          bewaesserungsbereich_kategorie?: string | null
          bewaesserungsbereich_name?: string | null
          bezirk?: string | null
          durchfuehrung_von?: string | null
          erstellt_am?: string
          gattung_art?: string | null
          gematchte_baum_id?: string | null
          gematchte_bewaesserungsbereich_id?: string | null
          hochwert?: number | null
          id?: string
          import_lauf_id?: string
          ist_leerzeile?: boolean
          ist_verarbeitet?: boolean
          match_status?: string
          moegliche_match_ids?: Json | null
          objekt?: string | null
          objektart?: string | null
          pflanzjahr?: number | null
          pflegebereich?: number | null
          rechtswert?: number | null
          roh_baum?: string | null
          roh_bewaesserungsbereich?: string | null
          roh_bewaesserungsbereich_kategorie?: string | null
          roh_bezirk?: string | null
          roh_durchfuehrung_von?: string | null
          roh_gattung_art?: string | null
          roh_hochwert?: string | null
          roh_objekt?: string | null
          roh_objektart?: string | null
          roh_pflanzjahr?: string | null
          roh_pflegebereich?: string | null
          roh_rechtswert?: string | null
          roh_stadtteil?: string | null
          stadtteil?: string | null
          validierungsfehler?: Json | null
          validierungsstatus?: string
          validierungswarnungen?: Json | null
          zeilennummer?: number
        }
        Relationships: [
          {
            foreignKeyName: "baum_import_zeilen_gematchte_baum_id_fkey"
            columns: ["gematchte_baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_zeilen_gematchte_bewaesserungsbereich_id_fkey"
            columns: ["gematchte_bewaesserungsbereich_id"]
            referencedRelation: "bewaesserungsbereich"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_import_zeilen_import_lauf_id_fkey"
            columns: ["import_lauf_id"]
            referencedRelation: "baum_import_lauf"
            referencedColumns: ["id"]
          },
        ]
      }
      baum_notiz: {
        Row: {
          baum_id: string
          bewaesserungsgang_id: string | null
          erstellt_am: string | null
          id: string
          notiz: string | null
          user_id: string
        }
        Insert: {
          baum_id: string
          bewaesserungsgang_id?: string | null
          erstellt_am?: string | null
          id?: string
          notiz?: string | null
          user_id: string
        }
        Update: {
          baum_id?: string
          bewaesserungsgang_id?: string | null
          erstellt_am?: string | null
          id?: string
          notiz?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baum_notiz_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_notiz_bewaesserungsgang_id_fkey"
            columns: ["bewaesserungsgang_id"]
            referencedRelation: "bewaesserungsgang"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baum_notiz_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bewaesserungsbereich: {
        Row: {
          bereich: string | null
          beschreibung: string | null
          id: string
          ist_aktiv: boolean
          name: string | null
        }
        Insert: {
          bereich?: string | null
          beschreibung?: string | null
          id?: string
          ist_aktiv?: boolean
          name?: string | null
        }
        Update: {
          bereich?: string | null
          beschreibung?: string | null
          id?: string
          ist_aktiv?: boolean
          name?: string | null
        }
        Relationships: []
      }
      bewaesserungsgang: {
        Row: {
          abgeschlossen_am: string | null
          anfrage_ausstehend: boolean | null
          archiviert: boolean | null
          bewaesserungsbereich_id: string
          end_baum: string | null
          end_lat: number | null
          end_lon: number | null
          erneut_geoeffnet_am: string | null
          erstellt_am: string | null
          erstellt_von: string | null
          geplant_von: string | null
          geplant_bis: string | null
          id: string
          notiz: string | null
          start_baum: string | null
          start_lat: number | null
          start_lon: number | null
        }
        Insert: {
          abgeschlossen_am?: string | null
          anfrage_ausstehend?: boolean | null
          archiviert?: boolean | null
          bewaesserungsbereich_id: string
          end_baum?: string | null
          end_lat?: number | null
          end_lon?: number | null
          erneut_geoeffnet_am?: string | null
          erstellt_am?: string | null
          erstellt_von?: string | null
          geplant_von?: string | null
          geplant_bis?: string | null
          id?: string
          notiz?: string | null
          start_baum?: string | null
          start_lat?: number | null
          start_lon?: number | null
        }
        Update: {
          abgeschlossen_am?: string | null
          anfrage_ausstehend?: boolean | null
          archiviert?: boolean | null
          bewaesserungsbereich_id?: string
          end_baum?: string | null
          end_lat?: number | null
          end_lon?: number | null
          erneut_geoeffnet_am?: string | null
          erstellt_am?: string | null
          erstellt_von?: string | null
          geplant_von?: string | null
          geplant_bis?: string | null
          id?: string
          notiz?: string | null
          start_baum?: string | null
          start_lat?: number | null
          start_lon?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bewaesserungsgang_bewaesserungsbereich_id_fkey"
            columns: ["bewaesserungsbereich_id"]
            referencedRelation: "bewaesserungsbereich"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bewaesserungsgang_end_baum_fkey"
            columns: ["end_baum"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bewaesserungsgang_erstellt_von_fkey"
            columns: ["erstellt_von"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bewaesserungsgang_start_baum_fkey"
            columns: ["start_baum"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
        ]
      }
      bewaesserungsgang_baum: {
        Row: {
          baum_ereignis: string | null
          baum_id: string
          bewaesserungsgang_id: string
          status: string | null
          watered_at: string | null
        }
        Insert: {
          baum_ereignis?: string | null
          baum_id: string
          bewaesserungsgang_id: string
          status?: string | null
          watered_at?: string | null
        }
        Update: {
          baum_ereignis?: string | null
          baum_id?: string
          bewaesserungsgang_id?: string
          status?: string | null
          watered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bewaesserungsgang_baum_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bewaesserungsgang_baum_bewaesserungsgang_id_fkey"
            columns: ["bewaesserungsgang_id"]
            referencedRelation: "bewaesserungsgang"
            referencedColumns: ["id"]
          },
        ]
      }
      bewaesserungsgang_bearbeitet_durch: {
        Row: {
          bewaesserungsgang_id: string
          user_id: string
        }
        Insert: {
          bewaesserungsgang_id: string
          user_id: string
        }
        Update: {
          bewaesserungsgang_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bewaesserungsgang_bearbeitet_durch_bewaesserungsgang_id_fkey"
            columns: ["bewaesserungsgang_id"]
            referencedRelation: "bewaesserungsgang"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bewaesserungsgang_bearbeitet_durch_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bewaesserungsgang_palmengarten: {
        Row: {
          id: string
          objekt: string | null
          user_id: string
          water_amount: number | null
          watered_at: string | null
        }
        Insert: {
          id?: string
          objekt?: string | null
          user_id: string
          water_amount?: number | null
          watered_at?: string | null
        }
        Update: {
          id?: string
          objekt?: string | null
          user_id?: string
          water_amount?: number | null
          watered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bewaesserungsgang_palmengarten_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bewaesserungsstrategien_gfa: {
        Row: {
          bewaesserung_liter: number | null
          schwellenwert_gelb: number | null
          schwellenwert_orange: number | null
          schwellenwert_rot: number | null
          standalter: number
          strategie_30cm_max: number | null
          strategie_60cm_max: number | null
          strategie_90cm_max: number | null
        }
        Insert: {
          bewaesserung_liter?: number | null
          schwellenwert_gelb?: number | null
          schwellenwert_orange?: number | null
          schwellenwert_rot?: number | null
          standalter: number
          strategie_30cm_max?: number | null
          strategie_60cm_max?: number | null
          strategie_90cm_max?: number | null
        }
        Update: {
          bewaesserung_liter?: number | null
          schwellenwert_gelb?: number | null
          schwellenwert_orange?: number | null
          schwellenwert_rot?: number | null
          standalter?: number
          strategie_30cm_max?: number | null
          strategie_60cm_max?: number | null
          strategie_90cm_max?: number | null
        }
        Relationships: []
      }
      bewaesserungsstrategien_pg: {
        Row: {
          bewaesserung_liter: number | null
          objekt: string
          schwellenwert_gelb: number | null
          schwellenwert_orange: number | null
          schwellenwert_rot: number | null
          strategie_30cm_max: number | null
          strategie_60cm_max: number | null
          strategie_90cm_max: number | null
        }
        Insert: {
          bewaesserung_liter?: number | null
          objekt: string
          schwellenwert_gelb?: number | null
          schwellenwert_orange?: number | null
          schwellenwert_rot?: number | null
          strategie_30cm_max?: number | null
          strategie_60cm_max?: number | null
          strategie_90cm_max?: number | null
        }
        Update: {
          bewaesserung_liter?: number | null
          objekt?: string
          schwellenwert_gelb?: number | null
          schwellenwert_orange?: number | null
          schwellenwert_rot?: number | null
          strategie_30cm_max?: number | null
          strategie_60cm_max?: number | null
          strategie_90cm_max?: number | null
        }
        Relationships: []
      }
      mqtt_raw: {
        Row: {
          device_id: string
          id: string
          measured_at: string | null
          payload: Json
          received_at: string
          sensor_type: string | null
          topic: string | null
        }
        Insert: {
          device_id: string
          id: string
          measured_at?: string | null
          payload: Json
          received_at?: string
          sensor_type?: string | null
          topic?: string | null
        }
        Update: {
          device_id?: string
          id?: string
          measured_at?: string | null
          payload?: Json
          received_at?: string
          sensor_type?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      regen_forecast: {
        Row: {
          beschreibung: string | null
          bezirk: string | null
          erstellt_am: string | null
          id: string
          latitude: number | null
          longitude: number | null
          niederschlag_mm: number | null
          regenwahrscheinlichkeit: number | null
          sonnenstunden: number | null
          temperatur: number | null
          temperatur_max: number | null
          temperatur_min: number | null
          vorhersage_typ: string | null
          vorhersage_zeitpunkt: string | null
        }
        Insert: {
          beschreibung?: string | null
          bezirk?: string | null
          erstellt_am?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          niederschlag_mm?: number | null
          regenwahrscheinlichkeit?: number | null
          sonnenstunden?: number | null
          temperatur?: number | null
          temperatur_max?: number | null
          temperatur_min?: number | null
          vorhersage_typ?: string | null
          vorhersage_zeitpunkt?: string | null
        }
        Update: {
          beschreibung?: string | null
          bezirk?: string | null
          erstellt_am?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          niederschlag_mm?: number | null
          regenwahrscheinlichkeit?: number | null
          sonnenstunden?: number | null
          temperatur?: number | null
          temperatur_max?: number | null
          temperatur_min?: number | null
          vorhersage_typ?: string | null
          vorhersage_zeitpunkt?: string | null
        }
        Relationships: []
      }
      rollen: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      sensordaten_distanz: {
        Row: {
          adc: number | null
          batterie_prozent: number | null
          device_id: string | null
          distanz_mm: number | null
          geraet_zeitstempel: string | null
          id: string
          measured_at: string | null
          raw: Json | null
          received_at: string
          rssi: number | null
          sid: string | null
        }
        Insert: {
          adc?: number | null
          batterie_prozent?: number | null
          device_id?: string | null
          distanz_mm?: number | null
          geraet_zeitstempel?: string | null
          id: string
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          rssi?: number | null
          sid?: string | null
        }
        Update: {
          adc?: number | null
          batterie_prozent?: number | null
          device_id?: string | null
          distanz_mm?: number | null
          geraet_zeitstempel?: string | null
          id?: string
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          rssi?: number | null
          sid?: string | null
        }
        Relationships: []
      }
      sensordaten_druckpegel: {
        Row: {
          device_id: string | null
          differenzdruck: number | null
          druck_p1: number | null
          id: string
          luftdruck: number | null
          measured_at: string | null
          raw: Json | null
          received_at: string
          rssi: number | null
          sid: string | null
          temperatur_barometer: number | null
          temperatur_sensor: number | null
        }
        Insert: {
          device_id?: string | null
          differenzdruck?: number | null
          druck_p1?: number | null
          id: string
          luftdruck?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          rssi?: number | null
          sid?: string | null
          temperatur_barometer?: number | null
          temperatur_sensor?: number | null
        }
        Update: {
          device_id?: string | null
          differenzdruck?: number | null
          druck_p1?: number | null
          id?: string
          luftdruck?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          rssi?: number | null
          sid?: string | null
          temperatur_barometer?: number | null
          temperatur_sensor?: number | null
        }
        Relationships: []
      }
      sensordaten_fuellstand: {
        Row: {
          abstand_cm: number | null
          batteriespannung: number | null
          device_id: string | null
          fuellstand_prozent: number | null
          id: string
          liter_zu_fuellen: number | null
          measured_at: string | null
          raw: Json | null
          received_at: string
          restliter: number | null
          rssi: number | null
          sid: string | null
          temperatur: number | null
        }
        Insert: {
          abstand_cm?: number | null
          batteriespannung?: number | null
          device_id?: string | null
          fuellstand_prozent?: number | null
          id: string
          liter_zu_fuellen?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          restliter?: number | null
          rssi?: number | null
          sid?: string | null
          temperatur?: number | null
        }
        Update: {
          abstand_cm?: number | null
          batteriespannung?: number | null
          device_id?: string | null
          fuellstand_prozent?: number | null
          id?: string
          liter_zu_fuellen?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          restliter?: number | null
          rssi?: number | null
          sid?: string | null
          temperatur?: number | null
        }
        Relationships: []
      }
      sensordaten_niederschlag: {
        Row: {
          batteriespannung: number | null
          device_id: string | null
          heizung_aktiv: boolean | null
          id: string
          index_zaehler: number | null
          measured_at: string | null
          raw: Json | null
          received_at: string
          regenintensitaet: number | null
          regenklicks: number | null
          rssi: number | null
          sid: string | null
        }
        Insert: {
          batteriespannung?: number | null
          device_id?: string | null
          heizung_aktiv?: boolean | null
          id: string
          index_zaehler?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          regenintensitaet?: number | null
          regenklicks?: number | null
          rssi?: number | null
          sid?: string | null
        }
        Update: {
          batteriespannung?: number | null
          device_id?: string | null
          heizung_aktiv?: boolean | null
          id?: string
          index_zaehler?: number | null
          measured_at?: string | null
          raw?: Json | null
          received_at?: string
          regenintensitaet?: number | null
          regenklicks?: number | null
          rssi?: number | null
          sid?: string | null
        }
        Relationships: []
      }
      sensordaten_soilmoisture: {
        Row: {
          _headers_eventtype: string | null
          base64: string | null
          battery: number | null
          device_id: string | null
          device_type: string | null
          downlink_request: string | null
          fw_rev: number | null
          hw_rev: number | null
          id: string
          kpa_ch1: number | null
          kpa_ch2: number | null
          kpa_ch3: number | null
          kpa_ch4: number | null
          location: string | null
          measured_at: string | null
          message_type: number | null
          meta: string | null
          p1_1: number | null
          packet_id: string | null
          parser_id: string | null
          pbaro: number | null
          pd_p1_pbaro: number | null
          r1: number | null
          r2: number | null
          r3: number | null
          r4: number | null
          rawtimestamp: string | null
          resistance_ch1: number | null
          resistance_ch2: number | null
          resistance_ch3: number | null
          resistance_ch4: number | null
          resistance_ch5: number | null
          resistance_ch6: number | null
          sid: string | null
          tbaro: number | null
          timestamp: string | null
          tob1_1: number | null
          type: string | null
          voltage: number | null
        }
        Insert: {
          _headers_eventtype?: string | null
          base64?: string | null
          battery?: number | null
          device_id?: string | null
          device_type?: string | null
          downlink_request?: string | null
          fw_rev?: number | null
          hw_rev?: number | null
          id: string
          kpa_ch1?: number | null
          kpa_ch2?: number | null
          kpa_ch3?: number | null
          kpa_ch4?: number | null
          location?: string | null
          measured_at?: string | null
          message_type?: number | null
          meta?: string | null
          p1_1?: number | null
          packet_id?: string | null
          parser_id?: string | null
          pbaro?: number | null
          pd_p1_pbaro?: number | null
          r1?: number | null
          r2?: number | null
          r3?: number | null
          r4?: number | null
          rawtimestamp?: string | null
          resistance_ch1?: number | null
          resistance_ch2?: number | null
          resistance_ch3?: number | null
          resistance_ch4?: number | null
          resistance_ch5?: number | null
          resistance_ch6?: number | null
          sid?: string | null
          tbaro?: number | null
          timestamp?: string | null
          tob1_1?: number | null
          type?: string | null
          voltage?: number | null
        }
        Update: {
          _headers_eventtype?: string | null
          base64?: string | null
          battery?: number | null
          device_id?: string | null
          device_type?: string | null
          downlink_request?: string | null
          fw_rev?: number | null
          hw_rev?: number | null
          id?: string
          kpa_ch1?: number | null
          kpa_ch2?: number | null
          kpa_ch3?: number | null
          kpa_ch4?: number | null
          location?: string | null
          measured_at?: string | null
          message_type?: number | null
          meta?: string | null
          p1_1?: number | null
          packet_id?: string | null
          parser_id?: string | null
          pbaro?: number | null
          pd_p1_pbaro?: number | null
          r1?: number | null
          r2?: number | null
          r3?: number | null
          r4?: number | null
          rawtimestamp?: string | null
          resistance_ch1?: number | null
          resistance_ch2?: number | null
          resistance_ch3?: number | null
          resistance_ch4?: number | null
          resistance_ch5?: number | null
          resistance_ch6?: number | null
          sid?: string | null
          tbaro?: number | null
          timestamp?: string | null
          tob1_1?: number | null
          type?: string | null
          voltage?: number | null
        }
        Relationships: []
      }
      sensordaten_wasserzaehler: {
        Row: {
          actualityduration: number | null
          back_flow: boolean | null
          batteriestandkritisch: boolean | null
          broken_pipe: boolean | null
          continuous_flow: boolean | null
          device_id: string | null
          id: string
          link_error: boolean | null
          low_battery: boolean | null
          measured_at: string | null
          meter_id: string | null
          raw: Json | null
          received_at: string
          register_value: number | null
          rssi: number | null
          sid: string | null
          zaehlerstandwasser: number | null
        }
        Insert: {
          actualityduration?: number | null
          back_flow?: boolean | null
          batteriestandkritisch?: boolean | null
          broken_pipe?: boolean | null
          continuous_flow?: boolean | null
          device_id?: string | null
          id: string
          link_error?: boolean | null
          low_battery?: boolean | null
          measured_at?: string | null
          meter_id?: string | null
          raw?: Json | null
          received_at?: string
          register_value?: number | null
          rssi?: number | null
          sid?: string | null
          zaehlerstandwasser?: number | null
        }
        Update: {
          actualityduration?: number | null
          back_flow?: boolean | null
          batteriestandkritisch?: boolean | null
          broken_pipe?: boolean | null
          continuous_flow?: boolean | null
          device_id?: string | null
          id?: string
          link_error?: boolean | null
          low_battery?: boolean | null
          measured_at?: string | null
          meter_id?: string | null
          raw?: Json | null
          received_at?: string
          register_value?: number | null
          rssi?: number | null
          sid?: string | null
          zaehlerstandwasser?: number | null
        }
        Relationships: []
      }
      sensors: {
        Row: {
          active: boolean
          baum_id: string | null
          created_at: string | null
          device_id: string | null
          eui: string | null
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          latitude: number | null
          longitude: number | null
          mandate_id: string | null
          match_status: string | null
          matched_at: string | null
          matched_baum: string | null
          matched_by: string | null
          matched_objekt: string | null
          name: string | null
          notes: string | null
          parser_id: string | null
          slug: string | null
          source: string
          source_eventtype: string | null
          static_location: boolean | null
          urbanpulse_sid: string | null
        }
        Insert: {
          active?: boolean
          baum_id?: string | null
          created_at?: string | null
          device_id?: string | null
          eui?: string | null
          first_seen_at?: string | null
          id: string
          last_seen_at?: string | null
          latitude?: number | null
          longitude?: number | null
          mandate_id?: string | null
          match_status?: string | null
          matched_at?: string | null
          matched_baum?: string | null
          matched_by?: string | null
          matched_objekt?: string | null
          name?: string | null
          notes?: string | null
          parser_id?: string | null
          slug?: string | null
          source?: string
          source_eventtype?: string | null
          static_location?: boolean | null
          urbanpulse_sid?: string | null
        }
        Update: {
          active?: boolean
          baum_id?: string | null
          created_at?: string | null
          device_id?: string | null
          eui?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          latitude?: number | null
          longitude?: number | null
          mandate_id?: string | null
          match_status?: string | null
          matched_at?: string | null
          matched_baum?: string | null
          matched_by?: string | null
          matched_objekt?: string | null
          name?: string | null
          notes?: string | null
          parser_id?: string | null
          slug?: string | null
          source?: string
          source_eventtype?: string | null
          static_location?: boolean | null
          urbanpulse_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensors_matched_by_fkey"
            columns: ["matched_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nachname: string | null
          organisation: string | null
          rollen_id: string
          vorname: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nachname?: string | null
          organisation?: string | null
          rollen_id: string
          vorname?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nachname?: string | null
          organisation?: string | null
          rollen_id?: string
          vorname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_rollen_id_fkey"
            columns: ["rollen_id"]
            referencedRelation: "rollen"
            referencedColumns: ["id"]
          },
        ]
      }
      wasserentnahmestellen: {
        Row: {
          eigentum: string | null
          erstellt_am: string
          id: string
          lat: number | null
          lon: number | null
          nennweite_mm: number | null
          nummer: string | null
          ort: string | null
          priorisiert: boolean
          status: string | null
          strasse: string | null
        }
        Insert: {
          eigentum?: string | null
          erstellt_am?: string
          id?: string
          lat?: number | null
          lon?: number | null
          nennweite_mm?: number | null
          nummer?: string | null
          ort?: string | null
          priorisiert?: boolean
          status?: string | null
          strasse?: string | null
        }
        Update: {
          eigentum?: string | null
          erstellt_am?: string
          id?: string
          lat?: number | null
          lon?: number | null
          nennweite_mm?: number | null
          nummer?: string | null
          ort?: string | null
          priorisiert?: boolean
          status?: string | null
          strasse?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_palmgarden_soilmoisture_latest_with_strategies: {
        Row: {
          baum_nr: string | null
          kpa_ch1: number | null
          kpa_ch2: number | null
          kpa_ch3: number | null
          measured_at: string | null
          objekt: string | null
          strategie_30cm_max: number | null
          strategie_60cm_max: number | null
          strategie_90cm_max: number | null
        }
        Relationships: []
      }
      v_soilmoisture_latest_earliest_per_sensor: {
        Row: {
          _headers_eventtype: string | null
          active: boolean | null
          base64: string | null
          battery: number | null
          baum_id: string | null
          baum_nr: string | null
          bewaesserungsbereich_bereich: string | null
          bewaesserungsbereich_name: string | null
          bewaesserungsgrund: string | null
          bezirk: string | null
          created_at: string | null
          device_id: string | null
          device_type: string | null
          downlink_request: string | null
          entwicklungsphase: string | null
          fw_rev: number | null
          gattung_art: string | null
          hochwert: number | null
          hw_rev: number | null
          id: string | null
          kpa_ch1: number | null
          kpa_ch1_earliest: number | null
          kpa_ch2: number | null
          kpa_ch2_earliest: number | null
          kpa_ch3: number | null
          kpa_ch3_earliest: number | null
          kpa_ch4: number | null
          kpa_ch4_earliest: number | null
          last_watering_at: string | null
          location: string | null
          measured_at: string | null
          measured_at_earliest: string | null
          message_type: number | null
          meta: string | null
          objekt: string | null
          p1_1: number | null
          packet_id: string | null
          parser_id: string | null
          pbaro: number | null
          pd_p1_pbaro: number | null
          pflegebereich: number | null
          r1: number | null
          r2: number | null
          r3: number | null
          r4: number | null
          rawtimestamp: string | null
          rechtswert: number | null
          resistance_ch1: number | null
          resistance_ch2: number | null
          resistance_ch3: number | null
          resistance_ch4: number | null
          resistance_ch5: number | null
          resistance_ch6: number | null
          sensor_id: string | null
          sensor_name: string | null
          sid: string | null
          stadtteil: string | null
          standalter: number | null
          tbaro: number | null
          timestamp: string | null
          tob1_1: number | null
          type: string | null
          voltage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
        ]
      }
      v_soilmoisture_latest_per_sensor: {
        Row: {
          _headers_eventtype: string | null
          active: boolean | null
          base64: string | null
          battery: number | null
          baum_id: string | null
          baum_nr: string | null
          bewaesserungsbereich_bereich: string | null
          bewaesserungsbereich_name: string | null
          bewaesserungsgrund: string | null
          bezirk: string | null
          created_at: string | null
          device_id: string | null
          device_type: string | null
          downlink_request: string | null
          entwicklungsphase: string | null
          fw_rev: number | null
          gattung_art: string | null
          hochwert: number | null
          hw_rev: number | null
          id: string | null
          kpa_ch1: number | null
          kpa_ch2: number | null
          kpa_ch3: number | null
          kpa_ch4: number | null
          location: string | null
          measured_at: string | null
          message_type: number | null
          meta: string | null
          objekt: string | null
          p1_1: number | null
          packet_id: string | null
          parser_id: string | null
          pbaro: number | null
          pd_p1_pbaro: number | null
          pflegebereich: number | null
          r1: number | null
          r2: number | null
          r3: number | null
          r4: number | null
          rawtimestamp: string | null
          rechtswert: number | null
          resistance_ch1: number | null
          resistance_ch2: number | null
          resistance_ch3: number | null
          resistance_ch4: number | null
          resistance_ch5: number | null
          resistance_ch6: number | null
          sensor_id: string | null
          sensor_name: string | null
          sid: string | null
          stadtteil: string | null
          standalter: number | null
          tbaro: number | null
          timestamp: string | null
          tob1_1: number | null
          type: string | null
          voltage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
        ]
      }
      v_soilmoisture_with_mapping: {
        Row: {
          _headers_eventtype: string | null
          base64: string | null
          battery: number | null
          baum_id: string | null
          baum_nr: string | null
          bewaesserungsbereich_bereich: string | null
          bewaesserungsbereich_name: string | null
          bewaesserungsgrund: string | null
          bezirk: string | null
          created_at: string | null
          device_id: string | null
          device_type: string | null
          downlink_request: string | null
          entwicklungsphase: string | null
          fw_rev: number | null
          gattung_art: string | null
          hochwert: number | null
          hw_rev: number | null
          id: string | null
          kpa_ch1: number | null
          kpa_ch2: number | null
          kpa_ch3: number | null
          kpa_ch4: number | null
          location: string | null
          measured_at: string | null
          message_type: number | null
          meta: string | null
          objekt: string | null
          p1_1: number | null
          packet_id: string | null
          parser_id: string | null
          pbaro: number | null
          pd_p1_pbaro: number | null
          pflegebereich: number | null
          r1: number | null
          r2: number | null
          r3: number | null
          r4: number | null
          rawtimestamp: string | null
          rechtswert: number | null
          resistance_ch1: number | null
          resistance_ch2: number | null
          resistance_ch3: number | null
          resistance_ch4: number | null
          resistance_ch5: number | null
          resistance_ch6: number | null
          sensor_id: string | null
          sensor_name: string | null
          sid: string | null
          stadtteil: string | null
          standalter: number | null
          tbaro: number | null
          timestamp: string | null
          tob1_1: number | null
          type: string | null
          voltage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_baum_id_fkey"
            columns: ["baum_id"]
            referencedRelation: "baeume"
            referencedColumns: ["id"]
          },
        ]
      }
      v_wateringrounds_report: {
        Row: {
          area_name: string | null
          finished_at: string | null
          planed_at: string | null
          progress_percent: number | null
          watered_by: string | null
          watering_area: string | null
        }
        Relationships: []
      }
      v_yearly_report_1: {
        Row: {
          anzahl_bewaesserungsgaenge: number | null
          bereich: string | null
          liter_summe: number | null
          monat: string | null
        }
        Relationships: []
      }
      v_yearly_report_2: {
        Row: {
          bewaesserungsbereich_bereich: string | null
          kpa_ch1: number | null
          kpa_ch2: number | null
          kpa_ch3: number | null
          measured_at: string | null
          strategie_30cm_max: number | null
          strategie_60cm_max: number | null
          strategie_90cm_max: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: undefined
      }
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      delete_prefix: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: boolean
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_level: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_prefix: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_prefixes: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  timescaledb: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
