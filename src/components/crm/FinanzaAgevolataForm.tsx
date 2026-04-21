import React from 'react';
import { GoogleFormEmbed } from '@/components/ui/GoogleFormEmbed';

const FinanzaAgevolataForm: React.FC = () => {
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe8m7zAgapf8vIeuhQiJ_-OWIIT26IGQlatJCAlugticuLOVA/viewform?embedded=true";

  return (
    <div className="max-w-5xl mx-auto w-full p-0 sm:p-4">
      <GoogleFormEmbed 
        url={GOOGLE_FORM_URL} 
        title="Finanza Agevolata - Form di Qualificazione" 
      />
    </div>
  );
};

export default FinanzaAgevolataForm;
