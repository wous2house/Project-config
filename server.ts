import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Ensure pdfs directory exists
const pdfsDir = path.join(process.cwd(), "save-pdf");
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pdfsDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/save-pdf", upload.single("pdf"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Geen PDF ontvangen." });
      }
      res.json({ success: true, message: "PDF succesvol opgeslagen.", filename: req.file.filename });
    } catch (error) {
      console.error("Error saving PDF:", error);
      res.status(500).json({ success: false, message: "Er is een fout opgetreden bij het opslaan van de PDF." });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      const { email, toelichting, summary, totalPrice, totalYearly, isCorporate } = req.body;

      // Nodemailer transporter setup
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "mail.webdroids.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || "aanvraag@webdroids.nl",
          pass: process.env.SMTP_PASS,
        },
      });

      // Email content
      const mailOptions = {
        from: '"Webdroids Aanvraag" <aanvraag@webdroids.nl>',
        to: email ? `aanvraag@webdroids.nl, ${email}` : "aanvraag@webdroids.nl",
        subject: "Nieuwe Project Aanvraag - Webdroids",
        html: `
          <h2>Nieuwe Project Aanvraag</h2>
          <p>Er is een nieuwe aanvraag binnengekomen via de configurator.</p>
          
          <h3>Samenvatting:</h3>
          <pre style="font-family: inherit; white-space: pre-wrap;">${summary}</pre>
          
          <h3>Toelichting:</h3>
          <p>${toelichting || "Geen toelichting opgegeven."}</p>
          
          <h3>Geschatte kosten:</h3>
          ${isCorporate 
            ? '<p><strong>Eenmalig:</strong> In overleg</p>' 
            : `<p><strong>Eenmalig:</strong> € ${totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} excl. BTW</p>`
          }
          ${!isCorporate && totalYearly > 0 ? `<p><strong>Jaarlijks:</strong> € ${totalYearly.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} excl. BTW</p>` : ''}
          
          ${email ? `<p><strong>Kopie gestuurd naar:</strong> ${email}</p>` : ''}
        `,
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: "Aanvraag succesvol verzonden!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Er is een fout opgetreden bij het verzenden van de aanvraag." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
