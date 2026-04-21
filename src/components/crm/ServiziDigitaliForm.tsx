import React from 'react';
import { GoogleFormEmbed } from '@/components/ui/GoogleFormEmbed';

const ServiziDigitaliForm: React.FC = () => {
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSedPZc4Yty97jNnt5U_VUMl2zMR7FosrD8SBS5fAtUNfl2sew/viewform";

  return (
    <div className="max-w-5xl mx-auto w-full p-0 sm:p-4">
      <GoogleFormEmbed 
        url={GOOGLE_FORM_URL} 
        title="Servizi Digitali - Richiesta Consulenza" 
      />
    </div>
  );
};

export default ServiziDigitaliForm;
