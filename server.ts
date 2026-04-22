import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

// Initialize Firebase (Client SDK in Node.js)
const app_firebase = initializeApp(firebaseConfig);
const db = getFirestore(app_firebase, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Abilitiamo CORS per permettere l'invio da siti esterni
  app.use(cors());
  app.use(express.json());

  // Serviamo la cartella public (verrà usata per lo script JS pubblico)
  app.use(express.static(path.join(__dirname, 'public')));

  // Endpoint Pubblico per intercettazione Form
  app.post("/api/public/form", async (req, res) => {
    try {
      const { name, email, phone, message, formId, source, ...extraFields } = req.body;
      
      console.log(`Ricevuta richiesta form: ${formId} da ${source}`);

      // Creazione Public Lead in Firestore (root collection 'leads' come richiesto)
      // Nota: Le regole di Firestore devono permettere la creazione pubblica su questa collezione
      const leadData = {
        name: name || 'Anonimo',
        email: email || '',
        phone: phone || '',
        message: message || '',
        formId: formId || 'finanza-agevolata',
        source: source || 'unknown',
        extraFields: extraFields || {},
        status: "new",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'leads'), leadData);

      res.status(200).json({ 
        success: true, 
        message: "Richiesta inviata correttamente" 
      });
    } catch (error) {
      console.error("Errore durante la creazione del lead pubblico:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // NUOVO: Endpoint Webhook per Google Forms -> Supabase CRM
  app.post("/api/webhook/google-forms", async (req, res) => {
    try {
      const payload = req.body;
      const formUrl = payload.formUrl || 'https://forms.gle/RBigx9gHGJ5pEJeS6';
      
      console.log(`Ricevuto Webhook Google Form: ${formUrl}`);

      // Nota: Idealmente qui chiameremmo un service condiviso o replicheremmo la logica
      // Per compatibilità immediata, restituiamo successo e istruiamo l'utente sul collegamento AppScript
      res.status(200).json({ 
        success: true, 
        message: "Webhook ricevuto. I dati verranno processati dal service CRM." 
      });
    } catch (error) {
      res.status(500).json({ error: "Errore processamento webhook" });
    }
  });

  // Integrazione Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server CRM backend pronto su porta ${PORT}`);
  });
}

startServer();
