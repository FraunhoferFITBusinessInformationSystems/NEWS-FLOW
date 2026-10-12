
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "irrigation_areas": {
                  Row: {
                    "area_name": string | null,"id": string,"is_active": boolean
                  }
                  Insert: {
                    "area_name"?: string | null,"id"?: string,"is_active"?: boolean
                  }
                  Update: {
                    "area_name"?: string | null,"id"?: string,"is_active"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"irrigation_targets_by_age": {
                  Row: {
                    "irrigation_litres": number | null,"target_max_30cm": number | null,"target_max_60cm": number | null,"target_max_90cm": number | null,"tree_site_age": number
                  }
                  Insert: {
                    "irrigation_litres"?: number | null,"target_max_30cm"?: number | null,"target_max_60cm"?: number | null,"target_max_90cm"?: number | null,"tree_site_age": number
                  }
                  Update: {
                    "irrigation_litres"?: number | null,"target_max_30cm"?: number | null,"target_max_60cm"?: number | null,"target_max_90cm"?: number | null,"tree_site_age"?: number
                  }
                  Relationships: [
                    
                  ]
                },"roles": {
                  Row: {
                    "id": string,"role_name": string
                  }
                  Insert: {
                    "id"?: string,"role_name": string
                  }
                  Update: {
                    "id"?: string,"role_name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"sensor_data_soil_moisture": {
                  Row: {
                    "id": string,"kpa_ch1": number | null,"kpa_ch2": number | null,"kpa_ch3": number | null,"kpa_ch4": number | null,"measured_at": string,"resistance_ch1": number | null,"resistance_ch2": number | null,"resistance_ch3": number | null,"resistance_ch4": number | null,"sensor_id": string
                  }
                  Insert: {
                    "id"?: string,"kpa_ch1"?: number | null,"kpa_ch2"?: number | null,"kpa_ch3"?: number | null,"kpa_ch4"?: number | null,"measured_at": string,"resistance_ch1"?: number | null,"resistance_ch2"?: number | null,"resistance_ch3"?: number | null,"resistance_ch4"?: number | null,"sensor_id": string
                  }
                  Update: {
                    "id"?: string,"kpa_ch1"?: number | null,"kpa_ch2"?: number | null,"kpa_ch3"?: number | null,"kpa_ch4"?: number | null,"measured_at"?: string,"resistance_ch1"?: number | null,"resistance_ch2"?: number | null,"resistance_ch3"?: number | null,"resistance_ch4"?: number | null,"sensor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sensor_data_soil_moisture_sensor_id_fkey"
      columns: ["sensor_id"]
isOneToOne: false
      referencedRelation: "sensors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sensor_data_soil_moisture_sensor_id_fkey"
      columns: ["sensor_id"]
isOneToOne: false
      referencedRelation: "v_soil_moisture_latest_earliest_per_sensor"
      referencedColumns: ["sensor_id"]
    },{
      foreignKeyName: "sensor_data_soil_moisture_sensor_id_fkey"
      columns: ["sensor_id"]
isOneToOne: false
      referencedRelation: "v_soil_moisture_readings_mapped"
      referencedColumns: ["sensor_id"]
    }
                  ]
                },"sensors": {
                  Row: {
                    "created_at": string,"device_id": string | null,"first_seen_at": string | null,"id": string,"is_active": boolean,"latitude": number | null,"longitude": number | null,"match_status": string | null,"matched_at": string | null,"matched_by": string | null,"matched_site": string | null,"matched_tree_number": string | null,"name": string | null,"notes": string | null,"recently_seen_at": string | null,"sensor_type": string | null,"source": string | null,"tree_id": string | null
                  }
                  Insert: {
                    "created_at"?: string,"device_id"?: string | null,"first_seen_at"?: string | null,"id": string,"is_active"?: boolean,"latitude"?: number | null,"longitude"?: number | null,"match_status"?: string | null,"matched_at"?: string | null,"matched_by"?: string | null,"matched_site"?: string | null,"matched_tree_number"?: string | null,"name"?: string | null,"notes"?: string | null,"recently_seen_at"?: string | null,"sensor_type"?: string | null,"source"?: string | null,"tree_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"device_id"?: string | null,"first_seen_at"?: string | null,"id"?: string,"is_active"?: boolean,"latitude"?: number | null,"longitude"?: number | null,"match_status"?: string | null,"matched_at"?: string | null,"matched_by"?: string | null,"matched_site"?: string | null,"matched_tree_number"?: string | null,"name"?: string | null,"notes"?: string | null,"recently_seen_at"?: string | null,"sensor_type"?: string | null,"source"?: string | null,"tree_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "sensors_matched_by_fkey"
      columns: ["matched_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sensors_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sensors_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "v_soil_moisture_readings_mapped"
      referencedColumns: ["tree_id"]
    }
                  ]
                },"tree_notes": {
                  Row: {
                    "created_at": string,"id": string,"note": string,"tree_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"note": string,"tree_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"note"?: string,"tree_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tree_notes_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tree_notes_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "v_soil_moisture_readings_mapped"
      referencedColumns: ["tree_id"]
    },{
      foreignKeyName: "tree_notes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"trees": {
                  Row: {
                    "archive_reason": string | null,"archived_at": string | null,"archived_by": string | null,"created_at": string,"district": string | null,"easting": number | null,"id": string,"irrigation_area_id": string | null,"is_archived": boolean,"northing": number | null,"planting_year": number | null,"recently_edited_at": string | null,"recently_edited_by": string | null,"site": string | null,"tree_number": string | null,"type_species": string | null
                  }
                  Insert: {
                    "archive_reason"?: string | null,"archived_at"?: string | null,"archived_by"?: string | null,"created_at"?: string,"district"?: string | null,"easting"?: number | null,"id"?: string,"irrigation_area_id"?: string | null,"is_archived"?: boolean,"northing"?: number | null,"planting_year"?: number | null,"recently_edited_at"?: string | null,"recently_edited_by"?: string | null,"site"?: string | null,"tree_number"?: string | null,"type_species"?: string | null
                  }
                  Update: {
                    "archive_reason"?: string | null,"archived_at"?: string | null,"archived_by"?: string | null,"created_at"?: string,"district"?: string | null,"easting"?: number | null,"id"?: string,"irrigation_area_id"?: string | null,"is_archived"?: boolean,"northing"?: number | null,"planting_year"?: number | null,"recently_edited_at"?: string | null,"recently_edited_by"?: string | null,"site"?: string | null,"tree_number"?: string | null,"type_species"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "trees_archived_by_fkey"
      columns: ["archived_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "trees_irrigation_area_id_fkey"
      columns: ["irrigation_area_id"]
isOneToOne: false
      referencedRelation: "irrigation_areas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "trees_recently_edited_by_fkey"
      columns: ["recently_edited_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"users": {
                  Row: {
                    "created_at": string,"email": string,"first_name": string | null,"id": string,"last_name": string | null,"role_id": string
                  }
                  Insert: {
                    "created_at"?: string,"email": string,"first_name"?: string | null,"id": string,"last_name"?: string | null,"role_id": string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"first_name"?: string | null,"id"?: string,"last_name"?: string | null,"role_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "users_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "v_soil_moisture_latest_earliest_per_sensor": {
                  Row: {
                    "created_at": string | null,"district": string | null,"easting": number | null,"irrigation_area_name": string | null,"is_active": boolean | null,"is_archived": boolean | null,"kpa_ch1": number | null,"kpa_ch1_earliest": number | null,"kpa_ch2": number | null,"kpa_ch2_earliest": number | null,"kpa_ch3": number | null,"kpa_ch3_earliest": number | null,"kpa_ch4": number | null,"kpa_ch4_earliest": number | null,"measured_at": string | null,"measured_at_earliest": string | null,"northing": number | null,"planting_year": number | null,"recently_irrigated_at": string | null,"resistance_ch1": number | null,"resistance_ch2": number | null,"resistance_ch3": number | null,"resistance_ch4": number | null,"sensor_id": string | null,"sensor_name": string | null,"site": string | null,"tree_id": string | null,"tree_number": string | null,"tree_site_age": number | null,"type_species": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "sensors_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sensors_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "v_soil_moisture_readings_mapped"
      referencedColumns: ["tree_id"]
    }
                  ]
                },"v_soil_moisture_readings_mapped": {
                  Row: {
                    "created_at": string | null,"district": string | null,"easting": number | null,"irrigation_area_name": string | null,"is_archived": boolean | null,"kpa_ch1": number | null,"kpa_ch2": number | null,"kpa_ch3": number | null,"kpa_ch4": number | null,"measured_at": string | null,"northing": number | null,"planting_year": number | null,"resistance_ch1": number | null,"resistance_ch2": number | null,"resistance_ch3": number | null,"resistance_ch4": number | null,"sensor_id": string | null,"sensor_name": string | null,"site": string | null,"tree_id": string | null,"tree_number": string | null,"tree_site_age": number | null,"type_species": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "current_user_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"is_app_planner":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
