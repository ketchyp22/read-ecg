// app.js — Read ECG

const LETTERS = ['А', 'Б', 'В', 'Г'];

document.addEventListener('DOMContentLoaded', function() {

const ALL_QUESTIONS = [
  ...QUESTIONS_INFARCT,
  ...QUESTIONS_ARRHYTHMIA,
  ...QUESTIONS_BLOCKS,
  ...QUESTIONS_OTHER
];

const state = {
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  skippedCount: 0,
  answered: false,
  gameOver: false,
};

const screens = {
  start:  document.getElementById('screen-start'),
  game:   document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
};

const el = {
  progressCurrent: document.getElementById('progress-current'),
  progressTotal:   document.getElementById('progress-total'),
  progressDots:    document.getElementById('progress-dots'),
  taskNumber:      document.getElementById('task-number'),
  taskTitle:       document.getElementById('task-title'),
  ecgContainer:    document.getElementById('ecg-container'),
  optionsContainer:document.getElementById('options-container'),
  explanationBox:  document.getElementById('explanation-box'),
  explanationText: document.getElementById('explanation-text'),
  btnNext:         document.getElementById('btn-next'),
  btnSkip:         document.getElementById('btn-skip'),
  resultIcon:      document.getElementById('result-icon'),
  resultTitle:     document.getElementById('result-title'),
  resultCorrect:   document.getElementById('result-correct'),
  resultWrong:     document.getElementById('result-wrong'),
  resultGrade:     document.getElementById('result-grade'),
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function buildDots() {
  el.progressDots.innerHTML = '';
  state.questions.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i < state.currentIndex ? ' done' : i === state.currentIndex ? ' active' : '');
    el.progressDots.appendChild(d);
  });
}

function initStart() { showScreen('start'); }

function startGame() {
  state.questions    = shuffle(ALL_QUESTIONS);
  state.currentIndex = 0;
  state.correctCount = 0;
  state.wrongCount   = 0;
  state.skippedCount = 0;
  state.gameOver     = false;
  el.progressTotal.textContent = state.questions.length;
  showScreen('game');
  loadQuestion();
}

function loadQuestion() {
  if (state.currentIndex >= state.questions.length) { endGame(); return; }
  state.answered = false;
  const q = state.questions[state.currentIndex];
  const num = String(state.currentIndex + 1).padStart(2, '0');

  el.progressCurrent.textContent = state.currentIndex + 1;
  el.taskNumber.textContent      = `ЭКГ № ${num}`;
  el.taskTitle.textContent       = q.title;
  el.ecgContainer.innerHTML      = q.svg;
  el.explanationBox.classList.remove('show');
  el.btnNext.style.display = 'none';
  el.btnSkip.style.display = 'inline-flex';

  buildDots();

  const shuffled = shuffle(q.options.map(o => ({...o})));
  el.optionsContainer.innerHTML = '';
  shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-correct', opt.correct);
    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, opt.correct, q.explanation));
    el.optionsContainer.appendChild(btn);
  });
}

function handleAnswer(clickedBtn, isCorrect, explanation) {
  if (state.answered || state.gameOver) return;
  state.answered = true;

  el.optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.getAttribute('data-correct') === 'true') btn.classList.add('correct');
  });

  if (isCorrect) {
    state.correctCount++;
  } else {
    clickedBtn.classList.add('wrong');
    state.wrongCount++;
  }

  el.explanationText.innerHTML = `<strong>Разбор:</strong> ${explanation}`;
  el.explanationBox.classList.add('show');
  el.btnNext.style.display = 'inline-flex';
  el.btnSkip.style.display = 'none';
}

function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) endGame();
  else loadQuestion();
}

function skipQuestion() {
  if (state.answered || state.gameOver) return;
  state.skippedCount++;
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) endGame();
  else loadQuestion();
}

function endGame() {
  if (state.gameOver) return;
  state.gameOver = true;

  const answered = state.correctCount + state.wrongCount;
  const accuracy = answered > 0 ? Math.round(state.correctCount / answered * 100) : 0;

  let icon, title, gradeText;
  if (accuracy === 100) {
    icon = '🏆'; title = 'Идеальный результат!';
    gradeText = `<strong>Без ошибок!</strong> Ты читаешь ЭКГ как опытный кардиолог.`;
  } else if (accuracy >= 80) {
    icon = '⚕️'; title = 'Отличный результат';
    gradeText = `<strong>Очень хорошо!</strong> Точность ${accuracy}% — уверенный уровень.`;
  } else if (accuracy >= 60) {
    icon = '📖'; title = 'Хороший результат';
    gradeText = `<strong>Неплохо.</strong> Точность ${accuracy}% — основы знаешь, есть что подтянуть.`;
  } else if (state.correctCount > 0) {
    icon = '🔬'; title = 'Нужно повторить';
    gradeText = `<strong>Точность ${accuracy}%.</strong> Повтори основы ЭКГ — это придёт с практикой.`;
  } else {
    icon = '💉'; title = 'Попробуй ещё раз';
    gradeText = `<strong>Не сдавайся!</strong> ЭКГ — навык, который требует времени.`;
  }

  el.resultIcon.textContent    = icon;
  el.resultTitle.textContent   = title;
  el.resultCorrect.textContent = state.correctCount;
  el.resultWrong.textContent   = state.wrongCount + state.skippedCount;
  el.resultGrade.innerHTML     = gradeText;
  showScreen('result');
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', nextQuestion);
document.getElementById('btn-skip').addEventListener('click', skipQuestion);
document.getElementById('btn-play-again').addEventListener('click', startGame);
document.getElementById('btn-to-menu').addEventListener('click', initStart);

initStart();
});
