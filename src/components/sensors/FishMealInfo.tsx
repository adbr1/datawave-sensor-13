
import { Clock, Fish } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useMemo } from "react";
import SensorCard from "./SensorCard";

interface FishMealInfoProps {
  animationDelay?: string;
  className?: string;
}

const FishMealInfo = ({ 
  animationDelay = 'animation-delay-500',
  className
}: FishMealInfoProps) => {
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
    <SensorCard 
      title="Repas des poissons" 
      icon={<Fish className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center text-sm w-full">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-muted-foreground">Dernier repas:</span>
          <span className="ml-auto font-medium">{lastMeal}</span>
        </div>
        
        <div className="flex items-center text-sm w-full">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-muted-foreground">Prochain repas:</span>
          <span className="ml-auto font-medium">{nextMeal}</span>
        </div>
      </div>
    </SensorCard>
  );
};

export default FishMealInfo;
