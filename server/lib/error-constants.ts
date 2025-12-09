// Define ErrorType for type safety
export type ErrorType = 'counting_error_minus_1' | 'counting_error_plus_1' | 'counting_error_minus_2' | 'counting_error_plus_2' | 'operation_confusion' | 'input_error' | 'place_value' | 'off_by_ten_minus' | 'off_by_ten_plus' | 'doubling_error' | 'digit_reversal' | 'other';

// Define error type labels and descriptions (can be expanded)
export const ERROR_TYPE_LABELS: Record<string, string> = {
    'counting_error_minus_1': '🔢 Zählfehler: 1 zu wenig',
    'counting_error_plus_1': '🔢 Zählfehler: 1 zu viel',
    'counting_error_minus_2': '🔢 Zählfehler: 2 zu wenig',
    'counting_error_plus_2': '🔢 Zählfehler: 2 zu viel',
    'operation_confusion': '➕➖ Operationsverwechslung',
    'input_error': '⌨️ Eingabefehler',
    'place_value': '🔟 Stellenwertfehler',
    'off_by_ten_minus': '🔟 Um-10-daneben: 10 zu wenig',
    'off_by_ten_plus': '🔟 Um-10-daneben: 10 zu viel',
    'doubling_error': '✖️2 Verdopplungsfehler',
    'digit_reversal': '🔄 Zahlendreher',
    'other': '❓ Weitere Fehler',
};

export const ERROR_TYPE_DESCRIPTIONS: Record<string, string> = {
    'counting_error_minus_1': 'Kind stoppt beim Zählen zu früh (z.B. 3+5=7 statt 8).',
    'counting_error_plus_1': 'Kind zählt einen Schritt zu weit (z.B. 3+4=8 statt 7).',
    'counting_error_minus_2': 'Kind verzählt sich um 2 nach unten (größerer Zählfehler).',
    'counting_error_plus_2': 'Kind verzählt sich um 2 nach oben (größerer Zählfehler).',
    'operation_confusion': 'Plus und Minus werden verwechselt.',
    'input_error': 'Zahlendreher oder Tippfehler bei der Eingabe.',
    'place_value': 'Verständnis der Zehner- und Einerstruktur fehlt.',
    'off_by_ten_minus': 'Antwort ist 10 zu klein - Zehner vergessen oder falsch abgezogen (z.B. 12+9=11 statt 21).',
    'off_by_ten_plus': 'Antwort ist 10 zu groß - Zehner doppelt gezählt oder falsch addiert (z.B. 8+5=23 statt 13).',
    'doubling_error': 'Fehler bei Kernaufgaben des Verdoppelns (z.B. 7+7=13).',
    'digit_reversal': 'Zahlen werden spiegelverkehrt eingegeben (z.B. 17 statt 71).',
    'other': 'Fehlermuster nicht eindeutig klassifizierbar.',
};

// Heilpädagogische Interventionsvorschläge
export const ERROR_TYPE_INTERVENTIONS: Record<string, string[]> = {
    'counting_error_minus_1': [
        '→ Genaueres Zählen üben (nicht zu früh stoppen).',
        '→ Strategie: Zählendes Rechnen durch strategisches Erschließen ersetzen (Kraft der 5, Nachbaraufgaben).',
        '→ Kernaufgaben automatisieren (Blitzrechnen, Kopfrechenkarten).',
        '→ Zwanzigerfeld zur Visualisierung nutzen.'
    ],
    'counting_error_plus_1': [
        '→ Genaueres Zählen üben (nicht zu weit zählen).',
        '→ Strategie: Zählendes Rechnen durch strategisches Erschließen ersetzen (Kraft der 5, Nachbaraufgaben).',
        '→ Kernaufgaben automatisieren (Blitzrechnen, Kopfrechenkarten).',
        '→ Zwanzigerfeld zur Visualisierung nutzen.'
    ],
    'counting_error_minus_2': [
        '→ Intensives Zähltraining mit Selbstkontrolle.',
        '→ Strategien statt Zählen: Verdopplungen, Nachbaraufgaben.',
        '→ Material nutzen: Zwanzigerfeld, Rechenkette.',
        '→ Kleinere Schritte: Erst im ZR 10 festigen.'
    ],
    'counting_error_plus_2': [
        '→ Intensives Zähltraining mit Selbstkontrolle.',
        '→ Strategien statt Zählen: Verdopplungen, Nachbaraufgaben.',
        '→ Material nutzen: Zwanzigerfeld, Rechenkette.',
        '→ Kleinere Schritte: Erst im ZR 10 festigen.'
    ],
    'operation_confusion': [
        '→ Operation vor dem Rechnen laut benennen lassen (Achtsamkeit).',
        '→ Visuelle Unterscheidung der Symbole (Farben, Größen).',
        '→ Regelmäßige Übung von Additions- und Subtraktionsreihen mit Fokus auf die Operation.'
    ],
    'input_error': [
        '→ Selbstkontrolle fördern: Ergebnis erneut prüfen.',
        '→ Keine konzeptionelle Förderung nötig, Fokus auf Sorgfalt und Aufmerksamkeit.',
        '→ Bei häufigem Auftreten: Motorische Aspekte (Stifthaltung, Druck) prüfen.'
    ],
    'place_value': [
        '→ Konkrete Materialien nutzen: Dienes-Blöcke (Zehnerstangen & Einerwürfel), Perlenketten.',
        '→ Stellenwerttafel zur systematischen Erfassung von Zehnern und Einern.',
        '→ Zerlegungsaufgaben üben (z.B. 37 = 30 + 7).'
    ],
    'off_by_ten_minus': [
        '→ Zahlen in Zehner und Einer zerlegen (z.B. 37 = 30 + 7).',
        '→ Zehner bewusst machen: "Wie viele Zehner hat die Zahl?"',
        '→ Rechenketten mit farbigen Zehnern nutzen.',
        '→ Hunderterfeld zur Visualisierung von Zehnersprüngen.',
        '→ Stellenwerttafel: Zehner- und Einerstelle getrennt betrachten.'
    ],
    'off_by_ten_plus': [
        '→ Zehner nicht doppelt zählen üben.',
        '→ Systematisches Zerlegen: erst Zehner, dann Einer.',
        '→ Rechenketten: Zehnersprünge bewusst visualisieren.',
        '→ Hunderterfeld: "Wo lande ich bei +10?"',
        '→ Kontrollfragen: "Macht das Ergebnis Sinn? Ist es zu groß?"'
    ],
    'doubling_error': [
        '→ Kernaufgaben laut und rhythmisch wiederholen (Blitzlicht-Methode).',
        '→ Verdopplungen und Halbierungen als zueinander gehörig verstehen.',
        '→ Memory-Spiel mit Verdopplungsaufgaben.'
    ],
    'digit_reversal': [
        '→ Zahlen vor dem Rechnen laut vorlesen lassen.',
        '→ Zahlen visuell hervorheben (unterschiedliche Farben/Größen).',
        '→ Leserichtung bewusst machen (links → rechts).',
        '→ Bei häufigem Auftreten: Visuelle Wahrnehmung prüfen.'
    ],
    'other': [
        '→ Kind beim Rechnen beobachten und Lösungsweg beschreiben lassen.',
        '→ Individuelle Fehlerursache durch diagnostisches Gespräch ermitteln.',
        '→ Aufgabe in Teilschritte zerlegen und Verständnis prüfen.'
    ]
};
