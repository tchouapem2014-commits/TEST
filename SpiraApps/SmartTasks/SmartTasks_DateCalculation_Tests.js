/**
 * SmartTasks - Tests du module de calcul des dates
 * Tests complets pour valider toutes les fonctionnalités
 */

// Charger le module
var SmartTasks = require('./SmartTasks_DateCalculation.js');

// Couleurs pour la console
var colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

var testsPassed = 0;
var testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(colors.green + '  PASS: ' + message + colors.reset);
        testsPassed++;
    } else {
        console.log(colors.red + '  FAIL: ' + message + colors.reset);
        testsFailed++;
    }
}

function section(title) {
    console.log('\n' + colors.blue + '=== ' + title + ' ===' + colors.reset);
}

// ============================================
// TESTS
// ============================================

section('Test 1: Types de dependances');
assert(SmartTasks.DEPENDENCY_TYPES.FS === 'Finish-to-Start', 'FS type defini');
assert(SmartTasks.DEPENDENCY_TYPES.SS === 'Start-to-Start', 'SS type defini');
assert(SmartTasks.DEPENDENCY_TYPES.FF === 'Finish-to-Finish', 'FF type defini');
assert(SmartTasks.DEPENDENCY_TYPES.SF === 'Start-to-Finish', 'SF type defini');

section('Test 2: Ajout de jours ouvrables');
var monday = new Date(2025, 0, 6); // Lundi 6 janvier 2025
var result1 = SmartTasks.addWorkingDays(monday, 5);
assert(result1.getDay() === 1, 'Ajouter 5 jours ouvrables depuis lundi donne lundi'); // Lundi suivant
assert(result1.getDate() === 13, 'Date correcte: 13 janvier');

var friday = new Date(2025, 0, 10); // Vendredi 10 janvier 2025
var result2 = SmartTasks.addWorkingDays(friday, 1);
assert(result2.getDay() === 1, 'Ajouter 1 jour ouvrable depuis vendredi donne lundi');
assert(result2.getDate() === 13, 'Date correcte: 13 janvier (saute weekend)');

section('Test 3: Calcul des dates successeur - Finish-to-Start');
var predStart = new Date(2025, 0, 6);  // Lundi
var predEnd = new Date(2025, 0, 10);   // Vendredi
var fsResult = SmartTasks.calculateSuccessorDates(predStart, predEnd, 'FS', 0, 3);
assert(fsResult.startDate.getDate() === 13, 'FS: Successeur commence lundi 13');
assert(fsResult.endDate.getDate() === 15, 'FS: Successeur finit mercredi 15');

section('Test 4: Calcul des dates successeur - Start-to-Start');
var ssResult = SmartTasks.calculateSuccessorDates(predStart, predEnd, 'SS', 2, 3);
assert(ssResult.startDate.getDate() === 8, 'SS avec lag 2: Successeur commence mercredi 8');

section('Test 5: Calcul des dates successeur avec Lag');
var fsLagResult = SmartTasks.calculateSuccessorDates(predStart, predEnd, 'FS', 3, 2);
assert(fsLagResult.startDate.getDate() === 16, 'FS avec lag 3: Successeur commence jeudi 16');

section('Test 6: Detection de dependances circulaires');
var tasks = [
    { id: 'A', name: 'Tache A', startDate: new Date(2025, 0, 6), duration: 5 },
    { id: 'B', name: 'Tache B', startDate: new Date(2025, 0, 13), duration: 3 },
    { id: 'C', name: 'Tache C', startDate: new Date(2025, 0, 16), duration: 2 }
];

// Pas de cycle
var deps1 = [
    { predecessorId: 'A', successorId: 'B', linkType: 'FS', lag: 0 },
    { predecessorId: 'B', successorId: 'C', linkType: 'FS', lag: 0 }
];
var circularCheck1 = SmartTasks.detectCircularDependencies(tasks, deps1);
assert(circularCheck1.hasCircular === false, 'Pas de cycle detecte dans chaine simple');

// Avec cycle
var deps2 = [
    { predecessorId: 'A', successorId: 'B', linkType: 'FS', lag: 0 },
    { predecessorId: 'B', successorId: 'C', linkType: 'FS', lag: 0 },
    { predecessorId: 'C', successorId: 'A', linkType: 'FS', lag: 0 }
];
var circularCheck2 = SmartTasks.detectCircularDependencies(tasks, deps2);
assert(circularCheck2.hasCircular === true, 'Cycle detecte dans dependances circulaires');
assert(circularCheck2.cycles.length > 0, 'Details du cycle disponibles');

section('Test 7: Propagation des changements');
var projectTasks = [
    { id: 'T1', name: 'Design', startDate: new Date(2025, 0, 6), endDate: new Date(2025, 0, 10), duration: 5 },
    { id: 'T2', name: 'Dev', startDate: null, endDate: null, duration: 10 },
    { id: 'T3', name: 'Test', startDate: null, endDate: null, duration: 5 },
    { id: 'T4', name: 'Deploy', startDate: null, endDate: null, duration: 2 }
];

var projectDeps = [
    { predecessorId: 'T1', successorId: 'T2', linkType: 'FS', lag: 0 },
    { predecessorId: 'T2', successorId: 'T3', linkType: 'FS', lag: 0 },
    { predecessorId: 'T3', successorId: 'T4', linkType: 'FS', lag: 0 }
];

var propagated = SmartTasks.propagateChanges(projectTasks, projectDeps);
assert(propagated.error === null, 'Propagation sans erreur');
assert(propagated.tasks.length === 4, 'Toutes les taches sont presentes');

var t2 = propagated.tasks.find(function(t) { return t.id === 'T2'; });
var t3 = propagated.tasks.find(function(t) { return t.id === 'T3'; });
var t4 = propagated.tasks.find(function(t) { return t.id === 'T4'; });

assert(t2.startDate !== null, 'T2 a une date de debut calculee');
assert(t3.startDate !== null, 'T3 a une date de debut calculee');
assert(t4.startDate !== null, 'T4 a une date de debut calculee');
assert(t2.startDate > projectTasks[0].endDate, 'T2 commence apres T1');

section('Test 8: Chemin critique');
var cpResult = SmartTasks.calculateCriticalPath(projectTasks, projectDeps);
assert(cpResult.criticalPath.length > 0, 'Chemin critique calcule');
assert(cpResult.totalDuration > 0, 'Duree totale du projet calculee');
console.log('   Duree totale du projet: ' + cpResult.totalDuration + ' jours ouvrables');
console.log('   Taches critiques: ' + cpResult.criticalPath.map(function(t) { return t.name; }).join(' -> '));

section('Test 9: Validation des dependances');
var newValidDep = { predecessorId: 'T1', successorId: 'T3', linkType: 'SS', lag: 2 };
var validation1 = SmartTasks.validateDependency(projectTasks, projectDeps, newValidDep);
assert(validation1.isValid === true, 'Dependance valide acceptee');

var selfDep = { predecessorId: 'T1', successorId: 'T1', linkType: 'FS', lag: 0 };
var validation2 = SmartTasks.validateDependency(projectTasks, projectDeps, selfDep);
assert(validation2.isValid === false, 'Auto-dependance rejetee');
assert(validation2.errors.length > 0, 'Erreur signalee');

section('Test 10: Mise a jour et propagation');
var updateResult = SmartTasks.updateTaskAndPropagate(projectTasks, projectDeps, 'T1', {
    duration: 7 // Augmenter la duree de T1
});
assert(updateResult.error === null, 'Mise a jour sans erreur');
var updatedT1 = updateResult.tasks.find(function(t) { return t.id === 'T1'; });
assert(updatedT1.duration === 7, 'Duree de T1 mise a jour');

section('Test 11: Dependances Start-to-Start paralleles');
var parallelTasks = [
    { id: 'P1', name: 'Phase 1', startDate: new Date(2025, 0, 6), duration: 10 },
    { id: 'P2', name: 'Phase 2 (parallele)', startDate: null, duration: 8 }
];
var parallelDeps = [
    { predecessorId: 'P1', successorId: 'P2', linkType: 'SS', lag: 2 }
];
var parallelResult = SmartTasks.propagateChanges(parallelTasks, parallelDeps);
var p2 = parallelResult.tasks.find(function(t) { return t.id === 'P2'; });
assert(p2.startDate.getDate() === 8, 'P2 commence 2 jours apres P1 (SS)');

section('Test 12: Dependance Finish-to-Finish');
var ffTasks = [
    { id: 'FF1', name: 'Tache FF1', startDate: new Date(2025, 0, 6), duration: 5 },
    { id: 'FF2', name: 'Tache FF2', startDate: null, duration: 3 }
];
var ffDeps = [
    { predecessorId: 'FF1', successorId: 'FF2', linkType: 'FF', lag: 0 }
];
var ffResult = SmartTasks.propagateChanges(ffTasks, ffDeps);
var ff1 = ffResult.tasks.find(function(t) { return t.id === 'FF1'; });
var ff2 = ffResult.tasks.find(function(t) { return t.id === 'FF2'; });
assert(ff2.endDate.getTime() === ff1.endDate.getTime(), 'FF2 finit en meme temps que FF1');

section('Test 13: Rapport de projet');
var report = SmartTasks.generateProjectReport(projectTasks, projectDeps);
assert(report.summary !== undefined, 'Resume du projet disponible');
assert(report.summary.totalTasks === 4, 'Nombre de taches correct');
assert(report.criticalPath !== undefined, 'Chemin critique dans le rapport');
console.log('   Resume du projet:');
console.log('   - Debut: ' + report.summary.projectStart);
console.log('   - Fin: ' + report.summary.projectEnd);
console.log('   - Duree: ' + report.summary.totalDuration);

section('Test 14: Gestion des jours negatifs (lead time)');
var leadTasks = [
    { id: 'L1', name: 'Tache L1', startDate: new Date(2025, 0, 6), endDate: new Date(2025, 0, 10), duration: 5 },
    { id: 'L2', name: 'Tache L2', startDate: null, duration: 3 }
];
var leadDeps = [
    { predecessorId: 'L1', successorId: 'L2', linkType: 'FS', lag: -2 } // Lead de 2 jours
];
var leadResult = SmartTasks.propagateChanges(leadTasks, leadDeps);
var l2 = leadResult.tasks.find(function(t) { return t.id === 'L2'; });
// Avec un lead de -2, L2 devrait commencer 2 jours avant la fin de L1
assert(l2.startDate.getDate() === 9, 'L2 commence avec lead time (chevauchement)');

// ============================================
// RESUME
// ============================================

console.log('\n' + colors.yellow + '========================================' + colors.reset);
console.log(colors.yellow + 'RESUME DES TESTS' + colors.reset);
console.log(colors.yellow + '========================================' + colors.reset);
console.log(colors.green + 'Tests reussis: ' + testsPassed + colors.reset);
console.log((testsFailed > 0 ? colors.red : colors.green) + 'Tests echoues: ' + testsFailed + colors.reset);
console.log('Total: ' + (testsPassed + testsFailed) + ' tests');

if (testsFailed === 0) {
    console.log('\n' + colors.green + 'TOUS LES TESTS SONT PASSES!' + colors.reset);
    process.exit(0);
} else {
    console.log('\n' + colors.red + 'CERTAINS TESTS ONT ECHOUE!' + colors.reset);
    process.exit(1);
}
