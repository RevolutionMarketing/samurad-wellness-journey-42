
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const leadName = location.state?.leadName || 'utente';

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

        <div className="bg-card border border-neutral-800 rounded-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-title text-primary mb-4">
              Perfetto, {leadName}! 🎉
            </h1>
          </div>

          <div className="space-y-4 text-gray-300 font-body">
            <p className="text-lg">
              <strong>I tuoi dati sono stati registrati con successo!</strong>
            </p>
            
            <p>
              Riceverai a breve su WhatsApp la tua analisi numerica dettagliata e personalizzata con:
            </p>
            
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-sm">
              <li>Il tuo BMI e categoria di peso attuale</li>
              <li>Il range di peso salutare per te</li>
              <li>Le tue calorie di mantenimento stimate</li>
              <li>Il peso target calcolato per il tuo obiettivo</li>
              <li>I tempi stimati per raggiungerlo</li>
              <li>Una nota interpretativa personalizzata</li>
            </ul>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6">
              <p className="text-primary font-medium">
                📱 Controlla WhatsApp nei prossimi minuti!
              </p>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              Se non ricevi il messaggio entro 5 minuti, controlla la cartella spam o contattaci direttamente.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Fai un Nuovo Calcolo
            </button>
            
            <a
              href="https://www.samuroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Visita Samuroad.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
