import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';
import { CalculationResults, UserData } from '@/components/Calculator';

const LeadCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const calculatedData = location.state as CalculationResults & { userInputs: UserData };

  const [leadName, setLeadName] = useState('');
  const [dialCode, setDialCode] = useState('+39');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!calculatedData) {
    navigate('/');
    return null;
  }

  const clearErrors = () => {
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!leadName.trim()) {
      newErrors.leadName = "Inserisci il tuo nome.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Inserisci il tuo numero WhatsApp.";
    } else if (!/^\d{6,}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Il numero di telefono non è valido.";
    }

    if (!consentChecked) {
      newErrors.consent = "Devi accettare l'informativa sulla privacy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getGoalText = (goal: string) => {
    const goals = {
      maintain: "Mantenere peso attuale",
      leaner: "Diventare più snello",
      stronger: "Aumentare massa muscolare",
      healthyWeight: "Raggiungere peso salutare",
      other: "Altro"
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const getMuscleMassText = (mass: string) => {
    const masses = {
      minimally_muscular: "Minimamente muscoloso",
      less_muscular: "Poco muscoloso", 
      normal: "Normale",
      muscular: "Muscoloso",
      very_muscular: "Molto muscoloso"
    };
    return masses[mass as keyof typeof masses] || mass;
  };

  const generateWhatsAppMessage = (name: string) => {
    const targetWeight = parseFloat(calculatedData.targetWeight.toString()).toFixed(1);
    const currentWeight = Number(calculatedData.userInputs.currentWeightKg);
    const targetWeightNum = parseFloat(calculatedData.targetWeight.toString());
    const weightDiff = Math.abs(currentWeight - targetWeightNum);
    const weightDiffText = weightDiff > 0.1 
      ? `${weightDiff.toFixed(1)} kg da ${currentWeight > targetWeightNum ? 'perdere' : 'guadagnare'}`
      : "Peso attuale idoneo per l'obiettivo";

    let message = `Ciao ${name}! 👋\n\nGrazie per aver usato il calcolatore Samuroad! Ecco la tua analisi personalizzata:\n\n`;
    message += `IL TUO PROFILO BASE:\n--------------------\n`;
    message += `👤 Età: ${calculatedData.userInputs.age} anni\n`;
    message += `🚻 Sesso: ${calculatedData.userInputs.gender === 'male' ? 'Maschio' : 'Femmina'}\n`;
    message += `📏 Altezza: ${calculatedData.userInputs.heightCm} cm\n`;
    message += `⚖️ Peso Attuale: ${calculatedData.userInputs.currentWeightKg} kg\n`;
    message += `🎯 Obiettivo: ${getGoalText(calculatedData.userInputs.physicalGoal)}\n`;
    message += `💪 Massa Muscolare: ${getMuscleMassText(calculatedData.userInputs.muscleMass)}\n\n`;

    message += `I TUOI DATI CALCOLATI:\n--------------------\n`;
    message += `✅ BMI: ${calculatedData.bmi}\n`;
    message += `📊 Categoria: ${calculatedData.weightCategory}\n`;
    message += `⚖️ Range Salutare: ${calculatedData.healthyWeightRange} kg\n`;
    message += `🎯 Peso Target: ${targetWeight} kg\n`;
    message += `⚖️ ${weightDiffText}\n\n`;

    message += `IL TUO BILANCIO ENERGETICO:\n--------------------\n`;
    message += `🔥 Calorie Mantenimento: ~${calculatedData.maintenanceCalories} kcal/giorno\n\n`;

    message += `TEMPI STIMATI:\n--------------------\n`;
    message += `⏳ ${calculatedData.timeToGoal}\n\n`;

    message += `NOTA INTERPRETATIVA:\n--------------------\n`;
    message += `💡 ${calculatedData.interpretiveNote}\n\n`;

    message += `---\nRicorda: queste sono stime basate su calcoli generali. Per un piano personalizzato, consulta un professionista.\n\n`;
    message += `Visita: https://www.samuroad.com\n\nA presto,\nIl Team Samuroad`;

    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
  
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    try {
      const finalPhoneNumber = dialCode + phoneNumber;
      const whatsappMessage = generateWhatsAppMessage(leadName);
  
      // Prepara i dati per SheetDB: stringifica gli oggetti annidati
      const dataToSend = {
        lead_name: leadName,
        lead_phone: finalPhoneNumber,
        consent_given: consentChecked,
        user_inputs: JSON.stringify(calculatedData.userInputs),
        calculated_data: JSON.stringify({
          bmi: calculatedData.bmi,
          weightCategory: calculatedData.weightCategory,
          healthyWeightRange: calculatedData.healthyWeightRange,
          targetWeight: calculatedData.targetWeight,
          weightDifference: calculatedData.weightDifference,
          maintenanceCalories: calculatedData.maintenanceCalories,
          timeToGoal: calculatedData.timeToGoal
        }),
        interpretive_note: calculatedData.interpretiveNote,
        whatsapp_message_ready: whatsappMessage
      };
  
      // Chiamata a SheetDB
      await fetch('https://n8n.lappamasters.top/webhook/a42d6638-ae23-41cb-adec-698703872683', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

  
      navigate('/confirmation', { state: { leadName } });
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrors({ submit: "Errore nell'invio. Riprova o contattaci." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Torna al Calcolatore
        </button>

        <div className="bg-card border border-neutral-800 rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-title text-primary mb-4">
              📊 I Tuoi Dati Personalizzati Sono Pronti! 📊
            </h1>
            <p className="text-gray-300 font-body">
              Abbiamo calcolato le informazioni chiave per aiutarti a comprendere meglio il tuo corpo e i tuoi obiettivi.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-title text-white mb-4">
              Per ricevere GRATUITAMENTE via WhatsApp la tua analisi numerica dettagliata:
            </h2>
            
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300">
              <li>Il tuo <strong>Indice di Massa Corporea (BMI)</strong> e la tua attuale categoria di peso</li>
              <li>Il tuo <strong>range di peso salutare</strong> di riferimento</li>
              <li>La stima del tuo <strong>metabolismo basale (BMR)</strong> e delle <strong>calorie di mantenimento</strong> giornaliere</li>
              <li>Le <strong>calorie giornaliere consigliate</strong> per raggiungere il tuo obiettivo specifico</li>
              <li>Una <strong>stima realistica dei tempi</strong> necessari per raggiungere il peso target calcolato</li>
              <li>Una <strong>nota interpretativa</strong> dei tuoi dati</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="leadName" className="block text-white mb-3 font-medium">
                Il Tuo Nome:
              </label>
              <input
                type="text"
                id="leadName"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Mario Rossi"
                className={`w-full rounded-lg bg-gray-800 border ${errors.leadName ? 'border-red-500' : 'border-gray-600'} p-4 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors`}
              />
              {errors.leadName && <p className="text-red-500 text-sm mt-2">{errors.leadName}</p>}
            </div>

            <div>
              <label className="block text-white mb-3 font-medium">
                Numero WhatsApp:
              </label>
              <div className="space-y-3">
                <CountrySelect value={dialCode} onValueChange={setDialCode} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456789"
                  className={`w-full rounded-lg bg-gray-800 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-600'} p-4 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors`}
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            </div>

            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
              <p className="text-amber-400 text-sm">
                ⚠️ <strong>Importante:</strong> Inserisci il numero WhatsApp corretto. È l'unico modo per inviarti i tuoi calcoli!
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consentCheckbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1.5 h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="consentCheckbox" className="text-sm text-gray-300 leading-relaxed">
                Dichiaro di aver letto l'<a href="https://samuroad.com/informativa-sulla-privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Informativa sulla Privacy</a> e acconsento al trattamento dei miei dati per ricevere l'analisi numerica personalizzata via WhatsApp e per eventuali comunicazioni da Samuroad relative a approfondimenti o servizi.
              </label>
            </div>
            {errors.consent && <p className="text-red-500 text-sm">{errors.consent}</p>}

            {errors.submit && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-lg"
            >
              {isSubmitting ? 'Invio in corso...' : 'Sì, Voglio i Miei Dati Dettagliati su WhatsApp!'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Massima riservatezza e nessun invio indesiderato.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadCapture;
