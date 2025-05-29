import { useState } from "react";
import CalculatorForm from "./CalculatorForm";
import WhatsAppOptinPopup from "./WhatsAppOptinPopup";
import ConfirmationScreen from "./ConfirmationScreen";
import { calculateBMI, calculateBMR, getWeightCategory } from "../utils/calculations";

export type UserData = {
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  currentWeightKg: number;
  activityLevelMultiplier: number;
  physicalGoal: 'maintain' | 'leaner' | 'stronger' | 'healthyWeight' | 'other';
  muscleMass: 'minimally_muscular' | 'less_muscular' | 'normal' | 'muscular' | 'very_muscular';
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

type AppState = 'form' | 'optin' | 'confirmation';

const Calculator = () => {
  const [appState, setAppState] = useState<AppState>('form');
  const [calculatedResults, setCalculatedResults] = useState<CalculationResults & { userInputs: UserData } | null>(null);
  const [leadName, setLeadName] = useState('');

  const calculateResults = (data: UserData) => {
    const { age, gender, heightCm, currentWeightKg, activityLevelMultiplier, physicalGoal, muscleMass } = data;
    
    const heightM = heightCm / 100;
    const bmi = calculateBMI(currentWeightKg, heightM);
    const weightCategory = getWeightCategory(bmi);
    
    const healthyWeightLowerBound = parseFloat((18.5 * (heightM * heightM)).toFixed(1));
    const healthyWeightUpperBound = parseFloat((24.9 * (heightM * heightM)).toFixed(1));
    const healthyWeightRange = `${healthyWeightLowerBound} - ${healthyWeightUpperBound}`;
    
    const midHealthyBmiWeight = parseFloat((((18.5 + 24.9) / 2) * (heightM * heightM)).toFixed(1));
    const bmr = calculateBMR(currentWeightKg, heightCm, age, gender);
    const maintenanceCalories = Math.round(bmr * activityLevelMultiplier);

    let targetWeight = currentWeightKg;
    let interpretiveNote = "";
    let timeCalculationApplicable = true;
    let recompTimeNote = "";
    
    const targetBmiForLeanerGoal = (muscleMass: string): number => {
      switch (muscleMass) {
        case 'very_muscular': return 24.5;
        case 'muscular': return 23.5;
        case 'normal': return 21.8;
        case 'less_muscular': return 20.5;
        case 'minimally_muscular': return 19.5;
        default: return 21.8;
      }
    };

    const formatMuscleMass = (value: string): string => {
      const map: Record<string, string> = {
        "minimally_muscular": "Minimamente Muscoloso",
        "less_muscular": "Poco Muscoloso",
        "normal": "Normale",
        "muscular": "Muscoloso",
        "very_muscular": "Molto Muscoloso"
      };
      return map[value] || "Non specificata";
    };

    const leanerTargetBmi = Math.max(18.5, Math.min(targetBmiForLeanerGoal(muscleMass), 24.9));
    const leanerTargetWeightBasedOnMuscle = parseFloat((leanerTargetBmi * heightM * heightM).toFixed(1));
    
    if (bmi > 24.9) {
      const muscleMassText = formatMuscleMass(muscleMass);
      interpretiveNote = `Attualmente il tuo BMI (${bmi.toFixed(1)}) indica ${weightCategory.split('(')[0].trim()}. Il tuo range di peso salutare è ${healthyWeightRange} kg. Considerata la tua massa muscolare percepita ('${muscleMassText}')... `;
      
      switch (physicalGoal) {
        case 'leaner':
          targetWeight = leanerTargetWeightBasedOnMuscle;
          interpretiveNote += `per 'Diventare più Snello/Definito', un obiettivo appropriato è mirare a circa ${targetWeight.toFixed(1)} kg. `;
          if (muscleMass === 'very_muscular' || muscleMass === 'muscular') {
            interpretiveNote += `Questo peso ti permetterebbe di ottimizzare la definizione mantenendo la tua notevole massa muscolare. Il focus sarà sulla perdita di grasso e sulla ricomposizione corporea.`;
            if (Math.abs(currentWeightKg - targetWeight) < 4 && bmi < 28) {
              recompTimeNote = ` Il percorso di ricomposizione corporea per accentuare la definizione, pur mantenendo la tua massa muscolare, richiede un impegno e un tempo (spesso alcuni mesi) paragonabile a quello di una significativa trasformazione per una persona con corporatura media. Questo si concentra su allenamento specifico e una precisa strategia nutrizionale.`;
            }
          }
          break;
        case 'healthyWeight':
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `per 'Raggiungere un Peso Salutare', il primo traguardo è ${targetWeight.toFixed(1)} kg. `;
          if (muscleMass === 'very_muscular' || muscleMass === 'muscular') {
            interpretiveNote += `Data la tua muscolatura, è possibile che il tuo peso sia elevato anche a causa della massa magra. Raggiungere il limite superiore del BMI è un riferimento; una valutazione della composizione corporea con un professionista è cruciale per definire il tuo peso forma ideale. `;
          }
          interpretiveNote += `Successivamente, si potrà valutare un'ulteriore ottimizzazione.`;
          break;
        case 'maintain':
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `hai scelto 'Mantenere un Peso Normopeso', ma attualmente non lo sei. È prima necessario raggiungere il range salutare. La stima è per arrivare a ${targetWeight.toFixed(1)} kg.`;
          break;
        case 'stronger':
          targetWeight = (muscleMass === 'very_muscular' || muscleMass === 'muscular') ? 
            Math.max(leanerTargetWeightBasedOnMuscle, healthyWeightLowerBound) : 
            healthyWeightUpperBound;
          interpretiveNote += `per 'Diventare più Robusto', essendo in sovrappeso, è consigliabile prima ottimizzare la composizione corporea. Un obiettivo di peso iniziale potrebbe essere ${targetWeight.toFixed(1)} kg. L'aumento di forza e massa muscolare richiederà poi allenamento e dieta mirati.`;
          break;
        default:
          targetWeight = healthyWeightUpperBound;
          interpretiveNote += `per il tuo obiettivo 'Altro', un primo passo è rientrare nel range salutare, mirando a ${targetWeight.toFixed(1)} kg.`;
          break;
      }
    } else if (bmi < 18.5) {
      interpretiveNote = `Attualmente il tuo BMI (${bmi.toFixed(1)}) indica SOTTOPESO. Il tuo range di peso salutare è ${healthyWeightRange} kg. `;
      
      targetWeight = healthyWeightLowerBound;
      timeCalculationApplicable = false;
      
      switch (physicalGoal) {
        case 'leaner':
          interpretiveNote += `L'obiettivo 'Diventare più Snello' non è appropriato se sei sottopeso. È cruciale concentrarsi prima sul raggiungere un peso salutare (almeno ${healthyWeightLowerBound.toFixed(1)} kg). Se vuoi un aspetto definito, punta a guadagnare massa magra.`;
          break;
        case 'healthyWeight':
        case 'maintain':
        case 'stronger':
        case 'other':
          interpretiveNote += `Per il tuo obiettivo, è fondamentale raggiungere almeno ${targetWeight.toFixed(1)} kg. Il guadagno di peso dovrebbe essere graduale (es. 0.2-0.4 kg/settimana), focalizzato su una dieta nutriente e, se l'obiettivo è la forza, sull'allenamento adeguato.`;
          break;
      }
    } else {
      const muscleMassText = formatMuscleMass(muscleMass);
      interpretiveNote = `Complimenti! Il tuo BMI (${bmi.toFixed(1)}) è NORMOPESO (range: ${healthyWeightRange} kg). Considerata la tua massa muscolare percepita ('${muscleMassText}')... `;
      
      targetWeight = currentWeightKg;
      timeCalculationApplicable = false;
      
      switch (physicalGoal) {
        case 'leaner':
          if (currentWeightKg > leanerTargetWeightBasedOnMuscle + 0.5) {
            targetWeight = leanerTargetWeightBasedOnMuscle;
            interpretiveNote += `per un aspetto più 'Snello/Definito', potresti mirare a un peso intorno a ${targetWeight.toFixed(1)} kg. `;
            if (muscleMass === 'very_muscular' || muscleMass === 'muscular') {
              interpretiveNote += `Questo ti aiuterà a massimizzare la definizione preservando la massa muscolare. Il focus sarà sulla ricomposizione corporea.`;
              if (Math.abs(currentWeightKg - targetWeight) < 3) { 
                recompTimeNote = ` Data la potenziale minima differenza di peso, il tuo focus sarà primariamente sulla ricomposizione corporea (perdita di grasso mantenendo/aumentando il muscolo), un processo che richiede dedizione e tempo significativi, spesso diversi mesi.`;
              }
            }
            timeCalculationApplicable = true;
          } else {
            interpretiveNote += `sei già a un peso ottimale o inferiore per un obiettivo 'Snello/Definito'. Ulteriori cambiamenti riguarderanno la ricomposizione corporea (allenamento e dieta mirati) piuttosto che una significativa perdita di peso.`;
          }
          break;
        case 'maintain':
        case 'healthyWeight':
          interpretiveNote += "Il tuo obiettivo è mantenere questo stato di forma o sei già in un peso salutare. Ottimo lavoro!";
          break;
        case 'stronger':
          interpretiveNote += `essendo normopeso, per 'Diventare più Robusto' dovrai focalizzarti su allenamento di forza e un surplus calorico controllato per la crescita muscolare. Se il tuo peso attuale è nella fascia bassa del normopeso potresti considerare un leggero aumento di peso controllato.`;
          if ((muscleMass === 'very_muscular' || muscleMass === 'muscular') && currentWeightKg < midHealthyBmiWeight) {
            targetWeight = Math.min(healthyWeightUpperBound, midHealthyBmiWeight + 2);
            if (targetWeight > currentWeightKg) timeCalculationApplicable = false;
            else targetWeight = currentWeightKg;
          }
          break;
        default:
          interpretiveNote += "per il tuo obiettivo specifico, essendo già normopeso, ti consigliamo di consultare un professionista per un piano dettagliato.";
          break;
      }
    }

    if (recompTimeNote) {
      interpretiveNote += recompTimeNote;
    }

    let timeToGoal = "Non pertinente per l'obiettivo e la situazione attuale.";
    const weightToChange = currentWeightKg - targetWeight;
    
    if (weightToChange > 0.1 && timeCalculationApplicable) {
      const totalWeeksEstimated = calculateWeightLossTime(currentWeightKg, targetWeight, age, gender, activityLevelMultiplier, muscleMass);
      
      if (totalWeeksEstimated > 0.1) {
        const totalMonthsEstimated = (totalWeeksEstimated / 4.345).toFixed(1);
        
        if (totalWeeksEstimated < 1) {
          timeToGoal = `Meno di una settimana (obiettivo ${targetWeight.toFixed(1)} kg molto vicino).`;
        } else if (totalWeeksEstimated <= 5) {
          timeToGoal = `${totalWeeksEstimated.toFixed(0)} settimane circa.`;
        } else {
          timeToGoal = `${totalWeeksEstimated.toFixed(0)} settimane (circa ${totalMonthsEstimated} mesi).`;
        }
        
        if (totalWeeksEstimated >= 1) {
          timeToGoal += ` (Stima per raggiungere ${targetWeight.toFixed(1)} kg con perdita progressiva).`;
        }
      } else {
        timeToGoal = `L'obiettivo di peso (${targetWeight.toFixed(1)} kg) è praticamente raggiunto.`;
      }
    } else if (weightToChange < -0.1) {
      const weightToGainAbs = Math.abs(weightToChange);
      let weeklyGainRate = 0.25;
      
      if (gender === 'male') weeklyGainRate += 0.05;
      if (age < 30 && (physicalGoal === 'stronger' || muscleMass === 'very_muscular' || muscleMass === 'muscular')) weeklyGainRate += 0.1;
      if (parseFloat(activityLevelMultiplier.toString()) > 1.5) weeklyGainRate += 0.05;
      
      weeklyGainRate = Math.max(0.15, Math.min(weeklyGainRate, 0.5));
      const weeksToGain = weightToGainAbs / weeklyGainRate;
      
      if (weeksToGain > 0.1) {
        const monthsToGain = (weeksToGain / 4.345).toFixed(1);
        
        if (weeksToGain < 1) {
          timeToGoal = `Meno di una settimana (obiettivo ${targetWeight.toFixed(1)} kg molto vicino).`;
        } else if (weeksToGain <= 5) {
          timeToGoal = `${weeksToGain.toFixed(0)} settimane circa.`;
        } else {
          timeToGoal = `${weeksToGain.toFixed(0)} settimane (circa ${monthsToGain} mesi).`;
        }
        
        if (weeksToGain >= 1) {
          timeToGoal += ` (Stima per guadagnare ${weightToGainAbs.toFixed(1)} kg e raggiungere ${targetWeight.toFixed(1)} kg).`;
        }
      } else {
        timeToGoal = `L'obiettivo di peso (${targetWeight.toFixed(1)} kg) è praticamente raggiunto.`;
      }
    }

    let weightDifference = "Nessun cambiamento di peso significativo calcolato per l'obiettivo.";
    if (Math.abs(currentWeightKg - targetWeight) > 0.1) {
      const diffVal = Math.abs(currentWeightKg - targetWeight).toFixed(1);
      if (currentWeightKg > targetWeight) {
        weightDifference = `${diffVal} kg da perdere per raggiungere ${targetWeight.toFixed(1)} kg (obiettivo calcolato).`;
      } else {
        weightDifference = `${diffVal} kg da guadagnare per raggiungere ${targetWeight.toFixed(1)} kg (obiettivo calcolato).`;
      }
    } else if ((bmi > 24.9 && targetWeight >= currentWeightKg) || (bmi < 18.5 && targetWeight <= currentWeightKg)) {
      if (bmi > 24.9) {
        weightDifference = `${(currentWeightKg - healthyWeightUpperBound).toFixed(1)} kg da perdere per entrare nel range salutare standard.`;
      } else {
        weightDifference = `${(healthyWeightLowerBound - currentWeightKg).toFixed(1)} kg da guadagnare per entrare nel range salutare standard.`;
      }
    }

    const results = {
      bmi,
      weightCategory,
      healthyWeightRange,
      weightDifference,
      maintenanceCalories,
      timeToGoal,
      interpretiveNote,
      targetWeight,
      userInputs: data
    };

    setCalculatedResults(results);
    setAppState('optin');
  };

  const calculateWeightLossTime = (
    initialWeight: number, 
    targetWeight: number, 
    age: number, 
    gender: string, 
    activityMultiplier: number,
    muscleMass: string
  ): number => {
    let weightToLoseTotal = initialWeight - targetWeight;
    
    if (weightToLoseTotal <= 0.05) {
      return 0;
    }
    
    let totalWeeks = 0;
    let remainingWeightToLose = weightToLoseTotal;
    
    if (weightToLoseTotal <= 4) {
      let weeklyRate = 0.45;
      
      if (gender === 'male') weeklyRate += 0.1;
      else weeklyRate -= 0.05;
      
      if (age < 35) weeklyRate += 0.1;
      else if (age > 50) weeklyRate -= 0.1;
      
      if (activityMultiplier >= 1.725) weeklyRate += 0.15;
      else if (activityMultiplier >= 1.55) weeklyRate += 0.05;
      else if (activityMultiplier < 1.3) weeklyRate -= 0.1;
      
      if (muscleMass === 'very_muscular' || muscleMass === 'muscular') weeklyRate += 0.05;
      
      weeklyRate = Math.max(0.20, Math.min(weeklyRate, 0.95));
      totalWeeks = remainingWeightToLose / weeklyRate;
    } else {
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
      
      if (muscleMass === 'very_muscular') weeklyRatePhase1 += 0.1;
      else if (muscleMass === 'muscular') weeklyRatePhase1 += 0.05;
      
      weeklyRatePhase1 = Math.max(0.35, Math.min(weeklyRatePhase1, 1.40));
      
      let weightLostPhase1 = Math.min(remainingWeightToLose, weeklyRatePhase1 * 4);
      remainingWeightToLose -= weightLostPhase1;
      totalWeeks += 4;
      
      if (remainingWeightToLose > 0.05) {
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
          
          if (muscleMass === 'very_muscular') weeklyRatePhase2 += 0.1;
          else if (muscleMass === 'muscular') weeklyRatePhase2 += 0.05;
          
          weeklyRatePhase2 = Math.max(0.25, Math.min(weeklyRatePhase2, 0.95));
          
          let weeksPhase2 = weightToLoseInPhase2 / weeklyRatePhase2;
          totalWeeks += weeksPhase2;
          remainingWeightToLose -= weightToLoseInPhase2;
        }
        
        if (remainingWeightToLose > 0.05) {
          let weeklyRatePhase3 = 0.30;
          
          if (gender === 'male') weeklyRatePhase3 += 0.05;
          if (age > 45) weeklyRatePhase3 -= 0.05;
          
          if (activityMultiplier >= 1.55) weeklyRatePhase3 += 0.1;
          else if (activityMultiplier < 1.3) weeklyRatePhase3 -= 0.05;
          
          if (muscleMass === 'very_muscular' || muscleMass === 'muscular') weeklyRatePhase3 += 0.05;
          
          weeklyRatePhase3 = Math.max(0.15, Math.min(weeklyRatePhase3, 0.75));
          
          let weeksPhase3 = remainingWeightToLose / weeklyRatePhase3;
          totalWeeks += weeksPhase3;
        }
      }
    }
    
    return totalWeeks;
  };

  const handleOptinSuccess = (name: string) => {
    setLeadName(name);
    setAppState('confirmation');
  };

  const handleNewCalculation = () => {
    setAppState('form');
    setCalculatedResults(null);
    setLeadName('');
  };

  const handleCloseOptin = () => {
    setAppState('form');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="hero-calculator-section bg-gradient-to-b from-black to-neutral-900 bg-fixed bg-center bg-cover py-16 min-h-screen flex flex-col items-center justify-center text-center p-4" 
                 style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85)), url("/samuroad-hero.png")' }}>
          <div className="max-w-3xl mx-auto w-full">
            <div className="mb-10 flex flex-col items-center">
              <img src="/lovable-uploads/95e82436-545f-45d3-a862-63f8e984447f.png" alt="Samuroad Logo" className="h-36 mb-6" />
              <div className="h-1 w-24 bg-primary mx-auto mb-6"></div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-title text-white mb-4">
                Trasforma il Tuo Fisico, Raggiungi il Tuo Benessere.
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto font-body">
                Scopri non solo il tuo peso ideale personalizzato in base ai tuoi obiettivi unici,
                ma anche una stima realistica del tempo necessario per arrivarci.
                Inizia oggi il tuo percorso verso una versione più sana e consapevole di te!
              </p>
            </div>
            
            <div className="calculator-wrapper bg-card border border-neutral-800 rounded-xl shadow-2xl shadow-primary/10">
              <h3 className="text-3xl font-title text-primary text-center mb-8 pt-6">Calcola Ora</h3>
              
              <div className="calculator-content">
                {appState === 'form' && (
                  <CalculatorForm onCalculate={calculateResults} />
                )}
                
                {appState === 'confirmation' && (
                  <ConfirmationScreen 
                    leadName={leadName}
                    onNewCalculation={handleNewCalculation}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black py-6 text-center text-gray-500 text-sm font-body">
        <p>&copy; {new Date().getFullYear()} Samuroad. Tutti i diritti riservati.</p>
      </footer>

      {appState === 'optin' && calculatedResults && (
        <WhatsAppOptinPopup
          isOpen={true}
          onClose={handleCloseOptin}
          onSubmitSuccess={handleOptinSuccess}
          calculatedData={calculatedResults}
        />
      )}
    </div>
  );
};

export default Calculator;
