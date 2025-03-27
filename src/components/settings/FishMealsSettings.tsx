
import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fish, Plus, Clock, Trash2 } from "lucide-react";
import { MealTime } from "@/types/settingsTypes";
import { v4 as uuidv4 } from "uuid";

export const FishMealsSettings = () => {
  const { settings, updateSettings } = useSettings();
  
  // Gestionnaire pour activer/désactiver les repas
  const handleMealsToggle = (checked: boolean) => {
    updateSettings({
      fishMeals: {
        ...settings.fishMeals,
        enabled: checked
      }
    });
  };
  
  // Gestionnaire pour activer/désactiver un repas spécifique
  const handleMealEnabledToggle = (id: string, checked: boolean) => {
    const updatedMeals = settings.fishMeals.meals.map(meal => 
      meal.id === id ? { ...meal, enabled: checked } : meal
    );
    
    updateSettings({
      fishMeals: {
        ...settings.fishMeals,
        meals: updatedMeals
      }
    });
  };
  
  // Gestionnaire pour changer l'heure d'un repas
  const handleMealTimeChange = (id: string, newTime: string) => {
    const updatedMeals = settings.fishMeals.meals.map(meal => 
      meal.id === id ? { ...meal, time: newTime } : meal
    );
    
    updateSettings({
      fishMeals: {
        ...settings.fishMeals,
        meals: updatedMeals
      }
    });
  };
  
  // Ajouter un nouveau repas
  const addMeal = () => {
    const newMeal: MealTime = {
      id: uuidv4(),
      time: "12:00",
      enabled: true
    };
    
    updateSettings({
      fishMeals: {
        ...settings.fishMeals,
        meals: [...settings.fishMeals.meals, newMeal]
      }
    });
  };
  
  // Supprimer un repas
  const removeMeal = (id: string) => {
    const updatedMeals = settings.fishMeals.meals.filter(meal => meal.id !== id);
    
    updateSettings({
      fishMeals: {
        ...settings.fishMeals,
        meals: updatedMeals
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-blue-500" />
            <CardTitle>Repas des poissons</CardTitle>
          </div>
          <Switch 
            checked={settings.fishMeals.enabled}
            onCheckedChange={handleMealsToggle}
          />
        </div>
        <CardDescription>
          Configurez les horaires des repas quotidiens pour vos poissons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.fishMeals.enabled && (
          <>
            <div className="space-y-4">
              {settings.fishMeals.meals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-2 border p-2 rounded-md">
                  <Switch 
                    checked={meal.enabled}
                    onCheckedChange={(checked) => handleMealEnabledToggle(meal.id, checked)}
                    disabled={!settings.fishMeals.enabled}
                  />
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={meal.time}
                    onChange={(e) => handleMealTimeChange(meal.id, e.target.value)}
                    className="w-32"
                    disabled={!settings.fishMeals.enabled || !meal.enabled}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-auto text-destructive"
                    onClick={() => removeMeal(meal.id)}
                    disabled={!settings.fishMeals.enabled || settings.fishMeals.meals.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addMeal}
              disabled={!settings.fishMeals.enabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un repas
            </Button>
          </>
        )}
        
        {settings.fishMeals.enabled && settings.fishMeals.meals.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Aucun repas configuré. Ajoutez-en un pour commencer.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FishMealsSettings;
