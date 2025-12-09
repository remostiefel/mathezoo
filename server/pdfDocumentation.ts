
/**
 * PDF DOCUMENTATION GENERATOR
 * 
 * Generates professional documentation for Mathemat
 */

export function generateMathematDocumentationHTML(): string {
  const date = new Date().toLocaleDateString('de-DE');

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Mathemat - Neuroadaptive Learning System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
      background: linear-gradient(135deg, #f8f9ff 0%, #fff5f8 100%);
    }
    .header {
      text-align: center;
      padding: 40px 0;
      background: linear-gradient(135deg, #7c3aed 0%, #14b8a6 50%, #f59e0b 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 64px;
      margin-bottom: 10px;
      display: inline-block;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .tagline {
      font-size: 24px;
      opacity: 0.95;
      margin-bottom: 20px;
    }
    .version {
      font-size: 14px;
      opacity: 0.8;
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      page-break-inside: avoid;
    }
    h2 {
      color: #7c3aed;
      font-size: 28px;
      margin-bottom: 20px;
      border-left: 5px solid #7c3aed;
      padding-left: 15px;
    }
    h3 {
      color: #14b8a6;
      font-size: 20px;
      margin: 20px 0 10px 0;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .feature-card {
      background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
    }
    .feature-card h4 {
      color: #7c3aed;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .feature-number {
      font-size: 36px;
      font-weight: bold;
      color: #7c3aed;
      margin-bottom: 5px;
    }
    .feature-label {
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
    }
    ul {
      margin: 15px 0 15px 25px;
    }
    li {
      margin-bottom: 8px;
      color: #475569;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .science-box {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .contact-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
    }
    .contact-box h3 {
      color: #16a34a;
      margin-bottom: 15px;
    }
    .contact-info {
      font-size: 18px;
      color: #15803d;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #64748b;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #7c3aed;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">💡</div>
    <h1>Mathemat</h1>
    <div class="tagline">Neuroadaptive Learning System</div>
    <div class="version">Version 3.0 · ${date}</div>
  </div>

  <div class="section">
    <h2>🎯 Was ist Mathemat?</h2>
    <p style="font-size: 18px; margin-bottom: 20px;">
      Mathemat ist ein <strong>KI-gestütztes Mathematik-Fördersystem</strong>, das sich automatisch 
      an jeden Lernenden anpasst. Mit progressivem Stage-System, adaptiven Darstellungen und intelligenter 
      Fehleranalyse revolutioniert Mathemat das mathematische Lernen.
    </p>
    
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-number">15</div>
        <div class="feature-label">Progression Stages</div>
        <p style="margin-top: 10px;">Von Zehnerraum bis Hunderterraum mit klaren Meilensteinen</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-number">44</div>
        <div class="feature-label">Neuronales Netzwerk</div>
        <p style="margin-top: 10px;">Brain-Inspired Learning mit Hebbian-Plastizität</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-number">5</div>
        <div class="feature-label">KI-Modelle</div>
        <p style="margin-top: 10px;">Ensemble-Prediction für optimale Aufgabenauswahl</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-number">∞</div>
        <div class="feature-label">Individuelle Lernwege</div>
        <p style="margin-top: 10px;">Jedes Kind auf seinem optimalen Level</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🧠 Das Neuroadaptive Lernsystem</h2>
    
    <h3>Progressive Stage-System (15 Stufen)</h3>
    <p>Transparente Lernreise mit klaren Meilensteinen:</p>
    <ul>
      <li><strong>Stage 1-3:</strong> Zehnerraum-Fundament (Erste Schritte, Subtraktion, Zehnerergänzung)</li>
      <li><strong>Stage 4-7:</strong> Zwanzigerraum ohne Übergang (Festigung, Automatisierung)</li>
      <li><strong>Stage 8-11:</strong> Zehnerübergang meistern (Zerlegungsstrategien)</li>
      <li><strong>Stage 12-15:</strong> Hunderterraum (Stellenwert, komplexe Operationen)</li>
    </ul>

    <h3>Adaptive Multi-Representation System (AMRS)</h3>
    <p>Intelligente Reduktion visueller Hilfen:</p>
    <ul>
      <li><strong>RL 5:</strong> Volle Unterstützung - Alle 5 Darstellungspositionen</li>
      <li><strong>RL 3:</strong> Mittlere Unterstützung - Zentrale Visualisierungen</li>
      <li><strong>RL 1:</strong> Minimale Unterstützung - Nur Basisdarstellung</li>
      <li><strong>RL 0:</strong> Meisterschaft - Rein symbolisch</li>
    </ul>

    <h3>44-Neuronen Brain-Inspired Network</h3>
    <p>Gehirnähnliches Lernen mit:</p>
    <ul>
      <li><strong>Hebbian Learning:</strong> Neurons that fire together, wire together</li>
      <li><strong>Synaptic Homeostasis:</strong> Selbstregulation und Stabilität</li>
      <li><strong>Memory Consolidation:</strong> Langzeitgedächtnisbildung während Pausen</li>
      <li><strong>Transfer Learning:</strong> Wissenstransfer zwischen Zahlenräumen</li>
    </ul>
  </div>

  <div class="section">
    <h2>🎓 Wissenschaftliche Fundierung</h2>
    
    <div class="science-box">
      <h3>Basiert auf 50+ Jahren Forschung</h3>
      <table>
        <tr>
          <th>Theorie</th>
          <th>Forscher</th>
          <th>Anwendung in Mathemat</th>
        </tr>
        <tr>
          <td>Operatives Prinzip</td>
          <td>Wittmann (1985)</td>
          <td>Systematische Musterexploration</td>
        </tr>
        <tr>
          <td>Darstellungsvernetzung</td>
          <td>Bruner (1966)</td>
          <td>Enaktiv, ikonisch, symbolisch</td>
        </tr>
        <tr>
          <td>ZPD-Prinzip</td>
          <td>Vygotsky (1978)</td>
          <td>Zone der proximalen Entwicklung</td>
        </tr>
        <tr>
          <td>Cognitive Load Theory</td>
          <td>Sweller (1988)</td>
          <td>Optimierung kognitiver Belastung</td>
        </tr>
        <tr>
          <td>Embodied Cognition</td>
          <td>Lakoff & Núñez (2000)</td>
          <td>Körperliches Zahlenverständnis</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="section">
    <h2>🤖 Intelligente Fehleranalyse</h2>
    
    <div class="highlight-box">
      <h3>Bayesianische KI auf 5 Ebenen</h3>
      <ul>
        <li><strong>Prozess-Ebene:</strong> Rechenfehler vs. Flüchtigkeitsfehler</li>
        <li><strong>Strategie-Ebene:</strong> Zählend, zerlegend oder strukturiert?</li>
        <li><strong>Zeit-Ebene:</strong> Zu langsam (Unsicherheit) oder zu schnell (Impulsivität)?</li>
        <li><strong>Muster-Ebene:</strong> Systematische Wissenslücken erkennen</li>
        <li><strong>Emotions-Ebene:</strong> Frustration und Mathangst identifizieren</li>
      </ul>
    </div>

    <h3>Automatische Anpassungen</h3>
    <ul>
      <li>Reduziert Visualisierungen bei Kompetenzfortschritt</li>
      <li>Erhöht Unterstützung bei Schwierigkeiten</li>
      <li>Generiert maßgeschneiderte Übungsaufgaben</li>
      <li>Erstellt heilpädagogische Fehlerberichte für Lehrpersonen</li>
    </ul>
  </div>

  <div class="section">
    <h2>👩‍🏫 Für Lehrpersonen</h2>
    
    <h3>Dashboard-Funktionen</h3>
    <ul>
      <li><strong>Echtzeit-Übersicht:</strong> Alle Schüler*innen auf einen Blick</li>
      <li><strong>Fehleranalyse:</strong> Kritische Muster sofort erkennen</li>
      <li><strong>PDF-Berichte:</strong> Professionelle heilpädagogische Dokumentation</li>
      <li><strong>Klassenmanagement:</strong> Mehrere Klassen organisieren</li>
      <li><strong>Fortschrittstracking:</strong> Individuelle Lernverläufe visualisiert</li>
    </ul>

    <h3>Einsatzszenarien</h3>
    <ul>
      <li><strong>Förderunterricht:</strong> Gezielte Unterstützung für schwächere Schüler*innen</li>
      <li><strong>Binnendifferenzierung:</strong> Alle üben gleichzeitig auf eigenem Level</li>
      <li><strong>Hausaufgaben:</strong> Automatische Korrektur und adaptive Schwierigkeit</li>
      <li><strong>Lernstandsdiagnose:</strong> Präzise Erfassung mathematischer Kompetenzen</li>
    </ul>
  </div>

  <div class="section">
    <h2>🎮 Für Lernende</h2>
    
    <h3>Spielerisch zum Erfolg</h3>
    <ul>
      <li><strong>Meilensteine:</strong> Erfolge feiern mit einzigartigen Achievements</li>
      <li><strong>Adaptive Feedbacks:</strong> Positive Rückmeldungen passend zum Fortschritt</li>
      <li><strong>Fortschritts-Visualisierung:</strong> Interaktive Lernkarte</li>
      <li><strong>Keine Stigmatisierung:</strong> Jedes Kind auf eigenem Level</li>
    </ul>

    <h3>Progressive Lernreise</h3>
    <ul>
      <li><strong>ZR 5-10:</strong> Grundlagen - Zahlenverständnis, Kraft der 5, Zerlegungen</li>
      <li><strong>ZR 20:</strong> Strategieentwicklung - Zehnerübergang, Verdoppeln, Halbieren</li>
      <li><strong>ZR 100:</strong> Meisterschaft - Stellenwert, flexible Strategien, Automatisierung</li>
    </ul>
  </div>

  <div class="section">
    <h2>💡 Technische Highlights</h2>
    
    <h3>AMRS - Adaptive Multi-Representation System</h3>
    <p>5 Positionen mit progressiver Reduktion:</p>
    <ul>
      <li><strong>Center:</strong> Zwanzigerfeld/Hunderterfeld (Hauptvisualisierung)</li>
      <li><strong>Top:</strong> Zahlenstrahl (Ordinales Verständnis)</li>
      <li><strong>Bottom:</strong> Zerlegungsbaum (Teil-Ganzes-Beziehungen)</li>
      <li><strong>Left:</strong> Symbolische Operation (Notation)</li>
      <li><strong>Right:</strong> Strategiehinweis (Metakognitive Unterstützung)</li>
    </ul>

    <h3>Ensemble Prediction System</h3>
    <p>5 konkurrierende KI-Modelle für optimale Aufgabenwahl:</p>
    <ul>
      <li><strong>Bayesian Predictor:</strong> Probabilistische Vorhersage</li>
      <li><strong>Neural Network:</strong> Pattern Recognition</li>
      <li><strong>Symbolic Reasoning:</strong> Regelbasierte Expertise</li>
      <li><strong>Case-Based:</strong> Analogie-Lernen</li>
      <li><strong>Hybrid Model:</strong> Kombination aller Ansätze</li>
    </ul>

    <h3>Advanced Features</h3>
    <ul>
      <li><strong>Sleep Consolidation:</strong> Gedächtnisbildung während Pausen</li>
      <li><strong>Transfer Learning:</strong> ZR20 → ZR100 Wissenstransfer</li>
      <li><strong>Meta-Learning:</strong> System lernt wie Kinder am besten lernen</li>
      <li><strong>Placeholder Tasks:</strong> Algebraisches Denken (□ + 2 = 6)</li>
    </ul>
  </div>

  <div class="section">
    <div class="contact-box">
      <h3>📧 Kontakt & Verantwortlichkeit</h3>
      <p><strong>Remo Stiefel</strong></p>
      <div class="contact-info">
        ✉️ lerncare@gmail.com
      </div>
      <p style="margin-top: 20px; color: #64748b;">
        Entwickler und Verantwortlicher für Mathemat<br>
        Heilpädagoge & Mathematikdidaktiker<br>
        Wissenschaftliche Fundierung basierend auf 50+ Jahren Forschung
      </p>
    </div>
  </div>

  <div class="section">
    <h2>⚖️ Haftungsausschluss</h2>
    <p style="color: #64748b;">
      <strong>Mathemat</strong> ist ein pädagogisches Werkzeug zur Unterstützung des mathematischen Lernens. 
      Die App ersetzt keine professionelle pädagogische oder psychologische Beratung. 
      Alle generierten Analysen und Empfehlungen dienen als Orientierung und sollten von qualifizierten 
      Fachpersonen interpretiert werden. Die Nutzung erfolgt auf eigene Verantwortung.
    </p>
    
    <h3 style="margin-top: 20px;">Datenschutz</h3>
    <p style="color: #64748b;">
      Lernerdaten werden ausschließlich zur Verbesserung des individuellen Lernerlebnisses verwendet. 
      Keine Weitergabe an Dritte. Lehrpersonen haben Zugriff nur auf Daten ihrer eigenen Schüler*innen.
    </p>
  </div>

  <div class="footer">
    <p><strong>Mathemat © 2025</strong></p>
    <p>Neuroadaptive Learning System · Wissenschaftlich fundierte KI-Mathematik-Förderung</p>
    <p style="margin-top: 10px;">Erstellt am ${date}</p>
  </div>
</body>
</html>
  `;
}
