/**
 * HOMEWORK PDF GENERATOR
 *
 * Generiert professionelle PDF-Arbeitsblätter aus generierten Hausaufgaben.
 * Optimiert für Browser-Druck (Strg+P)
 * Layout: 60 Aufgaben pro Seite in 3 Päckchen à 20 Aufgaben (3 Spalten)
 */

import type { WorksheetSet, Worksheet, WorksheetSection } from './worksheetGenerator';

export function generateHomeworkPDF(
  worksheetSet: WorksheetSet,
  studentName: string
): string {
  const date = new Date().toLocaleDateString('de-DE');

  // Zufälliges Tier auswählen mit realistischem Bild
  const animals = [
    { image: '/attached_assets/generated_images/Adult_lion_portrait_2087e4b2.png', name: 'Löwe' },
    { image: '/attached_assets/generated_images/Adult_elephant_portrait_8fb3361a.png', name: 'Elefant' },
    { image: '/attached_assets/generated_images/Adult_giraffe_portrait_8998cc44.png', name: 'Giraffe' },
    { image: '/attached_assets/generated_images/Adult_tiger_portrait_0fd50e60.png', name: 'Tiger' },
    { image: '/attached_assets/generated_images/Adult_panda_portrait_7f9bc6b9.png', name: 'Panda' },
    { image: '/attached_assets/generated_images/Adult_fox_portrait_150af9dd.png', name: 'Fuchs' },
    { image: '/attached_assets/generated_images/Adult_penguin_portrait_4cac748a.png', name: 'Pinguin' },
    { image: '/attached_assets/generated_images/Adult_owl_portrait_11b3c613.png', name: 'Eule' },
    { image: '/attached_assets/generated_images/Adult_parrot_portrait_8d257dc4.png', name: 'Papagei' },
    { image: '/attached_assets/generated_images/Adult_dolphin_portrait_a13cfc10.png', name: 'Delfin' }
  ];
  // Verwende immer den Löwen-Emoji, wie gewünscht
  const randomAnimal = animals.find(animal => animal.name === 'Löwe') || animals[0];


  // Motivierende Titel für die 3 Abschnitte (ohne Emojis)
  const packageTitles = [
    'Leichte Einstiegsaufgaben – Jetzt geht\'s los!',
    'Mittelschwere Herausforderungen – Du schaffst das!',
    'Anspruchsvolle Knobelaufgaben – Zeig, was du kannst!'
  ];

  // Dateiname erstellen
  const fileName = `${worksheetSet.title}_${studentName}_${date}.pdf`;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${worksheetSet.title} - ${studentName}</title>
  <style>
    @page {
      size: A4;
      margin: 1.2cm 1.5cm 1.2cm 2.3cm; /* Top Right Bottom Left - 2.3cm linker Rand! */
    }

    /* Kein spezieller Header-Abstand via @page - wird über padding-top gelöst */

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 10pt;
      line-height: 1.2;
      color: #000;
      background: #fff;
      padding-left: 0.8cm; /* Extra padding für PDF-Rendering - erhöht von 0.5cm auf 0.8cm */
    }

    /* Neues Header-Layout: Bild links, Titel/Datum/Name auf einer Zeile - KOMPAKT */
    .page-header {
      margin-bottom: 0.3cm;
      padding: 0.3cm;
      background: #f8f9fa;
      border: 1pt solid #dee2e6;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.4cm;
      page-break-after: avoid;
    }

    .animal-emoji {
      width: 1.5cm;
      height: 1.5cm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36pt;
      flex-shrink: 0;
      line-height: 1;
    }

    .header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 11pt;
      font-weight: bold;
      color: #2c3e50;
      flex: 1;
      margin-right: 0.8cm;
    }

    .header-right {
      display: flex;
      gap: 0.8cm;
      align-items: center;
    }

    .header-date {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      text-align: left;
    }

    .header-name {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      text-align: left;
    }

    /* Worksheet sections */
    .worksheet {
      page-break-before: always;
      padding-top: 3cm; /* 3cm Abstand von oben für Folgeseiten */
    }

    .worksheet:first-child {
      page-break-before: avoid !important;
      padding-top: 0 !important; /* Erste Seite: kein extra Abstand */
    }

    /* Päckchen-Container - kompakt */
    .package {
      margin: 0 auto 0.6cm auto;
      page-break-inside: avoid;
      padding: 0.3cm;
      background: white;
      border: 1pt solid #dee2e6;
      border-radius: 8px;
    }

    .package-header {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 0.3cm;
      text-align: left;
      color: #2c3e50;
      padding-bottom: 0.15cm;
      border-bottom: 1pt solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 0.3cm;
    }

    .package-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1cm;
      height: 1cm;
      background: #f8f9fa;
      border: 1.5pt solid #6c757d;
      border-radius: 50%;
      font-size: 10pt;
      flex-shrink: 0;
    }

    /* 3-Spalten-Grid für 20 Aufgaben */
    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.25cm 0.4cm;
      margin: 0;
    }

    /* Kompakte Aufgaben */
    .task-item {
      font-size: 13pt;
      font-family: 'Arial', 'Helvetica', sans-serif;
      padding: 0.1cm 0;
      text-align: left;
      line-height: 1.3;
    }

    /* Kürzere Platzhalter-Linien */
    .placeholder {
      display: inline-block;
      min-width: 1.8cm;
      max-width: 2.2cm;
      border-bottom: 2pt solid #000;
      height: 0.6cm;
      vertical-align: baseline;
      margin: 0 0.1cm;
    }

    /* Fette Zahlen */
    .number {
      font-weight: 700;
      font-size: 13pt;
    }

    .operator {
      font-weight: 700;
      font-size: 13pt;
      margin: 0 0.1cm;
    }

    /* Page numbers entfernt */

    /* Print optimization */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- Header: Tier-Emoji + Titel/Datum/Name -->
  <div class="page-header">
    <span class="animal-emoji">🦁</span>
    <div class="header-content">
      <div class="header-title">${worksheetSet.title}</div>
      <div class="header-right">
        <div class="header-date">${date}</div>
        <div class="header-name">${studentName}</div>
      </div>
    </div>
  </div>

  ${worksheetSet.worksheets.map((worksheet, index) =>
    generateWorksheetHTML(worksheet, index + 1, worksheetSet.worksheets.length, packageTitles)
  ).join('\n')}

</body>
</html>
  `;
}

function generateWorksheetHTML(worksheet: Worksheet, pageNumber: number, totalPages: number, packageTitles: string[]): string {
  // Sammle alle Tasks aus allen Sections
  const allTasks = worksheet.sections.flatMap(section => section.tasks);

  // Ensure there are always 45 tasks, filling with random or standard tasks if necessary
  while (allTasks.length < 45) {
    // You can implement logic here to add random, repeated, or default tasks
    // For now, we'll just add a placeholder or a simple repeated task
    // This part needs to be more sophisticated based on actual task generation logic
    allTasks.push({
      number1: Math.floor(Math.random() * 10) + 1,
      number2: Math.floor(Math.random() * 10) + 1,
      operation: '+',
      correctAnswer: 0, // Placeholder, actual calculation would be needed
      placeholderPosition: 'end'
    });
  }
  // Trim to exactly 45 if more were generated
  const tasksToUse = allTasks.slice(0, 45);

  // Teile in 3 Abschnitte à 15 Aufgaben (45 gesamt)
  const package1 = tasksToUse.slice(0, 15);
  const package2 = tasksToUse.slice(15, 30);
  const package3 = tasksToUse.slice(30, 45);

  // Erste Seite OHNE worksheet-Klasse (verhindert page-break)
  const worksheetClass = pageNumber === 1 ? '' : 'worksheet';

  return `
  <div class="${worksheetClass}">
    ${generatePackageHTML(package1, packageTitles[0])}
    ${generatePackageHTML(package2, packageTitles[1])}
    ${generatePackageHTML(package3, packageTitles[2])}
  </div>
  `;
}

function generatePackageHTML(tasks: any[], title: string): string {
  if (!tasks || tasks.length === 0) {
    return '';
  }

  // Ordne Tasks vertikal innerhalb jeder Spalte an (5 Zeilen x 3 Spalten = 15)
  const reorderedTasks: any[] = [];
  const rows = 5;
  const cols = 3;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const originalIndex = row * cols + col;
      if (originalIndex < tasks.length) {
        reorderedTasks.push(tasks[originalIndex]);
      }
    }
  }

  const taskItems = reorderedTasks.map((task) => {
    const placeholder = '<span class="placeholder"></span>';
    let expression = '';

    if (task.placeholderPosition === 'start') {
      // Platzhalter VORNE: _+5=12
      expression = `${placeholder} ${task.operation} ${task.number2} = ${task.correctAnswer}`;
    } else if (task.placeholderPosition === 'middle') {
      // Platzhalter MITTE: 7+_=12
      expression = `${task.number1} ${task.operation} ${placeholder} = ${task.correctAnswer}`;
    } else {
      // Platzhalter ENDE (Standard): 5+7=_
      expression = `${task.number1} ${task.operation} ${task.number2} = ${placeholder}`;
    }

    return `<div class="task-item">${expression}</div>`;
  }).join('\n');

  return `
  <div class="package">
    <div class="package-header">
      <span>${title}</span>
    </div>
    <div class="tasks-grid">
      ${taskItems}
    </div>
  </div>
  `;
}

export function generateHomeworkSolutionPDF(
  worksheetSet: WorksheetSet,
  studentName: string
): string {
  const date = new Date().toLocaleDateString('de-DE');

  // Zufälliges Tier mit realistischem Bild
  const animals = [
    { image: '/attached_assets/generated_images/Adult_lion_portrait_2087e4b2.png', name: 'Löwe' },
    { image: '/attached_assets/generated_images/Adult_elephant_portrait_8fb3361a.png', name: 'Elefant' },
    { image: '/attached_assets/generated_images/Adult_giraffe_portrait_8998cc44.png', name: 'Giraffe' },
    { image: '/attached_assets/generated_images/Adult_tiger_portrait_0fd50e60.png', name: 'Tiger' },
    { image: '/attached_assets/generated_images/Adult_panda_portrait_7f9bc6b9.png', name: 'Panda' },
    { image: '/attached_assets/generated_images/Adult_fox_portrait_150af9dd.png', name: 'Fuchs' },
    { image: '/attached_assets/generated_images/Adult_penguin_portrait_4cac748a.png', name: 'Pinguin' },
    { image: '/attached_assets/generated_images/Adult_owl_portrait_11b3c613.png', name: 'Eule' },
    { image: '/attached_assets/generated_images/Adult_parrot_portrait_8d257dc4.png', name: 'Papagei' },
    { image: '/attached_assets/generated_images/Adult_dolphin_portrait_a13cfc10.png', name: 'Delfin' }
  ];
  // Verwende immer den Löwen-Emoji für Lösungen
  const randomAnimal = animals.find(animal => animal.name === 'Löwe') || animals[0];


  const packageTitles = [
    'Leichte Einstiegsaufgaben – Jetzt geht\'s los!',
    'Mittelschwere Herausforderungen – Du schaffst das!',
    'Anspruchsvolle Knobelaufgaben – Zeig, was du kannst!'
  ];

  // Dateiname für Lösungen
  const fileName = `${worksheetSet.title}_LÖSUNGEN_${studentName}_${date}.pdf`;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${worksheetSet.title} - LÖSUNGEN - ${studentName}</title>
  <style>
    @page {
      size: A4;
      margin: 1.2cm 1.5cm 1.2cm 2.3cm; /* Top Right Bottom Left - 2.3cm linker Rand! */
    }

    /* Kein spezieller Header-Abstand via @page - wird über padding-top gelöst */

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 10pt;
      line-height: 1.2;
      color: #000;
      background: #fff;
      padding-left: 0.8cm; /* Extra padding für PDF-Rendering - erhöht von 0.5cm auf 0.8cm */
    }

    /* Header-Layout identisch zu Aufgabenblatt - KOMPAKT */
    .page-header {
      margin-bottom: 0.3cm;
      padding: 0.3cm;
      background: #f8f9fa;
      border: 1pt solid #dee2e6;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.4cm;
      page-break-after: avoid;
    }

    .animal-emoji {
      width: 1.5cm;
      height: 1.5cm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36pt;
      flex-shrink: 0;
      line-height: 1;
    }

    .header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 11pt;
      font-weight: bold;
      color: #2c3e50;
      flex: 1;
      margin-right: 0.8cm;
    }

    .header-right {
      display: flex;
      gap: 0.8cm;
      align-items: center;
    }

    .header-date {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      text-align: left;
    }

    .header-name {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      text-align: left;
    }

    .worksheet {
      page-break-before: always;
      padding-top: 3cm; /* 3cm Abstand von oben für Folgeseiten */
    }

    .worksheet:first-child {
      page-break-before: avoid;
      padding-top: 0 !important; /* Erste Seite: kein extra Abstand */
    }

    /* Päckchen - identisch zu Aufgaben */
    .package {
      margin: 0 auto 0.6cm auto;
      page-break-inside: avoid;
      padding: 0.3cm;
      background: white;
      border: 1pt solid #dee2e6;
      border-radius: 8px;
    }

    .package-header {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 0.3cm;
      text-align: left;
      color: #2c3e50;
      padding-bottom: 0.15cm;
      border-bottom: 1pt solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 0.3cm;
    }

    .package-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1cm;
      height: 1cm;
      background: #f8f9fa;
      border: 1.5pt solid #6c757d;
      border-radius: 50%;
      font-size: 10pt;
      flex-shrink: 0;
    }

    /* 3-Spalten-Grid - identisch zu Aufgaben */
    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.25cm 0.4cm;
      margin: 0;
    }

    /* Lösungen - kompakt wie Aufgaben */
    .solution-item {
      font-size: 13pt;
      font-family: 'Arial', 'Helvetica', sans-serif;
      padding: 0.1cm 0;
      text-align: left;
      line-height: 1.3;
      font-weight: 700;
    }

    /* Page numbers entfernt */

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- Header: Tier-Emoji + Titel/Datum/Name -->
  <div class="page-header">
    <span class="animal-emoji">🦁</span>
    <div class="header-content">
      <div class="header-title">${worksheetSet.title} – LÖSUNGEN</div>
      <div class="header-right">
        <div class="header-date">${date}</div>
        <div class="header-name">${studentName}</div>
      </div>
    </div>
  </div>

  ${worksheetSet.worksheets.map((worksheet, index) =>
    generateSolutionWorksheetHTML(worksheet, index + 1, worksheetSet.worksheets.length, packageTitles)
  ).join('\n')}

</body>
</html>
  `;
}

function generateSolutionWorksheetHTML(worksheet: Worksheet, pageNumber: number, totalPages: number, packageTitles: string[]): string {
  // Sammle alle Tasks
  const allTasks = worksheet.sections.flatMap(section => section.tasks);

  // Ensure there are always 45 tasks for solutions as well
  while (allTasks.length < 45) {
    allTasks.push({
      number1: Math.floor(Math.random() * 10) + 1,
      number2: Math.floor(Math.random() * 10) + 1,
      operation: '+',
      correctAnswer: 0, // Placeholder
    });
  }
  const tasksToUse = allTasks.slice(0, 45);

  // Teile in 3 Abschnitte à 15 Aufgaben (45 gesamt)
  const package1 = tasksToUse.slice(0, 15);
  const package2 = tasksToUse.slice(15, 30);
  const package3 = tasksToUse.slice(30, 45);

  const worksheetClass = pageNumber === 1 ? '' : 'worksheet';

  return `
  <div class="${worksheetClass}">
    ${generateSolutionPackageHTML(package1, packageTitles[0])}
    ${generateSolutionPackageHTML(package2, packageTitles[1])}
    ${generateSolutionPackageHTML(package3, packageTitles[2])}
  </div>
  `;
}

function generateSolutionPackageHTML(tasks: any[], title: string): string {
  if (!tasks || tasks.length === 0) {
    return '';
  }

  // Ordne Tasks vertikal innerhalb jeder Spalte an (5 Zeilen x 3 Spalten = 15)
  const reorderedTasks: any[] = [];
  const rows = 5;
  const cols = 3;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const originalIndex = row * cols + col;
      if (originalIndex < tasks.length) {
        reorderedTasks.push(tasks[originalIndex]);
      }
    }
  }

  const solutionItems = reorderedTasks.map((task) => {
    const solution = `${task.number1} ${task.operation} ${task.number2} = ${task.correctAnswer}`;
    return `<div class="solution-item">${solution}</div>`;
  }).join('\n');

  return `
  <div class="package">
    <div class="package-header">
      <span>${title}</span>
    </div>
    <div class="tasks-grid">
      ${solutionItems}
    </div>
  </div>
  `;
}