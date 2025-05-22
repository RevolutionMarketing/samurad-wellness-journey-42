
import { CalculationResults } from "./Calculator";

interface ResultsDisplayProps {
  results: CalculationResults;
  onReset: () => void;
}

const ResultsDisplay = ({ results, onReset }: ResultsDisplayProps) => {
  const { 
    bmi, 
    weightCategory, 
    healthyWeightRange, 
    weightDifference,
    maintenanceCalories, 
    timeToGoal, 
    interpretiveNote,
  } = results;

  return (
    <div className="results-section p-6 sm:p-8">
      <h4 className="text-lg font-title text-white mb-6 border-b border-primary pb-2">
        I Tuoi Risultati Personalizzati
      </h4>
      
      <div className="space-y-4 font-body">
        <ResultItem label="BMI Calcolato:" value={bmi.toFixed(1)} />
        <ResultItem label="Categoria di Peso:" value={weightCategory} />
        <ResultItem label="Range di Peso Salutare (BMI 18.5 - 24.9):" value={`${healthyWeightRange} kg`} />
        <ResultItem label="Differenza rispetto all'Obiettivo Calcolato:" value={weightDifference} />
        <ResultItem label="Stima Dispendio Calorico Giornaliero (Mantenimento):" value={`${maintenanceCalories} kcal`} />
        <ResultItem label="Stima Tempo per Raggiungere l'Obiettivo Calcolato:" value={timeToGoal} />
      </div>
      
      <div className="mt-8 p-5 bg-secondary rounded-lg border-l-4 border-primary">
        <h5 className="font-title font-medium text-white text-xl mb-3">Il Tuo Percorso Benessere Dettagliato:</h5>
        <p className="text-gray-300 text-sm font-body">{interpretiveNote}</p>
      </div>
      
      <div className="mt-6 p-4 bg-gray-900/50 rounded-md text-xs text-gray-400 font-body">
        <p className="mb-2">
          <strong className="text-primary">ATTENZIONE:</strong> Questo è uno strumento indicativo basato su formule generali e non sostituisce il parere di un medico, dietologo, nutrizionista o professionista dell'esercizio fisico. I risultati sono stime e le risposte individuali possono variare. Consulta sempre un professionista qualificato per consigli personalizzati sulla tua salute e il tuo benessere.
        </p>
        <p className="italic">
          Nota: Per i calcoli del Metabolismo Basale (BMR), sono state usate formule standard per "Maschio" e "Femmina". Per una valutazione più accurata e personalizzata, specialmente in casi specifici o condizioni particolari, è fondamentale consultare un professionista.
        </p>
      </div>
      
      <button
        onClick={onReset}
        className="w-full mt-8 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-title text-xl"
      >
        Nuovo Calcolo
      </button>
    </div>
  );
};

const ResultItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center">
    <span className="text-primary font-medium text-sm mb-1 sm:mb-0 sm:w-1/2">{label}</span>
    <span className="text-white text-sm sm:w-1/2">{value}</span>
  </div>
);

export default ResultsDisplay;
