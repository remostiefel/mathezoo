/**
 * PDF ERROR REPORT GENERATOR
 * 
 * Generiert heilpädagogische Fehlerberichte als PDF
 * mit systematischer Fehleranalyse (6+1 Kategorien)
 */

export interface ErrorReportData {
  student: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  errorHistory: any[];
  errorPatterns: any;
  summary: {
    totalErrors: number;
    recentErrors: number;
    criticalPatterns: any[];
    mostCommonErrors: any[];
  };
}

export function generateErrorReportHTML(data: ErrorReportData): string {
  const studentName = `${data.student.firstName || ''} ${data.student.lastName || ''}`.trim() || data.student.username;
  const date = new Date().toLocaleDateString('de-DE');

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Fehlerbericht - ${studentName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1e40af;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    h2 {
      color: #1e40af;
      font-size: 20px;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    .summary-card h3 {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #dc2626;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 14px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .severity-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .severity-minor { background: #fef3c7; color: #92400e; }
    .severity-moderate { background: #fed7aa; color: #9a3412; }
    .severity-severe { background: #fecaca; color: #991b1b; }
    .error-task {
      font-family: 'Courier New', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    .pattern-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .pattern-box h4 {
      color: #92400e;
      margin-bottom: 8px;
    }
    .recommendations {
      background: #dbeafe;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
    }
    .recommendations h3 {
      color: #1e40af;
      margin-bottom: 10px;
    }
    .recommendations ul {
      margin-left: 20px;
    }
    .recommendations li {
      margin-bottom: 8px;
      color: #1e3a8a;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Heilpädagogischer Fehlerbericht</h1>
    <div class="meta">
      <strong>Schüler/in:</strong> ${studentName} (${data.student.username})<br>
      <strong>Erstellt am:</strong> ${date}<br>
      <strong>Analyse-Zeitraum:</strong> Gesamter Lernverlauf
    </div>
  </div>

  <div class="section">
    <h2>Übersicht</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Gesamtfehler</h3>
        <div class="value">${data.summary.totalErrors}</div>
      </div>
      <div class="summary-card">
        <h3>Fehler (7 Tage)</h3>
        <div class="value">${data.summary.recentErrors}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Kritische Fehlermuster</h2>
    ${data.summary.criticalPatterns.length === 0 ? '<p>Keine kritischen Fehlermuster erkannt.</p>' : ''}
    ${data.summary.criticalPatterns.map((pattern: any) => `
      <div class="pattern-box">
        <h4>${translatePattern(pattern.pattern)}</h4>
        <p><strong>Häufigkeit:</strong> ${pattern.count}x | <strong>Schweregrad:</strong> ${(pattern.severity * 100).toFixed(0)}%</p>
        <p><strong>Beispiele:</strong> ${pattern.examples.map((ex: string) => `<span class="error-task">${ex}</span>`).join(', ')}</p>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Häufigste Fehlertypen</h2>
    <table>
      <thead>
        <tr>
          <th>Fehlertyp</th>
          <th>Anzahl</th>
          <th>Beispiele</th>
        </tr>
      </thead>
      <tbody>
        ${data.summary.mostCommonErrors.map((error: any) => `
          <tr>
            <td>${translatePattern(error.pattern)}</td>
            <td>${error.count}</td>
            <td>${error.examples.map((ex: string) => `<span class="error-task">${ex}</span>`).join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Detaillierte Fehlertabelle (alle Fehler)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 80px;">Datum</th>
          <th style="width: 60px;">Uhrzeit</th>
          <th style="width: 100px;">Aufgabe</th>
          <th style="width: 70px;">Eingabe</th>
          <th style="width: 70px;">Korrekt</th>
          <th style="width: 150px;">Fehlertyp</th>
          <th style="width: 80px;">Schwere</th>
        </tr>
      </thead>
      <tbody>
        ${data.errorHistory.map((error: any) => {
          const task = error.task;
          const date = new Date(error.timestamp);
          const dateStr = date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit',
            year: '2-digit'
          });
          const timeStr = date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const severityClass = `severity-${error.errorAnalysis.errorSeverity}`;
          const errorTypeName = translatePattern(error.errorAnalysis.errorType || error.errorAnalysis.errorPattern);

          return `
            <tr>
              <td>${dateStr}</td>
              <td>${timeStr}</td>
              <td><span class="error-task">${task.number1} ${task.operation} ${task.number2}</span></td>
              <td style="text-align: center;"><strong>${task.studentAnswer ?? '—'}</strong></td>
              <td style="text-align: center;">${task.correctAnswer}</td>
              <td>${errorTypeName}</td>
              <td><span class="severity-badge ${severityClass}">${error.errorAnalysis.errorSeverity}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="recommendations">
    <h3>Kompakte Förderempfehlungen</h3>
    ${generateCompactRecommendations(data)}
  </div>

  <div class="footer">
    <p>MathPath Lern-App | Automatisch generierter Bericht</p>
    <p>Dieser Bericht dient der pädagogischen Diagnostik und Förderplanung.</p>
  </div>
</body>
</html>
  `;
}

function translatePattern(pattern: string): string {
  // 12 FEHLERKATEGORIEN (Zählfehler + Um-10-daneben differenziert)
  const errorTypeTranslations: Record<string, string> = {
    'counting_error_minus_1': 'Zählfehler: 1 zu wenig',
    'counting_error_plus_1': 'Zählfehler: 1 zu viel',
    'counting_error_minus_2': 'Zählfehler: 2 zu wenig',
    'counting_error_plus_2': 'Zählfehler: 2 zu viel',
    'operation_confusion': 'Zeichen verwechselt',
    'input_error': 'Vertippt',
    'place_value': 'Zehner-Problem',
    'off_by_ten_minus': 'Um-10-daneben: 10 zu wenig',
    'off_by_ten_plus': 'Um-10-daneben: 10 zu viel',
    'doubling_error': 'Kernaufgaben-Fehler',
    'digit_reversal': 'Zahlendreher',
    'other': 'Weitere Fehler'
  };

  return errorTypeTranslations[pattern] || pattern;
}

function generateCompactRecommendations(data: ErrorReportData): string {
  const errorTypes = data.summary.mostCommonErrors;
  if (errorTypes.length === 0) {
    return '<p>Keine spezifischen Förderbedarfe erkannt.</p>';
  }

  let html = '<table style="width: 100%; font-size: 14px;">';
  html += `
    <thead>
      <tr style="background: #1e40af; color: white;">
        <th style="padding: 10px; text-align: left;">Fehlertyp</th>
        <th style="padding: 10px; text-align: left;">Konkrete Maßnahmen</th>
        <th style="padding: 10px; width: 100px; text-align: center;">Priorität</th>
      </tr>
    </thead>
    <tbody>
  `;

  errorTypes.slice(0, 5).forEach((error: any, index: number) => {
    const percentage = data.summary.totalErrors > 0 
      ? Math.round((error.count / data.summary.totalErrors) * 100)
      : 0;
    
    let priority = 'NIEDRIG';
    let priorityColor = '#22c55e';
    if (percentage > 30) {
      priority = 'HOCH';
      priorityColor = '#dc2626';
    } else if (percentage > 15) {
      priority = 'MITTEL';
      priorityColor = '#f59e0b';
    }

    const measures = getCompactMeasures(error.pattern);
    const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';

    html += `
      <tr style="background: ${bgColor};">
        <td style="padding: 12px; vertical-align: top;">
          <strong>${translatePattern(error.pattern)}</strong><br>
          <span style="font-size: 12px; color: #64748b;">${error.count}x (${percentage}%)</span>
        </td>
        <td style="padding: 12px; vertical-align: top;">
          ${measures}
        </td>
        <td style="padding: 12px; text-align: center; vertical-align: top;">
          <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">
            ${priority}
          </span>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  return html;
}

function getCompactMeasures(pattern: string): string {
  const measures: Record<string, string> = {
    'counting_error_minus_1': '• Kernaufgaben automatisieren<br>• Zwanzigerfeld nutzen<br>• Strategien statt Zählen',
    'counting_error_plus_1': '• Kernaufgaben automatisieren<br>• Zwanzigerfeld nutzen<br>• Strategien statt Zählen',
    'counting_error_minus_2': '• <strong>DRINGEND:</strong> Intensivtraining ZR 10<br>• Material: Zwanzigerfeld, Rechenkette<br>• Strategien statt Zählen fördern',
    'counting_error_plus_2': '• <strong>DRINGEND:</strong> Intensivtraining ZR 10<br>• Material: Zwanzigerfeld, Rechenkette<br>• Strategien statt Zählen fördern',
    'operation_confusion': '• Operation vor Rechnen benennen lassen<br>• Visuelle Unterscheidung (+= grün, -= rot)<br>• Aufmerksames Lesen üben',
    'input_error': '• Selbstkontrolle fördern ("Stopp-Denk-Kontrollier")<br>• Kein konzeptioneller Förderbedarf',
    'place_value': '• Material: Dienes-Blöcke, Hunderterfeld<br>• Zehner/Einer getrennt rechnen<br>• Stellenwerttafel nutzen',
    'off_by_ten_minus': '• Zerlegen in Zehner + Einer (23 = 20 + 3)<br>• Rechenketten mit farbigen Zehnern<br>• Hunderterfeld zur Visualisierung',
    'off_by_ten_plus': '• Systematisches Zerlegen üben<br>• Kontrollfragen: "Macht das Sinn?"<br>• Hunderterfeld nutzen',
    'doubling_error': '• Kernaufgaben rhythmisch üben<br>• Memory-Spiel mit Verdopplungen<br>• Zusammenhang Verdoppeln ↔ Halbieren',
    'digit_reversal': '• Zahlen laut vorlesen lassen<br>• Leserichtung betonen (links → rechts)<br>• Farbige Hervorhebungen',
    'other': '• Kind beim Rechnen beobachten<br>• Lösungsweg erklären lassen<br>• Diagnostisches Gespräch',
    // Legacy patterns
    'decade_transition_error': '• Zwanzigerfeld nutzen<br>• "Kraft der 5" einführen<br>• Zehnerübergang trainieren',
    'inverse_thinking_start': '• Platzhalter-Training<br>• Umkehraufgaben üben<br>• Material: Waage',
    'inverse_thinking_middle': '• Platzhalter-Training<br>• Umkehraufgaben üben<br>• Material: Waage'
  };

  return measures[pattern] || '• Individuelle Beobachtung<br>• Lösungsweg erklären lassen';
}

function generateRecommendations(data: ErrorReportData): string[] {
  const recommendations: string[] = [];
  const patterns = data.summary.criticalPatterns;
  const errorTypes = data.summary.mostCommonErrors;

  // Systematische Empfehlungen basierend auf den 11 Fehlerkategorien

  // Fehlerkategorie 1a-1d: Zählfehler (differenziert)
  if (errorTypes.some((e: any) => e.pattern === 'counting_error_minus_1')) {
    recommendations.push('**Zählfehler (1 zu wenig)**: Das Kind stoppt beim Zählen zu früh. Genaueres Zählen üben und Rechenstrategien fördern statt zählendes Rechnen.');
    recommendations.push('Üben Sie Kernaufgaben und verwenden Sie das Zwanzigerfeld zur Visualisierung.');
  }
  if (errorTypes.some((e: any) => e.pattern === 'counting_error_plus_1')) {
    recommendations.push('**Zählfehler (1 zu viel)**: Das Kind zählt zu weit. Präzises Zählen mit Stoppkontrolle üben und Rechenstrategien fördern.');
    recommendations.push('Automatisieren Sie Kernaufgaben durch rhythmische Übungen.');
  }
  if (errorTypes.some((e: any) => e.pattern === 'counting_error_minus_2')) {
    recommendations.push('**Zählfehler (2 zu wenig)**: Größerer Zählfehler deutet auf Unsicherheit. DRINGEND Strategien statt Zählen fördern.');
    recommendations.push('Intensives Training mit Zwanzigerfeld und Rechenkette. Erst im ZR 10 festigen, dann erweitern.');
  }
  if (errorTypes.some((e: any) => e.pattern === 'counting_error_plus_2')) {
    recommendations.push('**Zählfehler (2 zu viel)**: Größerer Zählfehler deutet auf Unsicherheit. DRINGEND Strategien statt Zählen fördern.');
    recommendations.push('Intensives Training mit Zwanzigerfeld und Rechenkette. Erst im ZR 10 festigen, dann erweitern.');
  }

  // Fehlerkategorie 2: Operations-Verwechslung
  if (errorTypes.some((e: any) => e.pattern === 'operation_confusion')) {
    recommendations.push('**Operationszeichen bewusst unterscheiden**: Lassen Sie das Kind vor dem Rechnen die Operation benennen. Nutzen Sie visuelle Unterscheidung von + und -.');
    recommendations.push('Üben Sie aufmerksames Lesen der Aufgabenstellung.');
  }

  // Fehlerkategorie 3: Tippfehler
  if (errorTypes.some((e: any) => e.pattern === 'input_error')) {
    recommendations.push('**Eingabekontrolle verbessern**: Ermutigen Sie das Kind zur sorgfältigen Eingabe und Selbstkontrolle der Antwort.');
    recommendations.push('Das mathematische Verständnis ist vorhanden - es handelt sich um Flüchtigkeitsfehler.');
  }

  // Fehlerkategorie 4: Stellenwert-Fehler
  if (errorTypes.some((e: any) => e.pattern === 'place_value')) {
    recommendations.push('**Stellenwertverständnis aufbauen**: Verwenden Sie Dienes-Blöcke oder das Hunderterfeld. Üben Sie das Bündeln von Einern zu Zehnern.');
    recommendations.push('Gezielte Übungen zum Zehnerübergang mit konkretem Material durchführen.');
  }

  // Fehlerkategorie 5: Um-10-daneben
  if (errorTypes.some((e: any) => e.pattern === 'off_by_ten')) {
    recommendations.push('**Zehnerbündelung üben**: Trainieren Sie das Zerlegen und Zusammensetzen von Zahlen mit Fokus auf Zehner und Einer.');
    recommendations.push('Nutzen Sie Rechenketten und strukturierte Materialien zur Visualisierung von Zehnern.');
  }

  // Fehlerkategorie 6: Verdopplungsfehler
  if (errorTypes.some((e: any) => e.pattern === 'doubling_error')) {
    recommendations.push('**Kernaufgaben automatisieren**: Verdopplungen und Halbierungen sind fundamental. Nutzen Sie Spiele und rhythmische Übungen zum Einprägen (zum Beispiel: 5+5=10, 6+6=12).');
    recommendations.push('Üben Sie den Zusammenhang zwischen Verdoppeln und Halbieren systematisch.');
  }

  // Fehlerkategorie 7: Zahlendreher
  if (errorTypes.some((e: any) => e.pattern === 'digit_reversal')) {
    recommendations.push('**Zahlen laut vorlesen lassen**: Betonen Sie die Leserichtung von links nach rechts.');
    recommendations.push('Nutzen Sie farbige Hervorhebungen und vergrößerte Zahlen. Bei häufigem Auftreten: Visuelle Wahrnehmung prüfen.');
  }

  // Fehlerkategorie 8: Weitere Fehler
  if (errorTypes.some((e: any) => e.pattern === 'other')) {
    recommendations.push('**Individuelle Beobachtung**: Kind beim Rechnen beobachten und Lösungsweg erklären lassen.');
    recommendations.push('Diagnostisches Gespräch führen um spezifische Ursachen zu ermitteln.');
  }

  // Legacy Aufgabenmuster (falls noch vorhanden)
  if (patterns.some((p: any) => p.pattern.includes('decade_transition'))) {
    recommendations.push('**Zehnerübergang intensiv üben** - Verwende Zwanzigerfeld und Rechenkette');
    recommendations.push('Strategie "Kraft der Fünf" einführen (zum Beispiel: erst zur 10, dann weiter)');
  }

  if (patterns.some((p: any) => p.pattern.includes('inverse_thinking'))) {
    recommendations.push('**Umkehraufgaben üben** - Platzhalter-Training intensivieren');
    recommendations.push('Gleichungen mit konkretem Material (z.B. Waage) visualisieren');
  }

  if (data.summary.recentErrors > 10) {
    recommendations.push('**Kognitive Belastung reduzieren** - Kleinere Zahlenbereiche wählen');
    recommendations.push('Mehr visuelle Unterstützung (alle 5 Darstellungen) aktivieren');
  }

  if (recommendations.length === 0) {
    recommendations.push('Aktuelle Schwierigkeitsstufe beibehalten und weiter üben');
    recommendations.push('Erfolge verstärken und Selbstvertrauen stärken');
  }

  return recommendations;
}