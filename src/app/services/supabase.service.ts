// supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,

    );
  }
  
  async insertPlayer(player: any) {
    const { data, error } = await this.supabase
      .from('players')
      .insert([player])
      .select();

    if (error) throw error;
    return data;
  }

  async playerExists(playerId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('players')
      .select('id')
      .eq('id', playerId)
      .single();
  
    return !!data && !error;
  }
  
  async insertConditionAbilities(data: any) {
    const { error } = await this.supabase
      .from('condition_abilities')
      .insert(data);
    if (error) throw error;
  }
  
  async insertTacticalAbilities(data: any) {
    const { error } = await this.supabase
      .from('tactical_abilities')
      .insert(data);
    if (error) throw error;
  }
  
  async insertTechnicalAbilities(data: any) {
    const { error } = await this.supabase
      .from('technical_abilities')
      .insert(data);
    if (error) throw error;
  }
  
  async insertGoalkeepingAbilities(data: any) {
    const { error } = await this.supabase
      .from('goalkeeping_abilities')
      .insert(data);
    if (error) throw error;
  }

  
  // Update Data Methods
  async updateConditionAbilities(playerId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('condition_abilities')
      .update(updateData)
      .eq('player_id', playerId);
      
    if (error) throw error;
    return data;
  }

  async updateTacticalAbilities(playerId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('tactical_abilities')
      .update(updateData)
      .eq('player_id', playerId);
      
    if (error) throw error;
    return data;
  }
  
  async updateTechnicalAbilities(playerId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('technical_abilities')
      .update(updateData)
      .eq('player_id', playerId);
      
    if (error) throw error;
    return data;
  }
  
  async updateGoalkeepingAbilities(playerId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('goalkeeping_abilities')
      .update(updateData)
      .eq('player_id', playerId);
      
    if (error) throw error;
    return data;
  }
}