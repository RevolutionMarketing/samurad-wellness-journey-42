
import { useState } from "react";
import CalculatorForm from "./CalculatorForm";
import ResultsDisplay from "./ResultsDisplay";
import { calculateBMI, calculateBMR, getWeightCategory } from "../utils/calculations";

export type UserData = {
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  currentWeightKg: number;
  activityLevelMultiplier: number;
  physicalGoal: 'maintain' | 'leaner' | 'stronger' | 'healthyWeight' | 'other';
};

export type CalculationResults = {
  bmi: number;
  weightCategory: string;
  healthyWeightRange: string;
  weightDifference: string;
  maintenanceCalories: number;
  timeToGoal: string;
  interpretiveNote: string;
  targetWeight: number;
};

const Calculator = () => {
  const [results, setResults] = useState<CalculationResults | null>(null);

  const calculateResults = (data: UserData) => {
    const { age, gender, heightCm, currentWeightKg, activityLevelMultiplier, physicalGoal } = data;
    
    // Basic calculations
    const heightM = heightCm / 100;
    const bmi = calculateBMI(currentWeightKg, heightM);
    const weightCategory = getWeightCategory(bmi);
    
    const healthyWeightLowerBound = parseFloat((18.5 * (heightM * heightM)).toFixed(1));
    const healthyWeightUpperBound = parseFloat((24.9 * (heightM * heightM)).toFixed(1));
    const healthyWeightRange = `${healthyWeightLowerBound} - ${healthyWeightUpperBound}`;
    
    const midHealthyBmiWeight = parseFloat((((18.5 + 24.9) / 2) * (heightM * heightM)).toFixed(1));
    const bmr = calculateBMR(currentWeightKg, heightCm, age, gender);
    const maintenanceCalories = Math.round(bmr * activityLevelMultiplier);

    // Determine target weight and interpretive message
    let targetWeight = currentWeightKg;
    let interpretiveNote = "";
    let timeCalculationApplicable = true;
    
    if (bmi > 24.9) {
      // OVERWEIGHT/OBESE
      interpretiveNote = `Attualmente il tuo BMI (${bmi.toFixed(1)}) indica ${weightCategory.split('(')[0].trim()}. Il tuo range di peso salutare è ${healthyWeightRange} kg. `;
      
      switch (physicalGoal) {
        case 'leaner':
          targetWeight = Math.max(healthyWeightLowerBound, midHealthyBmiWeight);
          interpretiveNote += `Per 'Diventare più Snello/Definito', un buon obiettivo è mirare a circa ${targetWeight.toFixed(1)} kg. Questo peso si colloca idealmente nel tuo range salutare per favorire una silhouette più asciutta.`;
          break;
        case 'healthyWeight':
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `Per 'Raggiungere un Peso Salutare', il primo traguardo è mirare a ${targetWeight.toFixed(1)} kg (il limite superiore del tuo range). Una volta raggiunto, potresti valutare con un professionista un'ulteriore graduale ottimizzazione all'interno del range (es. 1-2 kg al mese in modo sostenibile), se indicato per la tua composizione corporea.`;
          break;
        case 'maintain':
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `Hai scelto 'Mantenere un Peso Normopeso', ma attualmente non lo sei. È prima necessario raggiungere il range salutare. La stima seguente è per arrivare a ${targetWeight.toFixed(1)} kg.`;
          break;
        case 'stronger':
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `Per 'Diventare più Robusto' essendo in sovrappeso, è consigliabile prima ridurre il grasso in eccesso per migliorare la salute generale e la composizione corporea. Un primo obiettivo è ${targetWeight.toFixed(1)} kg. L'aumento di massa muscolare richiederà poi allenamento e dieta specifici.`;
          break;
        default: // 'other'
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `Considerando il tuo obiettivo 'Altro', un primo passo fondamentale è rientrare nel range di peso salutare, mirando a ${targetWeight.toFixed(1)} kg. Poi, potrai definire meglio i passi successivi con un professionista.`;
          break;
      }
    } else if (bmi < 18.5) {
      // UNDERWEIGHT
      interpretiveNote = `Attualmente il tuo BMI (${bmi.toFixed(1)}) indica SOTTOPESO. Il tuo range di peso salutare è ${healthyWeightRange} kg. `;
      
      targetWeight = healthyWeightLowerBound;
      timeCalculationApplicable = false;
      
      switch (physicalGoal) {
        case 'leaner':
          interpretiveNote += "L'obiettivo 'Diventare più Snello' non è appropriato se sei sottopeso. È cruciale concentrarsi prima sul raggiungere un peso salutare. Contatta un professionista.";
          targetWeight = currentWeightKg;
          break;
        case 'healthyWeight':
        case 'maintain':
        case 'stronger':
        case 'other':
          interpretiveNote += `Per il tuo obiettivo, è fondamentale raggiungere almeno ${targetWeight.toFixed(1)} kg. Il guadagno di peso dovrebbe essere graduale (es. 0.2-0.4 kg/settimana), focalizzato su una dieta nutriente e, se l'obiettivo è la forza, sull'allenamento adeguato.`;
          break;
      }
    } else {
      // NORMAL WEIGHT
      interpretiveNote = `Complimenti! Il tuo BMI (${bmi.toFixed(1)}) è NORMOPESO (range: ${healthyWeightRange} kg). `;
      
      targetWeight = currentWeightKg;
      timeCalculationApplicable = false;
      
      switch (physicalGoal) {
        case 'leaner':
          if (currentWeightKg > midHealthyBmiWeight + 1) {
            targetWeight = midHealthyBmiWeight;
            interpretiveNote += `Per un aspetto più 'Snello/Definito', potresti mirare a un peso intorno a ${targetWeight.toFixed(1)} kg, pur rimanendo comodamente nel tuo range salutare. La stima del tempo si riferisce a questo.`;
            timeCalculationApplicable = true;
          } else {
            interpretiveNote += "Ti trovi già in un'ottima zona del tuo range di peso salutare per un fisico snello. Un'ulteriore 'definizione' dipenderà principalmente dalla ricomposizione corporea (allenamento e alimentazione mirata) piuttosto che da una significativa perdita di peso.";
          }
          break;
        case 'maintain':
        case 'healthyWeight':
          interpretiveNote += "Il tuo obiettivo è mantenere questo stato di forma o sei già in un peso salutare. Ottimo lavoro!";
          break;
        case 'stronger':
          interpretiveNote += "Essendo normopeso, per 'Diventare più Robusto' dovrai focalizzarti su allenamento di forza e un surplus calorico controllato e di qualità per la crescita muscolare, monitorando la composizione corporea.";
          break;
        default: // 'other'
          interpretiveNote += "Per il tuo obiettivo specifico, essendo già normopeso, ti consigliamo di consultare un professionista per un piano dettagliato.";
          break;
      }
    }

    // Calculate time to goal
    let timeToGoal = "Non pertinente per l'obiettivo e la situazione attuale.";
    const weightToChange = currentWeightKg - targetWeight;
    
    if (weightToChange > 0 && timeCalculationApplicable) {
      // WEIGHT LOSS
      const totalWeeksEstimated = calculateWeightLossTime(currentWeightKg, targetWeight, age, gender, activityLevelMultiplier);
      
      if (totalWeeksEstimated > 0.1) {
        const totalMonthsEstimated = (totalWeeksEstimated / 4.345).toFixed(1);
        
        if (totalWeeksEstimated < 1) {
          timeToGoal = `Meno di una settimana (obiettivo molto vicino).`;
        } else if (totalWeeksEstimated <= 5) {
          timeToGoal = `${totalWeeksEstimated.toFixed(0)} settimane circa.`;
        } else {
          timeToGoal = `${totalWeeksEstimated.toFixed(0)} settimane (circa ${totalMonthsEstimated} mesi).`;
        }
        
        timeToGoal += ` (Stima per raggiungere ${targetWeight.toFixed(1)} kg con perdita progressiva).`;
      } else {
        timeToGoal = `L'obiettivo di peso (${targetWeight.toFixed(1)} kg) è praticamente raggiunto o richiede un cambiamento minimo.`;
      }
    } else if (weightToChange < 0) {
      // WEIGHT GAIN
      const weightToGainAbs = Math.abs(weightToChange);
      let weeklyGainRate = 0.30; // kg/week base for gain (more controlled)
      
      if (gender === 'male' && physicalGoal === 'stronger') weeklyGainRate += 0.1;
      if (age < 25 && physicalGoal === 'stronger') weeklyGainRate += 0.1;
      
      weeklyGainRate = Math.max(0.15, Math.min(weeklyGainRate, 0.5));
      const weeksToGain = weightToGainAbs / weeklyGainRate;
      
      if (weeksToGain > 0.1) {
        const monthsToGain = (weeksToGain / 4.345).toFixed(1);
        
        if (weeksToGain < 1) {
          timeToGoal = `Meno di una settimana (obiettivo molto vicino).`;
        } else if (weeksToGain <= 5) {
          timeToGoal = `${weeksToGain.toFixed(0)} settimane circa.`;
        } else {
          timeToGoal = `${weeksToGain.toFixed(0)} settimane (circa ${monthsToGain} mesi).`;
        }
        
        timeToGoal += ` (Stima per guadagnare ${weightToGainAbs.toFixed(1)} kg e raggiungere ${targetWeight.toFixed(1)} kg).`;
      } else {
        timeToGoal = `L'obiettivo di peso (${targetWeight.toFixed(1)} kg) è praticamente raggiunto o richiede un cambiamento minimo.`;
      }
    }

    // Calculate weight difference text
    let weightDifference = "N/A";
    if (targetWeight !== currentWeightKg) {
      const diffVal = Math.abs(currentWeightKg - targetWeight).toFixed(1);
      if (currentWeightKg > targetWeight) {
        weightDifference = `${diffVal} kg da perdere per raggiungere ${targetWeight.toFixed(1)} kg (obiettivo calcolato).`;
      } else {
        weightDifference = `${diffVal} kg da guadagnare per raggiungere ${targetWeight.toFixed(1)} kg (obiettivo calcolato).`;
      }
    } else if (bmi > 24.9 || bmi < 18.5) {
      // Normal weight but objective doesn't involve weight change, still show diff from range
      if (bmi > 24.9) {
        weightDifference = `${(currentWeightKg - healthyWeightUpperBound).toFixed(1)} kg da perdere per entrare nel range salutare.`;
      } else {
        weightDifference = `${(healthyWeightLowerBound - currentWeightKg).toFixed(1)} kg da guadagnare per entrare nel range salutare.`;
      }
    }

    setResults({
      bmi,
      weightCategory,
      healthyWeightRange,
      weightDifference,
      maintenanceCalories,
      timeToGoal,
      interpretiveNote,
      targetWeight
    });
  };

  // Helper function to estimate weight loss time with a curved approach
  const calculateWeightLossTime = (initialWeight: number, targetWeight: number, age: number, gender: string, activityMultiplier: number): number => {
    let weightToLoseTotal = initialWeight - targetWeight;
    
    if (weightToLoseTotal <= 0.05) {
      return 0;
    }
    
    let totalWeeks = 0;
    let remainingWeightToLose = weightToLoseTotal;
    
    if (weightToLoseTotal <= 4) {
      // Small weight loss (up to 4kg) -> More direct model
      let weeklyRate = 0.45;
      
      if (gender === 'male') weeklyRate += 0.1;
      else weeklyRate -= 0.05;
      
      if (age < 35) weeklyRate += 0.1;
      else if (age > 50) weeklyRate -= 0.1;
      
      if (activityMultiplier >= 1.725) weeklyRate += 0.15;
      else if (activityMultiplier >= 1.55) weeklyRate += 0.05;
      else if (activityMultiplier < 1.3) weeklyRate -= 0.1;
      
      weeklyRate = Math.max(0.20, Math.min(weeklyRate, 0.90));
      totalWeeks = remainingWeightToLose / weeklyRate;
    } else {
      // Larger weight loss (> 4kg) -> Phased model
      // Phase 1: First Month (4 weeks)
      let weeklyRatePhase1 = 0.70;
      
      if (weightToLoseTotal >= 20) weeklyRatePhase1 += 0.25;
      else if (weightToLoseTotal >= 10) weeklyRatePhase1 += 0.15;
      
      if (gender === 'male') weeklyRatePhase1 += 0.15;
      else weeklyRatePhase1 -= 0.05;
      
      if (age < 30) weeklyRatePhase1 += 0.15;
      else if (age > 55) weeklyRatePhase1 -= 0.20;
      else if (age > 45) weeklyRatePhase1 -= 0.10;
      
      if (activityMultiplier >= 1.725) weeklyRatePhase1 += 0.20;
      else if (activityMultiplier >= 1.55) weeklyRatePhase1 += 0.10;
      else if (activityMultiplier < 1.3) weeklyRatePhase1 -= 0.15;
      
      weeklyRatePhase1 = Math.max(0.35, Math.min(weeklyRatePhase1, 1.35)); // Max ~5.4kg/month
      
      let weightLostPhase1 = Math.min(remainingWeightToLose, weeklyRatePhase1 * 4);
      remainingWeightToLose -= weightLostPhase1;
      totalWeeks += 4;
      
      if (remainingWeightToLose > 0.05) {
        // Phase 2: Sustainable Loss
        let weightToLoseInPhase2 = Math.max(0, remainingWeightToLose - ((weightToLoseTotal > 15) ? 4 : 3));
        
        if (weightToLoseInPhase2 > 0.05) {
          let weeklyRatePhase2 = 0.45;
          
          if (gender === 'male') weeklyRatePhase2 += 0.1;
          else weeklyRatePhase2 -= 0.05;
          
          if (age > 40) weeklyRatePhase2 -= 0.1;
          else if (age < 30) weeklyRatePhase2 += 0.05;
          
          if (activityMultiplier >= 1.725) weeklyRatePhase2 += 0.15;
          else if (activityMultiplier >= 1.55) weeklyRatePhase2 += 0.05;
          else if (activityMultiplier < 1.3) weeklyRatePhase2 -= 0.10;
          
          weeklyRatePhase2 = Math.max(0.25, Math.min(weeklyRatePhase2, 0.90));
          
          let weeksPhase2 = weightToLoseInPhase2 / weeklyRatePhase2;
          totalWeeks += weeksPhase2;
          remainingWeightToLose -= weightToLoseInPhase2;
        }
        
        if (remainingWeightToLose > 0.05) {
          // Phase 3: Last kg
          let weeklyRatePhase3 = 0.30;
          
          if (gender === 'male') weeklyRatePhase3 += 0.05;
          if (age > 45) weeklyRatePhase3 -= 0.05;
          
          if (activityMultiplier >= 1.55) weeklyRatePhase3 += 0.1;
          else if (activityMultiplier < 1.3) weeklyRatePhase3 -= 0.05;
          
          weeklyRatePhase3 = Math.max(0.15, Math.min(weeklyRatePhase3, 0.70));
          
          let weeksPhase3 = remainingWeightToLose / weeklyRatePhase3;
          totalWeeks += weeksPhase3;
        }
      }
    }
    
    return totalWeeks;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="hero-calculator-section bg-gradient-to-b from-black to-neutral-900 bg-fixed bg-center bg-cover py-16 min-h-screen flex flex-col items-center justify-center text-center p-4">
          <div className="max-w-3xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Samurad</h1>
              <div className="h-1 w-24 bg-primary mx-auto mb-6"></div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Trasforma il Tuo Fisico, Raggiungi il Tuo Benessere.
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto">
                Scopri non solo il tuo peso ideale personalizzato in base ai tuoi obiettivi unici,
                ma anche una stima realistica del tempo necessario per arrivarci.
                Inizia oggi il tuo percorso verso una versione più sana e consapevole di te!
              </p>
            </div>
            
            <div className="calculator-wrapper bg-card border border-neutral-800 rounded-xl shadow-2xl shadow-primary/10">
              <h3 className="text-2xl font-bold text-primary text-center mb-8 pt-6">Calcola Ora</h3>
              
              <div className="calculator-content">
                {!results ? (
                  <CalculatorForm onCalculate={calculateResults} />
                ) : (
                  <ResultsDisplay 
                    results={results} 
                    onReset={() => setResults(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Samurad. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Calculator;
