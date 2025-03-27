
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { Fish, Clock } from "lucide-react";
import { useMemo } from "react";

interface FishMealInfoProps {
  animationDelay?: string;
}

const FishMealInfo = ({ animationDelay = "" }: FishMealInfoProps) => {
  const { settings } = useSettings();
  
  const { lastMeal, nextMeal } = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    let lastMealTime = "Aucun repas aujourd'hui";
    let nextMealTime = "Aucun repas programmé";
    
    // Filtrer les repas activés
    const enabledMeals = settings.fishMeals.meals.filter(meal => meal.enabled);
    
    if (enabledMeals.length > 0) {
      // Convertir les heures de repas en minutes pour faciliter la comparaison
      const mealsInMinutes = enabledMeals.map(meal => {
        const [hours, minutes] = meal.time.split(':').map(Number);
        return { 
          id: meal.id,
          timeString: meal.time,
          minutes: hours * 60 + minutes 
        };
      });
      
      // Trouver le dernier repas (le plus récent passé)
      const pastMeals = mealsInMinutes.filter(meal => meal.minutes <= currentTimeInMinutes);
      const lastMealData = pastMeals.length > 0 
        ? pastMeals.reduce((latest, meal) => meal.minutes > latest.minutes ? meal : latest, pastMeals[0]) 
        : null;
      
      // Si aucun repas aujourd'hui, le dernier repas est celui de la fin de la journée précédente
      if (!lastMealData && mealsInMinutes.length > 0) {
        const yesterdayLastMeal = mealsInMinutes.reduce((latest, meal) => 
          meal.minutes > latest.minutes ? meal : latest, mealsInMinutes[0]);
        lastMealTime = `Hier à ${yesterdayLastMeal.timeString}`;
      } else if (lastMealData) {
        lastMealTime = `Aujourd'hui à ${lastMealData.timeString}`;
      }
      
      // Trouver le prochain repas (le plus proche à venir)
      const futureMeals = mealsInMinutes.filter(meal => meal.minutes > currentTimeInMinutes);
      const nextMealData = futureMeals.length > 0 
        ? futureMeals.reduce((earliest, meal) => meal.minutes < earliest.minutes ? meal : earliest, futureMeals[0]) 
        : null;
      
      // Si aucun repas à venir aujourd'hui, le prochain repas est celui du début de la journée suivante
      if (!nextMealData && mealsInMinutes.length > 0) {
        const tomorrowFirstMeal = mealsInMinutes.reduce((earliest, meal) => 
          meal.minutes < earliest.minutes ? meal : earliest, mealsInMinutes[0]);
        nextMealTime = `Demain à ${tomorrowFirstMeal.timeString}`;
      } else if (nextMealData) {
        nextMealTime = `Aujourd'hui à ${nextMealData.timeString}`;
      }
    }
    
    return { lastMeal: lastMealTime, nextMeal: nextMealTime };
  }, [settings.fishMeals.meals]);

  return (
    <Card className={`p-4 ${animationDelay} animate-scale-in sensor-card`}>
      <div className="flex items-center mb-3">
        <Fish className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-medium">Repas des poissons</h3>
      </div>
      
      <div className="space-y-3 mt-4">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-muted-foreground">Dernier repas:</span>
          <span className="ml-auto font-medium">{lastMeal}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-muted-foreground">Prochain repas:</span>
          <span className="ml-auto font-medium">{nextMeal}</span>
        </div>
      </div>
    </Card>
  );
};

export default FishMealInfo;
