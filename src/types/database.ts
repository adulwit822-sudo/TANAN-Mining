export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      mining_sites: {
        Row: {
          id: string;
          name: string;
          location: string;
          province: string | null;
          latitude: number | null;
          longitude: number | null;
          ore_types: string[] | null;
          status: 'active' | 'inactive' | 'surveying';
          active_since: string | null;
          concession_no: string | null;
          area_rai: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mining_sites']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['mining_sites']['Insert']>;
      };
      production_records: {
        Row: {
          id: string;
          site_id: string | null;
          date: string;
          shift: 'morning' | 'afternoon' | 'night';
          ore_type: string;
          quantity_tons: number;
          quality_grade: string | null;
          waste_tons: number | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['production_records']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['production_records']['Insert']>;
      };
      equipment: {
        Row: {
          id: string;
          equipment_code: string;
          name: string;
          type: 'excavator' | 'bulldozer' | 'dump_truck' | 'drill' | 'crusher' | 'loader' | 'conveyor' | 'other';
          brand: string | null;
          model: string | null;
          year: number | null;
          site_id: string | null;
          status: 'active' | 'maintenance' | 'idle' | 'retired';
          hours_total: number | null;
          last_maintenance: string | null;
          next_maintenance: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>;
      };
      equipment_logs: {
        Row: {
          id: string;
          equipment_id: string;
          log_date: string;
          log_type: 'maintenance' | 'repair' | 'inspection' | 'fuel' | 'incident';
          description: string | null;
          technician: string | null;
          cost: number | null;
          hours_used: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['equipment_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['equipment_logs']['Insert']>;
      };
      employees: {
        Row: {
          id: string;
          employee_code: string;
          first_name: string;
          last_name: string;
          department: string;
          position: string;
          site_id: string | null;
          shift: string | null;
          status: 'active' | 'on_leave' | 'off_duty' | 'resigned';
          hire_date: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      kpi_targets: {
        Row: {
          id: string;
          year: number;
          month: number;
          site_id: string | null;
          ore_type: string | null;
          target_tons: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kpi_targets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['kpi_targets']['Insert']>;
      };
    };
  };
}

export type MiningSite      = Database['public']['Tables']['mining_sites']['Row'];
export type ProductionRecord = Database['public']['Tables']['production_records']['Row'];
export type Equipment       = Database['public']['Tables']['equipment']['Row'];
export type EquipmentLog    = Database['public']['Tables']['equipment_logs']['Row'];
export type Employee        = Database['public']['Tables']['employees']['Row'];
export type KpiTarget       = Database['public']['Tables']['kpi_targets']['Row'];
