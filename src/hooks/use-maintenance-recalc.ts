"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVehicleScheduledMaintenanceOperations } from './use-supabase';
import { 
  calculateMaintenanceRecalc, 
  generateRecalcSuggestions,
  type MaintenanceRecalcOptions,
  type RecalcResult 
} from '@/lib/maintenance-recalc';
import { VehicleScheduledMaintenance } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export function useMaintenanceRecalc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { upsertScheduledMaintenances, updateSpecificScheduledMaintenance } = useVehicleScheduledMaintenanceOperations();

  /**
   * Recalcula manutenções programadas após uma manutenção ser realizada
   */
  const recalculateMaintenances = useCallback(async (
    vehicleId: string,
    currentKm: number,
    performedMaintenanceType?: string,
    options?: {
      recalcAll?: boolean;
      showSuggestions?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar manutenções programadas atuais usando o serviço do Supabase
      const { data: scheduledMaintenances, error: fetchError } = await supabase
        .from('vehicle_scheduled_maintenances')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('is_active', true);

      if (fetchError) {
        throw new Error('Erro ao buscar manutenções programadas: ' + fetchError.message);
      }

      if (!scheduledMaintenances || scheduledMaintenances.length === 0) {
        toast({
          title: "Informação",
          description: "Nenhuma manutenção programada ativa encontrada.",
          variant: "default"
        });
        return { updatedMaintenances: [], skippedMaintenances: [], newMaintenances: [] };
      }

      // Calcular recálculo
      const recalcOptions: MaintenanceRecalcOptions = {
        vehicleId,
        currentKm,
        performedMaintenanceTypes: performedMaintenanceType ? [performedMaintenanceType] : [],
        recalcAll: options?.recalcAll || false
      };

      const result = calculateMaintenanceRecalc(scheduledMaintenances, recalcOptions);

      // Se não há manutenções para recalcular
      if (result.updatedMaintenances.length === 0) {
        toast({
          title: "Informação",
          description: "Nenhuma manutenção programada precisa ser recalculada.",
          variant: "default"
        });
        return result;
      }

      // Salvar manutenções recalculadas
      await upsertScheduledMaintenances(vehicleId, result.updatedMaintenances);

      // Mostrar sugestões se solicitado
      if (options?.showSuggestions && performedMaintenanceType) {
        const suggestions = generateRecalcSuggestions(
          scheduledMaintenances,
          performedMaintenanceType,
          currentKm
        );

        if (suggestions.related.length > 0) {
          toast({
            title: "Sugestão",
            description: `Você também pode recalcular: ${suggestions.related.map(m => m.maintenance_name).join(', ')}`,
            variant: "default"
          });
        }
      }

      toast({
        title: "Sucesso",
        description: `${result.updatedMaintenances.length} manutenção(ões) recalculada(s) com sucesso!`,
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recalcular manutenções';
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [upsertScheduledMaintenances, toast]);

  /**
   * Recalcula uma manutenção específica
   */
  const recalculateSpecificMaintenance = useCallback(async (
    vehicleId: string,
    maintenanceType: string,
    currentKm: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar a manutenção específica
      const { data: scheduledMaintenances, error: fetchError } = await supabase
        .from('vehicle_scheduled_maintenances')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('maintenance_type', maintenanceType)
        .eq('is_active', true);

      if (fetchError) {
        throw new Error('Erro ao buscar manutenção programada: ' + fetchError.message);
      }

      if (!scheduledMaintenances || scheduledMaintenances.length === 0) {
        toast({
          title: "Informação",
          description: "Manutenção programada não encontrada.",
          variant: "default"
        });
        return;
      }

      const maintenance = scheduledMaintenances[0];
      
      // Calcular nova quilometragem: KM atual + intervalo
      const newNextKm = currentKm + maintenance.interval_km;

      // Atualizar apenas esta manutenção específica
      await updateSpecificScheduledMaintenance(vehicleId, maintenanceType, {
        next_maintenance_km: newNextKm,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Sucesso",
        description: `${maintenance.maintenance_name} recalculada para ${newNextKm.toLocaleString('pt-BR')} km!`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recalcular manutenção específica';
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateSpecificScheduledMaintenance, toast]);

  /**
   * Recalcula todas as manutenções programadas
   */
  const recalculateAllMaintenances = useCallback(async (
    vehicleId: string,
    currentKm: number
  ) => {
    return recalculateMaintenances(vehicleId, currentKm, undefined, {
      recalcAll: true,
      showSuggestions: false
    });
  }, [recalculateMaintenances]);

  /**
   * Mostra sugestões de recálculo baseadas na manutenção realizada
   */
  const showRecalcSuggestions = useCallback(async (
    vehicleId: string,
    performedMaintenanceType: string,
    currentKm: number
  ) => {
    try {
      const { data: scheduledMaintenances, error } = await supabase
        .from('vehicle_scheduled_maintenances')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao buscar manutenções programadas:', error);
        return null;
      }

      if (!scheduledMaintenances) return null;

      const suggestions = generateRecalcSuggestions(
        scheduledMaintenances,
        performedMaintenanceType,
        currentKm
      );

      return suggestions;
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      return null;
    }
  }, []);

  return {
    recalculateMaintenances,
    recalculateSpecificMaintenance,
    recalculateAllMaintenances,
    showRecalcSuggestions,
    loading,
    error
  };
}
