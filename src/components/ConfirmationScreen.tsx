
import { useState } from 'react';

interface ConfirmationScreenProps {
  leadName: string;
  onNewCalculation: () => void;
}

const ConfirmationScreen = ({ leadName, onNewCalculation }: ConfirmationScreenProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const pageUrl = window.location.href;

  const handleShareWhatsApp = () => {
    const shareText = encodeURIComponent(`Ho appena usato il calcolatore gratuito di Samuroad per scoprire i miei dati di benessere personalizzati! Provalo anche tu: ${pageUrl}`);
    window.open(`whatsapp://send?text=${shareText}`, '_blank');
  };

  const handleShareTelegram = () => {
    const shareText = encodeURIComponent("Ho appena usato il calcolatore gratuito di Samuroad per scoprire i miei dati di benessere personalizzati! Provalo anche tu!");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${shareText}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Errore nel copiare il link:', err);
    }
  };

  return (
    <div className="confirmation-section p-6 sm:p-8 text-center">
      <h2 className="text-2xl font-title text-white mb-4">
        Fantastico, {leadName}! 🎉
      </h2>
      
      <div className="space-y-6 font-body">
        <p className="text-gray-300 text-lg">
          La tua analisi personalizzata Samuroad è in viaggio verso il tuo WhatsApp. 
          Controlla i messaggi nei prossimi minuti!
        </p>
        
        <div className="bg-secondary rounded-lg p-5 border-l-4 border-primary">
          <p className="text-gray-300 text-sm">
            Questi dati ti hanno offerto spunti utili? Immagina quanto potrebbero esserlo anche per i tuoi amici e conoscenti! 
            Aiutali a scoprire informazioni preziose per il loro benessere: condividi ora questo strumento gratuito e veloce di Samuroad! 
            Potrebbe essere il primo passo verso la loro trasformazione.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleShareWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Condividi su WhatsApp
          </button>
          
          <button
            onClick={handleShareTelegram}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Condividi su Telegram
          </button>
          
          <button
            onClick={handleCopyLink}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            {linkCopied ? 'Link Copiato!' : 'Copia Link'}
          </button>
          
          <a
            href="https://www.instagram.com/SamuroadOfficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-md font-medium transition-colors inline-block"
          >
            Instagram @SamuroadOfficial
          </a>
        </div>

        <p className="text-gray-400 text-sm italic">
          Un'idea in più? Fai uno screenshot dei tuoi risultati (se ti va!) e condividilo nelle tue storie su Instagram menzionando @SamuroadOfficial!
        </p>

        <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
          <h3 className="font-title font-medium text-white text-lg mb-3">
            Pronto per Trasformare i Dati in Risultati Concreti?
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Ora che hai una mappa dettagliata del tuo punto di partenza e degli obiettivi, è il momento di agire! 
            Scopri come l'approccio unico e gli strumenti innovativi dell'ecosistema Samuroad possono guidarti 
            passo dopo passo a raggiungere la forma fisica e il benessere che desideri, in modo efficace, 
            sostenibile e personalizzato.
          </p>
          <a
            href="https://www.samuroad.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-md transition-colors"
          >
            Esplora l'Ecosistema Samuroad!
          </a>
        </div>

        <button
          onClick={onNewCalculation}
          className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-title text-lg transition-colors"
        >
          Nuovo Calcolo
        </button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
