import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { MessageSquareText } from 'lucide-react'; // Importa l'icona di WhatsApp da Lucide React

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const leadName = location.state?.leadName || 'utente';

  // IL TUO NUMERO WHATSAPP A CUI GLI UTENTI INVIERANNO IL MESSAGGIO.
  // Formato internazionale: +[prefisso][numero], senza spazi o trattini.
  const yourWhatsAppNumber = "+14158329132"; // Il numero americano per il test

  // Messaggio precompilato che l'utente invierà cliccando sul bottone WhatsApp.
  // È fondamentale usare encodeURIComponent() per formattare correttamente gli spazi e i caratteri speciali nell'URL.
  const predefinedMessage = encodeURIComponent("Ciao Samuroad, aspetto i risultati. Grazie."); // Messaggio leggermente più corto e diretto

  // Costruisce il link WhatsApp: aprirà la chat con il tuo numero e il messaggio precompilato.
  const whatsappLink = `https://wa.me/${yourWhatsAppNumber}?text=${predefinedMessage}`;

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
              **I tuoi dati sono stati registrati con successo!**
            </p>

            <p>
              Per ricevere **immediatamente** la tua analisi numerica dettagliata e personalizzata su WhatsApp, devi cliccare sul bottone verde qui sotto. Questo aprirà la tua app WhatsApp con un messaggio già pronto. Ti preghiamo di **non modificare questo messaggio** e di inviarlo così com'è per autorizzarci a fornirti i tuoi risultati.
            </p>

            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-sm">
              <li>Il tuo BMI e categoria di peso attuale</li>
              <li>Il range di peso salutare per te</li>
              <li>Le tue calorie di mantenimento stimate</li>
              <li>Il peso target calcolato per il tuo obiettivo</li>
              <li>I tempi stimati per raggiungerlo</li>
              <li>Una nota interpretativa personalizzata</li>
            </ul>

            {/* Bottone WhatsApp con Messaggio Precompilato */}
            <div className="mt-8">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-xl"
                aria-label="Richiedi risultati su WhatsApp"
              >
                <MessageSquareText className="mr-3 h-7 w-7" /> {/* Icona di WhatsApp */}
                Clicca qui per avere subito i risultati!
              </a>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              Assicurati di aver inserito un numero WhatsApp corretto nel modulo precedente per ricevere i tuoi calcoli. Ti risponderemo non appena riceveremo il tuo messaggio.
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
