import { useState } from 'react';
import { UserData } from './Calculator';

interface CalculatorFormProps {
  onCalculate: (data: UserData) => void;
}

const CalculatorForm = ({ onCalculate }: CalculatorFormProps) => {
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.age || formData.age <= 0 || formData.age > 120) {
      newErrors.age = "Inserisci un'età valida (1-120).";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Seleziona il genere.";
    }
    
    if (!formData.heightCm || formData.heightCm < 50 || formData.heightCm > 250) {
      newErrors.heightCm = "Inserisci un'altezza valida (50-250 cm).";
    }
    
    if (!formData.currentWeightKg || formData.currentWeightKg < 20 || formData.currentWeightKg > 300) {
      newErrors.currentWeightKg = "Inserisci un peso valido (20-300 kg).";
    }
    
    if (!formData.activityLevelMultiplier) {
      newErrors.activityLevelMultiplier = "Seleziona un livello di attività.";
    }
    
    if (!formData.physicalGoal) {
      newErrors.physicalGoal = "Seleziona un obiettivo.";
    }
    
    if (!formData.muscleMass) {
      newErrors.muscleMass = "Seleziona la tua massa muscolare percepita.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCalculate(formData as UserData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age' || name === 'heightCm' || name === 'currentWeightKg') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else if (name === 'activityLevelMultiplier') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8">
      <h4 className="text-lg font-medium text-gray-200 mb-6">Inserisci i tuoi dati</h4>

      <div className="space-y-6">
        <div className="form-group">
          <label htmlFor="age" className="block text-gray-300 mb-2 text-sm">
            Età (anni):
          </label>
          <input
            type="number"
            id="age"
            name="age"
            min="1"
            max="120"
            placeholder="Es. 30"
            className={`w-full rounded-md bg-secondary border ${errors.age ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          />
          {errors.age && (
            <p className="text-red-500 text-xs mt-2">{errors.age}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="gender" className="block text-gray-300 mb-2 text-sm">
            Genere Biologico:
          </label>
          <select
            id="gender"
            name="gender"
            className={`w-full rounded-md bg-secondary border ${errors.gender ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          >
            <option value="">Seleziona...</option>
            <option value="male">Maschio</option>
            <option value="female">Femmina</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-2">{errors.gender}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="heightCm" className="block text-gray-300 mb-2 text-sm">
            Altezza (cm):
          </label>
          <input
            type="number"
            id="heightCm"
            name="heightCm"
            min="50"
            max="250"
            placeholder="Es. 175"
            className={`w-full rounded-md bg-secondary border ${errors.heightCm ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          />
          {errors.heightCm && (
            <p className="text-red-500 text-xs mt-2">{errors.heightCm}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="currentWeightKg" className="block text-gray-300 mb-2 text-sm">
            Peso Attuale (kg):
          </label>
          <input
            type="number"
            id="currentWeightKg"
            name="currentWeightKg"
            step="0.1"
            min="20"
            max="300"
            placeholder="Es. 70.5"
            className={`w-full rounded-md bg-secondary border ${errors.currentWeightKg ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          />
          {errors.currentWeightKg && (
            <p className="text-red-500 text-xs mt-2">{errors.currentWeightKg}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="muscleMass" className="block text-gray-300 mb-2 text-sm">
            Come valuti la tua massa muscolare attuale?
          </label>
          <select
            id="muscleMass"
            name="muscleMass"
            className={`w-full rounded-md bg-secondary border ${errors.muscleMass ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          >
            <option value="">Seleziona...</option>
            <option value="minimally_muscular">Minimamente muscoloso</option>
            <option value="less_muscular">Poco muscoloso</option>
            <option value="normal">Normale</option>
            <option value="muscular">Muscoloso</option>
            <option value="very_muscular">Molto muscoloso</option>
          </select>
          {errors.muscleMass && (
            <p className="text-red-500 text-xs mt-2">{errors.muscleMass}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="activityLevelMultiplier" className="block text-gray-300 mb-2 text-sm">
            Livello di Attività Fisica:
          </label>
          <select
            id="activityLevelMultiplier"
            name="activityLevelMultiplier"
            className={`w-full rounded-md bg-secondary border ${errors.activityLevelMultiplier ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          >
            <option value="">Seleziona...</option>
            <option value="1.2">Sedentario (poco o nessun esercizio)</option>
            <option value="1.375">Leggermente attivo (esercizio leggero 1-3 giorni/settimana)</option>
            <option value="1.55">Moderatamente attivo (esercizio moderato 3-5 giorni/settimana)</option>
            <option value="1.725">Molto attivo (esercizio intenso 6-7 giorni/settimana)</option>
            <option value="1.9">Estremamente attivo (esercizio molto intenso, lavoro fisico o 2 allenamenti/giorno)</option>
          </select>
          {errors.activityLevelMultiplier && (
            <p className="text-red-500 text-xs mt-2">{errors.activityLevelMultiplier}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="physicalGoal" className="block text-gray-300 mb-2 text-sm">
            Obiettivo Fisico / Aspettativa:
          </label>
          <select
            id="physicalGoal"
            name="physicalGoal"
            className={`w-full rounded-md bg-secondary border ${errors.physicalGoal ? 'border-red-500' : 'border-gray-700'} p-3 text-white`}
            onChange={handleChange}
          >
            <option value="">Seleziona...</option>
            <option value="maintain">Rimanere Normopeso / Mantenere il peso attuale</option>
            <option value="leaner">Diventare più Snello / Definire</option>
            <option value="stronger">Diventare più Robusto / Aumentare Massa Muscolare (salutare)</option>
            <option value="healthyWeight">Raggiungere un Peso Salutare (BMI)</option>
            <option value="other">Altro</option>
          </select>
          {errors.physicalGoal && (
            <p className="text-red-500 text-xs mt-2">{errors.physicalGoal}</p>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 active:translate-y-0.5 transform transition text-white font-semibold uppercase tracking-wider py-4 rounded-md shadow-lg"
        >
          Scopri i Tuoi Dati Chiave!
        </button>
      </div>
    </form>
  );
};

export default CalculatorForm;
