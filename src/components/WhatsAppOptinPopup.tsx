
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { CalculationResults, UserData } from './Calculator';

interface WhatsAppOptinPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (leadName: string) => void;
  calculatedData: CalculationResults & { userInputs: UserData };
}

const WhatsAppOptinPopup = ({ isOpen, onClose, onSubmitSuccess, calculatedData }: WhatsAppOptinPopupProps) => {
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && phoneInputRef.current && !phoneInstanceRef.current) {
      // Dinamically import and initialize intl-tel-input
      import('intl-tel-input').then((module) => {
        const intlTelInput = module.default;
        phoneInstanceRef.current = intlTelInput(phoneInputRef.current!, {
          initialCountry: "auto",
          geoIpLookup: function(callback: (countryCode: string) => void) {
            fetch("https://ipapi.co/json")
              .then(res => res.json())
              .then(data => callback(data.country_code || "it"))
              .catch(() => callback("it"));
          },
          separateDialCode: true,
          utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/utils.js"
        });
      }).catch(error => {
        console.warn('Could not load intl-tel-input:', error);
      });
    }

    return () => {
      if (phoneInstanceRef.current) {
        phoneInstanceRef.current.destroy();
        phoneInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const clearErrors = () => {
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!leadName.trim()) {
      newErrors.leadName = "Inserisci il tuo nome.";
    }

    if (phoneInstanceRef.current && phoneInstanceRef.current.isValidNumber) {
      if (!phoneInstanceRef.current.isValidNumber()) {
        newErrors.leadPhone = "Numero di telefono non valido. Includi il prefisso internazionale.";
      }
    } else if (!leadPhone.trim()) {
      newErrors.leadPhone = "Inserisci il tuo numero WhatsApp.";
    }

    if (!consentChecked) {
      newErrors.consent = "Devi accettare l'informativa sulla privacy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateWhatsAppMessage = (name: string) => {
    const targetWeight = parseFloat(calculatedData.targetWeight).toFixed(1);
    const weightDiff = Math.abs(parseFloat(calculatedData.userInputs.currentWeightKg.toString()) - parseFloat(calculatedData.targetWeight));
    const weightDiffText = weightDiff > 0.1 
      ? `${weightDiff.toFixed(1)} kg da ${parseFloat(calculatedData.userInputs.currentWeightKg.toString()) > parseFloat(calculatedData.targetWeight) ? 'perdere' : 'guadagnare'}`
      : "Peso attuale idoneo per l'obiettivo";

    let message = `Ciao ${name}! 👋\n\nGrazie per aver usato il calcolatore Samuroad! Ecco la tua analisi personalizzata:\n\n`;
    message += `IL TUO PROFILO BASE:\n--------------------\n`;
    message += `👤 Età: ${calculatedData.userInputs.age.toString()} anni\n`;
    message += `🚻 Sesso: ${calculatedData.userInputs.gender === 'male' ? 'Maschio' : 'Femmina'}\n`;
    message += `📏 Altezza: ${calculatedData.userInputs.heightCm.toString()} cm\n`;
    message += `⚖️ Peso Attuale: ${calculatedData.userInputs.currentWeightKg.toString()} kg\n`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let finalPhoneNumber = leadPhone;
      if (phoneInstanceRef.current && phoneInstanceRef.current.getNumber) {
        finalPhoneNumber = phoneInstanceRef.current.getNumber();
      }

      const whatsappMessage = generateWhatsAppMessage(leadName);

      const dataToSend = {
        lead_name: leadName,
        lead_phone: finalPhoneNumber,
        consent_given: consentChecked,
        user_inputs: calculatedData.userInputs,
        calculated_data: {
          bmi: calculatedData.bmi,
          weightCategory: calculatedData.weightCategory,
          healthyWeightRange: calculatedData.healthyWeightRange,
          targetWeight: calculatedData.targetWeight,
          weightDifference: calculatedData.weightDifference,
          maintenanceCalories: calculatedData.maintenanceCalories,
          timeToGoal: calculatedData.timeToGoal
        },
        interpretive_note: calculatedData.interpretiveNote,
        whatsapp_message_ready: whatsappMessage
      };

      // TODO: Replace with your actual API endpoint
      console.log('Data to send to backend:', dataToSend);
      
      // Simulated API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmitSuccess(leadName);
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrors({ submit: 'Errore nell\'invio. Riprova o contattaci.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-title text-primary">📊 I Tuoi Dati Personalizzati Sono Pronti! 📊</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6 text-gray-300 font-body">
            <p>Abbiamo calcolato le informazioni chiave per aiutarti a comprendere meglio il tuo corpo e i tuoi obiettivi.</p>
            
            <p><strong>Per ricevere GRATUITAMENTE via WhatsApp la tua analisi numerica dettagliata, che include:</strong></p>
            
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Il tuo <strong>Indice di Massa Corporea (BMI)</strong> e la tua attuale categoria di peso</li>
              <li>Il tuo <strong>range di peso salutare</strong> di riferimento</li>
              <li>La stima del tuo <strong>metabolismo basale (BMR)</strong> e delle <strong>calorie di mantenimento</strong> giornaliere</li>
              <li>Le <strong>calorie giornaliere consigliate</strong> per raggiungere il tuo obiettivo specifico</li>
              <li>Una <strong>stima realistica dei tempi</strong> necessari per raggiungere il peso target calcolato</li>
              <li>Una <strong>nota interpretativa</strong> dei tuoi dati</li>
            </ul>

            <p><strong>Inserisci il tuo nome e il numero di telefono che usi con WhatsApp:</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="leadName" className="block text-gray-300 mb-2 text-sm">
                Il Tuo Nome:
              </label>
              <input
                type="text"
                id="leadName"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Mario Rossi"
                className={`w-full rounded-md bg-gray-800 border ${errors.leadName ? 'border-red-500' : 'border-gray-600'} p-3 text-white`}
              />
              {errors.leadName && <p className="text-red-500 text-xs mt-2">{errors.leadName}</p>}
            </div>

            <div>
              <label htmlFor="leadPhone" className="block text-gray-300 mb-2 text-sm">
                Numero WhatsApp:
              </label>
              <input
                type="tel"
                id="leadPhone"
                ref={phoneInputRef}
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className={`w-full rounded-md bg-gray-800 border ${errors.leadPhone ? 'border-red-500' : 'border-gray-600'} p-3 text-white`}
              />
              {errors.leadPhone && <p className="text-red-500 text-xs mt-2">{errors.leadPhone}</p>}
            </div>

            <p className="text-amber-400 text-sm">
              ⚠️ <strong>Importante:</strong> Inserisci il numero WhatsApp corretto, completo di prefisso internazionale. È l'unico modo per inviarti i tuoi calcoli!
            </p>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consentCheckbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="consentCheckbox" className="text-xs text-gray-300">
                Dichiaro di aver letto l'<a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">Informativa sulla Privacy</a> e acconsento al trattamento dei miei dati per ricevere l'analisi numerica personalizzata via WhatsApp e per eventuali comunicazioni da Samuroad relative a approfondimenti o servizi.
              </label>
            </div>
            {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-4 rounded-md transition-colors"
            >
              {isSubmitting ? 'Invio in corso...' : 'Sì, Voglio i Miei Dati Dettagliati su WhatsApp!'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Massima riservatezza e nessun invio indesiderato.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppOptinPopup;
