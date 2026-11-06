/**
 * VozKriolu Studio - Client-Side Web Application
 * IndexedDB persistence, Web Audio capture, Gemini ALUPEC transcription, PDF export, Email preparation
 */

// ==========================================
// 1. IndexedDB Persistence Layer
// ==========================================
const DB_NAME = 'VozKrioluDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

let dbInstance = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
    };
  });
}

async function dbSaveSession(session) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(session);
    request.onsuccess = () => resolve(session);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetAllSessions() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    const request = index.openCursor(null, 'prev'); // Most recent first
    const results = [];

    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetSession(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function dbDeleteSession(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

// ==========================================
// 2. Application State
// ==========================================
const state = {
  currentView: 'studio',
  activeSession: null,
  activeAudioBlob: null,
  activeAudioUrl: null,

  // Dialect & Language
  dialectVariant: 'Santiago',
  spokenLanguage: 'Automática',

  // Audio Recording
  mediaRecorder: null,
  audioContext: null,
  analyserNode: null,
  recordedChunks: [],
  recordState: 'idle', // 'idle', 'recording', 'paused'
  recordStartTime: 0,
  recordAccumulatedTime: 0,
  recordTimerInterval: null,

  // Audio Player Preview
  audioPlayer: new Audio(),
  isPlaying: false,

  // Deletion pending
  sessionPendingDelete: null
};

// ==========================================
// 3. DOM Elements
// ==========================================
const elements = {
  // Navigation
  tabs: document.querySelectorAll('.nav-tab'),
  views: {
    studio: document.getElementById('viewStudio'),
    repository: document.getElementById('viewRepository'),
    export: document.getElementById('viewExport')
  },
  liveStatusBadge: document.getElementById('liveStatusBadge'),

  // Console / Studio
  sessionTitleDisplay: document.getElementById('sessionTitleDisplay'),
  reviewedIndicator: document.getElementById('reviewedIndicator'),
  waveformCanvas: document.getElementById('waveformCanvas'),
  waveformContainer: document.getElementById('waveformContainer'),
  waveformCurrentTime: document.getElementById('waveformCurrentTime'),
  waveformTotalTime: document.getElementById('waveformTotalTime'),
  smpteTimer: document.getElementById('smpteTimer'),

  // Transport
  btnRecord: document.getElementById('btnRecord'),
  btnRecordLabel: document.getElementById('btnRecordLabel'),
  btnPauseRecord: document.getElementById('btnPauseRecord'),
  btnResumeRecord: document.getElementById('btnResumeRecord'),
  btnStopRecord: document.getElementById('btnStopRecord'),
  btnPlayAudio: document.getElementById('btnPlayAudio'),
  playIconSvg: document.getElementById('playIconSvg'),
  btnTranscribe: document.getElementById('btnTranscribe'),
  btnTranscribeLabel: document.getElementById('btnTranscribeLabel'),
  transcriptionErrorBanner: document.getElementById('transcriptionErrorBanner'),
  transcriptionErrorStep: document.getElementById('transcriptionErrorStep'),
  transcriptionErrorText: document.getElementById('transcriptionErrorText'),

  // API Key & Modal Falta a chave de acesso
  btnApiKey: document.getElementById('btnApiKey'),
  apiKeyStatusDot: document.getElementById('apiKeyStatusDot'),
  apiKeyLabel: document.getElementById('apiKeyLabel'),
  modalApiKey: document.getElementById('modalApiKey'),
  modalApiKeyTitle: document.getElementById('modalApiKeyTitle'),
  modalApiKeyErrorAlert: document.getElementById('modalApiKeyErrorAlert'),
  modalApiKeyErrorText: document.getElementById('modalApiKeyErrorText'),
  inputApiKey: document.getElementById('inputApiKey'),
  btnApiKeyCancel: document.getElementById('btnApiKeyCancel'),
  btnApiKeySave: document.getElementById('btnApiKeySave'),
  btnToggleApiKeyVisibility: document.getElementById('btnToggleApiKeyVisibility'),
  apiKeyModalStatusText: document.getElementById('apiKeyModalStatusText'),
  btnClearApiKey: document.getElementById('btnClearApiKey'),
  btnOpenSettingsFromError: document.getElementById('btnOpenSettingsFromError'),

  // Config Chips
  variantChips: document.querySelectorAll('#variantSelector .chip'),
  languageChips: document.querySelectorAll('#languageSelector .chip'),

  // Editor
  txtKrioluEditor: document.getElementById('txtKrioluEditor'),
  txtOriginalSpeech: document.getElementById('txtOriginalSpeech'),
  chkReviewed: document.getElementById('chkReviewed'),

  // Repository
  inputSearch: document.getElementById('inputSearch'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  fileAudioInput: document.getElementById('fileAudioInput'),
  btnRepoNewRecord: document.getElementById('btnRepoNewRecord'),
  sessionCountBadge: document.getElementById('sessionCountBadge'),
  sessionListContainer: document.getElementById('sessionListContainer'),

  // Export
  selectExportSession: document.getElementById('selectExportSession'),
  btnExportRecord: document.getElementById('btnExportRecord'),
  btnExportPdf: document.getElementById('btnExportPdf'),
  btnPrepareEmail: document.getElementById('btnPrepareEmail'),
  btnCopyText: document.getElementById('btnCopyText'),
  btnDownloadAudio: document.getElementById('btnDownloadAudio'),
  btnBackToStudio: document.getElementById('btnBackToStudio'),
  previewReviewStatus: document.getElementById('previewReviewStatus'),
  previewMetaBox: document.getElementById('previewMetaBox'),
  previewKrioluText: document.getElementById('previewKrioluText'),
  previewOriginalText: document.getElementById('previewOriginalText'),

  // Modals
  modalAiConsent: document.getElementById('modalAiConsent'),
  btnConsentCancel: document.getElementById('btnConsentCancel'),
  btnConsentConfirm: document.getElementById('btnConsentConfirm'),

  modalDelete: document.getElementById('modalDelete'),
  deleteModalMessage: document.getElementById('deleteModalMessage'),
  btnDeleteCancel: document.getElementById('btnDeleteCancel'),
  btnDeleteConfirm: document.getElementById('btnDeleteConfirm'),

  // Notification Toast
  notificationToast: document.getElementById('notificationToast'),
  notificationMessage: document.getElementById('notificationMessage'),
  notificationClose: document.getElementById('notificationClose')
};

// ==========================================
// 4. Utility Functions
// ==========================================
function formatSMPTETime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${tenths}`;
}

function formatDurationShort(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showNotification(msg) {
  elements.notificationMessage.textContent = msg;
  elements.notificationToast.classList.remove('hidden');
  clearTimeout(elements.notificationToast._timeout);
  elements.notificationToast._timeout = setTimeout(() => {
    elements.notificationToast.classList.add('hidden');
  }, 4500);
}

// ==========================================
// 5. Navigation View Controller
// ==========================================
function switchView(viewName) {
  state.currentView = viewName;
  elements.tabs.forEach(tab => {
    if (tab.dataset.view === viewName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  Object.keys(elements.views).forEach(key => {
    if (key === viewName) {
      elements.views[key].classList.add('active');
    } else {
      elements.views[key].classList.remove('active');
    }
  });

  if (viewName === 'repository') {
    renderRepositoryList();
  } else if (viewName === 'export') {
    populateExportScreen();
  }
}

// ==========================================
// 6. Audio Recording & Waveform Engine
// ==========================================
let animationFrameId = null;

function setupWaveformCanvas() {
  const canvas = elements.waveformCanvas;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

function drawWaveformStatic(progress = 0) {
  const canvas = elements.waveformCanvas;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);

  const barCount = 48;
  const spacing = w / barCount;
  const barWidth = spacing * 0.65;
  const centerY = h / 2;

  for (let i = 0; i < barCount; i++) {
    const x = i * spacing + (spacing - barWidth) / 2;
    const factor = Math.sin(i * 0.35) * 0.35 + 0.45 + Math.sin(i * 0.8) * 0.15;
    const barH = Math.max(8, factor * (h * 0.7));
    const topY = centerY - barH / 2;

    const isPlayed = (x / w) <= progress;
    ctx.fillStyle = isPlayed ? '#4cd7f6' : '#26334d';

    ctx.beginPath();
    ctx.roundRect(x, topY, barWidth, barH, 2);
    ctx.fill();
  }

  // Draw playhead needle
  if (progress > 0) {
    const needleX = progress * w;
    ctx.strokeStyle = '#4cd7f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(needleX, 0);
    ctx.lineTo(needleX, h);
    ctx.stroke();
  }
}

function startLiveWaveform() {
  const canvas = elements.waveformCanvas;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  const dataArray = new Uint8Array(state.analyserNode.frequencyBinCount);

  function draw() {
    if (state.recordState !== 'recording') return;

    animationFrameId = requestAnimationFrame(draw);
    state.analyserNode.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, w, h);

    const barCount = 48;
    const spacing = w / barCount;
    const barWidth = spacing * 0.65;
    const centerY = h / 2;

    for (let i = 0; i < barCount; i++) {
      const freqIndex = Math.floor((i / barCount) * dataArray.length);
      const amp = dataArray[freqIndex] / 255.0; // 0..1
      const barH = Math.max(6, amp * (h * 0.85));
      const x = i * spacing + (spacing - barWidth) / 2;
      const topY = centerY - barH / 2;

      ctx.fillStyle = (i % 3 === 0) ? '#4cd7f6' : '#2aaecb';
      ctx.beginPath();
      ctx.roundRect(x, topY, barWidth, barH, 2);
      ctx.fill();
    }
  }

  draw();
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaStream = stream;
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = state.audioContext.createMediaStreamSource(stream);
    state.analyserNode = state.audioContext.createAnalyser();
    state.analyserNode.fftSize = 128;
    source.connect(state.analyserNode);

    state.recordedChunks = [];

    // Select suitable mime type
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
    }

    state.mediaRecorder = new MediaRecorder(stream, { mimeType });
    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        state.recordedChunks.push(e.data);
      }
    };

    state.mediaRecorder.onstop = () => {
      try {
        if (state.mediaStream) {
          state.mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.warn('Erro ao fechar faixas do microfone:', err);
      }
      handleRecordingStopped();
    };

    state.mediaRecorder.start(100);
    state.recordState = 'recording';
    state.recordStartTime = Date.now();
    state.recordAccumulatedTime = 0;

    // UI Updates
    elements.btnRecord.classList.add('hidden');
    elements.btnPauseRecord.classList.remove('hidden');
    elements.btnResumeRecord.classList.add('hidden');
    elements.btnStopRecord.classList.remove('hidden');

    elements.liveStatusBadge.className = 'status-badge status-recording';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">● GRAVANDO</span>';
    document.querySelector('.console-card').classList.add('recording-active');
    elements.smpteTimer.className = 'timer-display recording';

    startTimerInterval();
    startLiveWaveform();
  } catch (err) {
    console.error('Error starting recording:', err);
    showNotification('Acesso ao microfone negado ou não suportado no navegador.');
  }
}

function pauseRecording() {
  if (state.recordState === 'recording' && state.mediaRecorder) {
    state.mediaRecorder.pause();
    state.recordAccumulatedTime += (Date.now() - state.recordStartTime);
    state.recordState = 'paused';
    clearInterval(state.recordTimerInterval);
    cancelAnimationFrame(animationFrameId);

    elements.btnPauseRecord.classList.add('hidden');
    elements.btnResumeRecord.classList.remove('hidden');

    elements.liveStatusBadge.className = 'status-badge status-paused';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">❚❚ EM PAUSA</span>';
    elements.smpteTimer.className = 'timer-display paused';
  }
}

function resumeRecording() {
  if (state.recordState === 'paused' && state.mediaRecorder) {
    state.mediaRecorder.resume();
    state.recordStartTime = Date.now();
    state.recordState = 'recording';

    elements.btnPauseRecord.classList.remove('hidden');
    elements.btnResumeRecord.classList.add('hidden');

    elements.liveStatusBadge.className = 'status-badge status-recording';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">● GRAVANDO</span>';
    elements.smpteTimer.className = 'timer-display recording';

    startTimerInterval();
    startLiveWaveform();
  }
}

function stopRecording() {
  if (state.recordState !== 'idle' && state.mediaRecorder) {
    if (state.recordState === 'recording') {
      state.recordAccumulatedTime += (Date.now() - state.recordStartTime);
    }
    clearInterval(state.recordTimerInterval);
    cancelAnimationFrame(animationFrameId);
    state.recordState = 'idle';

    if (state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }

    elements.btnRecord.classList.remove('hidden');
    elements.btnPauseRecord.classList.add('hidden');
    elements.btnResumeRecord.classList.add('hidden');
    elements.btnStopRecord.classList.add('hidden');

    elements.liveStatusBadge.className = 'status-badge status-ready';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">✓ PRONTO</span>';
    document.querySelector('.console-card').classList.remove('recording-active');
    elements.smpteTimer.className = 'timer-display';
  }
}

async function handleRecordingStopped() {
  const chosenMime = state.mediaRecorder?.mimeType || 'audio/webm';
  const blob = new Blob(state.recordedChunks, { type: chosenMime });
  state.activeAudioBlob = blob;
  if (state.activeAudioUrl) URL.revokeObjectURL(state.activeAudioUrl);
  state.activeAudioUrl = URL.createObjectURL(blob);

  const durationMs = state.recordAccumulatedTime;
  const timeStamp = new Date().toLocaleString('pt-PT');

  const newSession = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'rec_' + Date.now(),
    title: `Gravação ${timeStamp}`,
    createdAt: Date.now(),
    durationMs: durationMs,
    audioBlob: blob,
    fileSizeBytes: blob.size,
    dialectVariant: state.dialectVariant,
    spokenLanguage: state.spokenLanguage,
    originalRecognizedText: '',
    krioluTranscription: '',
    isReviewed: false
  };

  await dbSaveSession(newSession);
  state.activeSession = newSession;

  loadSessionIntoUI(newSession);
  showNotification('Gravação concluída e guardada localmente no IndexedDB.');
}

function startTimerInterval() {
  clearInterval(state.recordTimerInterval);
  state.recordTimerInterval = setInterval(() => {
    const elapsed = state.recordAccumulatedTime + (Date.now() - state.recordStartTime);
    elements.smpteTimer.textContent = formatSMPTETime(elapsed);
    elements.waveformCurrentTime.textContent = formatDurationShort(elapsed);
  }, 100);
}

// ==========================================
// 7. Session UI Binding
// ==========================================
function loadSessionIntoUI(session) {
  state.activeSession = session;
  state.activeAudioBlob = session.audioBlob;
  if (session.audioBlob) {
    if (state.activeAudioUrl) URL.revokeObjectURL(state.activeAudioUrl);
    state.activeAudioUrl = URL.createObjectURL(session.audioBlob);
    elements.btnPlayAudio.disabled = false;
    elements.btnTranscribe.disabled = false;
  } else {
    elements.btnPlayAudio.disabled = true;
    elements.btnTranscribe.disabled = true;
  }

  elements.sessionTitleDisplay.textContent = session.title;
  elements.smpteTimer.textContent = formatSMPTETime(session.durationMs || 0);
  elements.waveformTotalTime.textContent = formatDurationShort(session.durationMs || 0);
  elements.waveformCurrentTime.textContent = '00:00.0';

  // Transcriptions
  elements.txtKrioluEditor.value = session.krioluTranscription || '';
  elements.txtOriginalSpeech.textContent = session.originalRecognizedText || 'Nenhum áudio transcrito nesta sessão.';

  // Dialect & Language
  state.dialectVariant = session.dialectVariant || 'Santiago';
  state.spokenLanguage = session.spokenLanguage || 'Automática';

  elements.variantChips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.variant === state.dialectVariant);
  });
  elements.languageChips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.lang === state.spokenLanguage);
  });

  // Review Status
  elements.chkReviewed.checked = !!session.isReviewed;
  elements.reviewedIndicator.classList.toggle('hidden', !session.isReviewed);

  drawWaveformStatic(0);
}

// ==========================================
// 8. Audio Playback
// ==========================================
function toggleAudioPlayback() {
  if (!state.activeAudioUrl) return;

  if (state.isPlaying) {
    state.audioPlayer.pause();
    state.isPlaying = false;
    elements.playIconSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    state.audioPlayer.src = state.activeAudioUrl;
    state.audioPlayer.play();
    state.isPlaying = true;
    elements.playIconSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';

    state.audioPlayer.ontimeupdate = () => {
      const currentMs = state.audioPlayer.currentTime * 1000;
      const totalMs = (state.audioPlayer.duration || 1) * 1000;
      const progress = currentMs / totalMs;
      elements.waveformCurrentTime.textContent = formatDurationShort(currentMs);
      elements.smpteTimer.textContent = formatSMPTETime(currentMs);
      drawWaveformStatic(progress);
    };

    state.audioPlayer.onended = () => {
      state.isPlaying = false;
      elements.playIconSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      drawWaveformStatic(0);
      elements.waveformCurrentTime.textContent = '00:00.0';
    };
  }
}

// ==========================================
// 9. API Key, Quota Rate-Limit & Transcription with Gemini
// ==========================================
const RATE_LIMIT_MAX_PER_MINUTE = 5; // Limite de 5 transcrições/minuto para proteger quota

function getRateLimitTimestamps() {
  try {
    const raw = sessionStorage.getItem('VOZKRIOLU_RATE_TIMESTAMPS');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const oneMinuteAgo = Date.now() - 60000;
        return parsed.filter(t => typeof t === 'number' && t > oneMinuteAgo);
      }
    }
  } catch (_) {}
  return [];
}

function recordRateLimitTimestamp() {
  const list = getRateLimitTimestamps();
  list.push(Date.now());
  try {
    sessionStorage.setItem('VOZKRIOLU_RATE_TIMESTAMPS', JSON.stringify(list));
  } catch (_) {}
}

function checkRateLimit() {
  const list = getRateLimitTimestamps();
  if (list.length >= RATE_LIMIT_MAX_PER_MINUTE) {
    const oldest = list[0];
    const waitSeconds = Math.max(1, Math.ceil((60000 - (Date.now() - oldest)) / 1000));
    return {
      allowed: false,
      waitSeconds,
      used: list.length,
      limit: RATE_LIMIT_MAX_PER_MINUTE
    };
  }
  return {
    allowed: true,
    waitSeconds: 0,
    used: list.length,
    limit: RATE_LIMIT_MAX_PER_MINUTE
  };
}

function getGeminiApiKey() {
  // 1. Chave introduzida pelo utilizador em Definições (guardada estritamente no navegador)
  const userKey = localStorage.getItem('VOZKRIOLU_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY');
  if (userKey && typeof userKey === 'string' && userKey.trim() && userKey.trim() !== 'MY_GEMINI_API_KEY') {
    return { key: userKey.trim(), source: 'user' };
  }

  // 2. Chave de ambiente injetada pelo servidor (se configurada e não placeholder)
  const envKey = (window.ENV_GEMINI_API_KEY || window.GEMINI_API_KEY || '').trim();
  if (envKey && envKey !== 'MY_GEMINI_API_KEY' && envKey !== 'placeholder' && !envKey.startsWith('YOUR_') && envKey.length > 10) {
    return { key: envKey, source: 'server' };
  }

  return { key: '', source: 'none' };
}

function isApiKeyError(err, status) {
  if (status === 400 || status === 401 || status === 403) {
    const msg = (err?.message || '').toLowerCase();
    if (status === 401 || status === 403) return true;
    if (
      msg.includes('api_key') ||
      msg.includes('api key') ||
      msg.includes('chave') ||
      msg.includes('credential') ||
      msg.includes('unauthenticated') ||
      msg.includes('permission_denied')
    ) {
      return true;
    }
  }
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('api key expired') ||
    msg.includes('chave recusada')
  );
}

function updateApiKeyUiStatus() {
  const { key, source } = getGeminiApiKey();
  if (elements.btnApiKey) {
    if (key) {
      elements.btnApiKey.classList.add('has-key');
      elements.btnApiKey.classList.remove('no-key');
      if (elements.apiKeyLabel) {
        elements.apiKeyLabel.textContent = 'Chave IA ✓';
      }
      elements.btnApiKey.title = `Chave configurada (${source === 'user' ? 'Neste aparelho' : 'Servidor'}). Toque para gerir.`;
    } else {
      elements.btnApiKey.classList.remove('has-key');
      elements.btnApiKey.classList.add('no-key');
      if (elements.apiKeyLabel) {
        elements.apiKeyLabel.textContent = 'Sem chave';
      }
      elements.btnApiKey.title = 'Sem chave configurada. Toque para colar a sua chave Gemini.';
    }
  }

  if (elements.apiKeyModalStatusText) {
    const hasUserKey = !!(localStorage.getItem('VOZKRIOLU_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY'));
    if (hasUserKey) {
      elements.apiKeyModalStatusText.innerHTML = '<span style="color: #4ade80; font-weight: 600;">✓ Chave guardada neste aparelho</span>';
    } else if (source === 'server') {
      elements.apiKeyModalStatusText.innerHTML = '<span style="color: #60a5fa; font-weight: 600;">✓ Chave detetada no servidor</span>';
    } else {
      elements.apiKeyModalStatusText.innerHTML = '<span style="color: #f87171; font-weight: 600;">⚠ Nenhuma chave configurada</span>';
    }
  }

  if (elements.btnClearApiKey) {
    const hasUserKey = !!(localStorage.getItem('VOZKRIOLU_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY'));
    elements.btnClearApiKey.style.display = hasUserKey ? 'inline-block' : 'none';
  }
}

function openApiKeyModal(errorAlertMessage) {
  if (elements.modalApiKey) {
    const userStored = localStorage.getItem('VOZKRIOLU_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY') || '';
    if (elements.inputApiKey) {
      elements.inputApiKey.value = userStored;
    }

    if (elements.modalApiKeyErrorAlert) {
      if (errorAlertMessage) {
        elements.modalApiKeyErrorAlert.classList.remove('hidden');
        if (elements.modalApiKeyErrorText) {
          elements.modalApiKeyErrorText.textContent = errorAlertMessage;
        }
      } else {
        elements.modalApiKeyErrorAlert.classList.add('hidden');
      }
    }

    updateApiKeyUiStatus();
    elements.modalApiKey.classList.remove('hidden');
    if (elements.inputApiKey) {
      setTimeout(() => elements.inputApiKey.focus(), 80);
    }
  }
}

function closeApiKeyModal() {
  if (elements.modalApiKey) {
    elements.modalApiKey.classList.add('hidden');
  }
}

function toggleApiKeyVisibility() {
  if (!elements.inputApiKey) return;
  if (elements.inputApiKey.type === 'password') {
    elements.inputApiKey.type = 'text';
    if (elements.btnToggleApiKeyVisibility) elements.btnToggleApiKeyVisibility.textContent = '🙈';
  } else {
    elements.inputApiKey.type = 'password';
    if (elements.btnToggleApiKeyVisibility) elements.btnToggleApiKeyVisibility.textContent = '👁';
  }
}

function clearApiKey() {
  localStorage.removeItem('VOZKRIOLU_GEMINI_API_KEY');
  localStorage.removeItem('GEMINI_API_KEY');
  if (elements.inputApiKey) elements.inputApiKey.value = '';
  if (elements.modalApiKeyErrorAlert) elements.modalApiKeyErrorAlert.classList.add('hidden');
  updateApiKeyUiStatus();
  showNotification('Chave apagada deste aparelho.');
}

function saveApiKeyAndTranscribe() {
  const key = (elements.inputApiKey?.value || '').trim();
  if (key) {
    // Guardada exclusivamente no localStorage deste navegador, nunca transmitida ao nosso servidor
    localStorage.setItem('VOZKRIOLU_GEMINI_API_KEY', key);
    updateApiKeyUiStatus();
    closeApiKeyModal();

    if (state.activeSession && state.activeAudioBlob) {
      executeGeminiTranscription();
    } else {
      showNotification('Chave guardada com sucesso neste aparelho.');
    }
  } else {
    if (elements.modalApiKeyErrorAlert) {
      elements.modalApiKeyErrorAlert.classList.remove('hidden');
      if (elements.modalApiKeyErrorText) {
        elements.modalApiKeyErrorText.textContent = 'Cola a tua chave da Gemini antes de guardar.';
      }
    }
  }
}

function requestTranscriptionFlow() {
  if (!state.activeSession || !state.activeAudioBlob) {
    showNotification('Grave ou importe um ficheiro de áudio antes de transcrever.');
    return;
  }

  // 1. Verificação de chave: se não estiver configurada, mostra mensagem exata
  const { key } = getGeminiApiKey();
  if (!key) {
    const keyMsg = 'A transcrição precisa de uma chave de acesso configurada';
    showTranscriptionError('Configuração', keyMsg);
    showNotification(keyMsg);
    openApiKeyModal();
    return;
  }

  // 2. Limite de pedidos por minuto (Proteção de Quota)
  const rateStatus = checkRateLimit();
  if (!rateStatus.allowed) {
    const rateMsg = `Limite de pedidos por minuto atingido (máx. ${rateStatus.limit} pedidos/min). Aguarde ${rateStatus.waitSeconds} segundos para proteger a sua quota.`;
    showTranscriptionError('Proteção de Quota', rateMsg);
    showNotification(rateMsg);
    return;
  }

  // Modal de autorização explícita
  elements.modalAiConsent.classList.remove('hidden');
}

/**
 * Extrai o texto real de resposta do modelo Gemini, ignorando blocos de 'thought' (raciocínio interno).
 */
function extractCandidateText(candidate) {
  if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts)) {
    return '';
  }
  const parts = candidate.content.parts;
  // Em modelos como gemini-3.8-flash, partes com thought: true contêm o raciocínio interno
  const realParts = parts.filter(p => !p.thought);
  const chosenParts = realParts.length > 0 ? realParts : parts;
  return chosenParts.map(p => p.text || '').join('').trim();
}

/**
 * Faz o parsing tolerante de JSON devolvido pelo Gemini, mesmo com markdown ou pequenas variações de chaves.
 */
function parseGeminiJson(rawText) {
  if (!rawText) return null;
  const clean = rawText
    .replace(/^```json/im, '')
    .replace(/^```/im, '')
    .replace(/```$/m, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (e1) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {}
    }
  }
  return null;
}

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-flash-lite-latest';
const RETRY_DELAYS_MS = [2000, 5000, 10000]; // 2s, 5s, 10s

function isHighDemandError(err, status) {
  if (status === 503 || status === 429 || status === 502 || status === 504) return true;
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('busy') ||
    msg.includes('sobrecarregado')
  );
}

async function executeSingleGeminiRequest(model, payload, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    const err = new Error(`Falha de ligação à API Gemini (${netErr.message || 'Sem ligação à rede'}).`);
    err.httpStatus = 0;
    throw err;
  }

  // REGRA CRÍTICA: Antes de ler como JSON, valida o Content-Type e o status HTTP
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    const err = new Error(`O serviço devolveu uma página de erro (HTTP ${response.status})`);
    err.httpStatus = response.status;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    const err = new Error(`O serviço devolveu uma página de erro (HTTP ${response.status})`);
    err.httpStatus = response.status;
    throw err;
  }

  if (!response.ok) {
    const errorDetails = data?.error?.message || `Erro do serviço Gemini (HTTP ${response.status})`;
    const err = new Error(errorDetails);
    err.httpStatus = response.status;
    if (isApiKeyError(err, response.status)) {
      const keyErr = new Error('A chave não foi aceite pela Google; confirma-a e tenta outra vez');
      keyErr.httpStatus = response.status;
      keyErr.isKeyRefused = true;
      throw keyErr;
    }
    throw err;
  }

  return data;
}

/**
 * Chamada à API Gemini com tratamento de alta procura:
 * 1. Tenta até 3 vezes no modelo principal com esperas de 2, 5 e 10 segundos, mostrando:
 *    «O serviço está muito ocupado, a tentar outra vez (2/3)…» e «(3/3)…»
 * 2. Se continuar a falhar, tenta o modelo alternativo mais leve (gemini-flash-lite-latest)
 * 3. Se tudo falhar, devolve:
 *    «O serviço está sobrecarregado; a tua gravação está guardada, tenta daqui a uns minutos»
 */
async function callGeminiWithRetry(stepName, payload, apiKey, onStatusUpdate) {
  let lastError = null;

  // 1. Tentar até 3 vezes no Modelo Principal (gemini-3.8-flash)
  const maxPrimaryAttempts = 3;
  for (let attempt = 1; attempt <= maxPrimaryAttempts; attempt++) {
    try {
      console.log(`[${stepName}] A chamar modelo principal ${PRIMARY_MODEL} (tentativa ${attempt}/${maxPrimaryAttempts})...`);
      const data = await executeSingleGeminiRequest(PRIMARY_MODEL, payload, apiKey);
      return data; // Sucesso com modelo principal!
    } catch (err) {
      lastError = err;
      console.warn(`[${stepName}] Erro na tentativa ${attempt} com ${PRIMARY_MODEL}:`, err);

      // Chave recusada ou inválida aborta imediatamente para o diálogo abrir sem tentativas lentas
      if (err.isKeyRefused || isApiKeyError(err, err.httpStatus) || err.message === 'A chave não foi aceite pela Google; confirma-a e tenta outra vez') {
        const refusedErr = new Error('A chave não foi aceite pela Google; confirma-a e tenta outra vez');
        refusedErr.isKeyRefused = true;
        refusedErr.httpStatus = err.httpStatus;
        throw refusedErr;
      }

      const isDemand = isHighDemandError(err, err.httpStatus);
      if (!isDemand && (err.httpStatus === 400 || err.httpStatus === 401 || err.httpStatus === 403)) {
        throw err;
      }

      if (attempt === 1) {
        // Tentativa 1 falhou: aguardar 2 segundos antes da tentativa 2
        const msg = 'O serviço está muito ocupado, a tentar outra vez (2/3)…';
        if (onStatusUpdate) onStatusUpdate(msg);
        console.log(`Aguardando 2000ms antes da tentativa 2...`);
        await new Promise(res => setTimeout(res, 2000));
      } else if (attempt === 2) {
        // Tentativa 2 falhou: aguardar 5 segundos antes da tentativa 3
        const msg = 'O serviço está muito ocupado, a tentar outra vez (3/3)…';
        if (onStatusUpdate) onStatusUpdate(msg);
        console.log(`Aguardando 5000ms antes da tentativa 3...`);
        await new Promise(res => setTimeout(res, 5000));
      } else if (attempt === 3) {
        // Tentativa 3 falhou: aguardar 10 segundos antes do modelo alternativo
        const msg = `O serviço continua ocupado, a tentar modelo alternativo mais leve (${FALLBACK_MODEL})…`;
        if (onStatusUpdate) onStatusUpdate(msg);
        console.log(`Aguardando 10000ms antes de tentar modelo alternativo ${FALLBACK_MODEL}...`);
        await new Promise(res => setTimeout(res, 10000));
      }
    }
  }

  // 2. Se continuar a falhar, tenta o modelo alternativo mais leve antes de desistir
  try {
    console.log(`[${stepName}] A tentar modelo alternativo mais leve: ${FALLBACK_MODEL}...`);
    if (onStatusUpdate) {
      onStatusUpdate(`A tentar modelo alternativo mais leve (${FALLBACK_MODEL})…`);
    }
    const fallbackData = await executeSingleGeminiRequest(FALLBACK_MODEL, payload, apiKey);
    return fallbackData; // Sucesso com o modelo alternativo!
  } catch (fallbackErr) {
    console.warn(`[${stepName}] Erro com modelo alternativo ${FALLBACK_MODEL}:`, fallbackErr);
    if (fallbackErr.isKeyRefused || isApiKeyError(fallbackErr, fallbackErr.httpStatus) || fallbackErr.message === 'A chave não foi aceite pela Google; confirma-a e tenta outra vez') {
      const refusedErr = new Error('A chave não foi aceite pela Google; confirma-a e tenta outra vez');
      refusedErr.isKeyRefused = true;
      refusedErr.httpStatus = fallbackErr.httpStatus;
      throw refusedErr;
    }
    lastError = fallbackErr;
  }

  // 3. Se tudo falhar, lança o erro amigável preservando a gravação
  throw new Error('O serviço está sobrecarregado; a tua gravação está guardada, tenta daqui a uns minutos');
}

async function executeGeminiTranscription() {
  elements.modalAiConsent.classList.add('hidden');
  elements.transcriptionErrorBanner.classList.add('hidden');

  const apiKeyInfo = getGeminiApiKey();
  if (!apiKeyInfo.key) {
    const keyMsg = 'A transcrição precisa de uma chave de acesso configurada';
    showTranscriptionError('Configuração', keyMsg);
    showNotification(keyMsg);
    openApiKeyModal();
    return;
  }

  // Limite de pedidos por minuto (proteção de quota)
  const rateStatus = checkRateLimit();
  if (!rateStatus.allowed) {
    const rateMsg = `Limite de pedidos por minuto atingido (máx. ${rateStatus.limit} pedidos/min). Aguarde ${rateStatus.waitSeconds} segundos para proteger a sua quota.`;
    showTranscriptionError('Proteção de Quota', rateMsg);
    showNotification(rateMsg);
    return;
  }
  recordRateLimitTimestamp();

  if (!navigator.onLine) {
    showTranscriptionError('Rede', 'Sem ligação à Internet. Verifique a sua ligação e tente novamente.');
    return;
  }

  const session = state.activeSession;
  const audioBlob = state.activeAudioBlob;

  if (!audioBlob || audioBlob.size === 0) {
    showTranscriptionError('Reconhecimento', 'O ficheiro de áudio está vazio.');
    return;
  }

  if (audioBlob.size > 20 * 1024 * 1024) {
    showTranscriptionError('Reconhecimento', 'O ficheiro de áudio excede o limite máximo para transcrição direta (20 MB).');
    return;
  }

  // Set processing UI
  elements.btnTranscribe.disabled = true;

  try {
    const base64Audio = await blobToBase64(audioBlob);
    const rawMime = audioBlob.type || 'audio/webm';
    let cleanMime = rawMime.split(';')[0].trim().toLowerCase() || 'audio/webm';
    if (cleanMime === 'audio/*') cleanMime = 'audio/webm';

    // ========================================================
    // PASSO 1: RECONHECIMENTO (Speech-to-Text Fiel do Áudio)
    // ========================================================
    elements.btnTranscribeLabel.textContent = '1/2: A reconhecer áudio...';
    elements.liveStatusBadge.className = 'status-badge status-transcribing';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">⚙ 1/2: RECONHECIMENTO</span>';

    const promptReconhecimento = `
Ouve com atenção todo o ficheiro de áudio em anexo.
Língua falada: ${state.spokenLanguage}.

Instruções:
1. Transcreve com fidelidade e exatidão todas as palavras faladas (em Crioulo de Cabo Verde, Português ou em qualquer língua presente no áudio).
2. Não omitas nenhuma frase dita. Se o áudio for breve, transcreve tudo o que foi falado.
3. Responde exclusivamente em formato JSON com o campo "reconhecido":
{"reconhecido": "texto transcrito aqui"}
`.trim();

    const payloadReconhecimento = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: cleanMime,
                data: base64Audio
              }
            },
            {
              text: promptReconhecimento
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json'
      }
    };

    let dataReconhecimento;
    try {
      dataReconhecimento = await callGeminiWithRetry('Reconhecimento', payloadReconhecimento, apiKeyInfo.key, (statusMsg) => {
        elements.btnTranscribeLabel.textContent = statusMsg;
        elements.liveStatusBadge.innerHTML = `<span class="status-dot"></span><span class="status-label">⚙ 1/2: ${escapeHtml(statusMsg)}</span>`;
      });
    } catch (errRec) {
      if (errRec.isKeyRefused || isApiKeyError(errRec, errRec.httpStatus) || errRec.message === 'A chave não foi aceite pela Google; confirma-a e tenta outra vez') {
        const refusalMsg = 'A chave não foi aceite pela Google; confirma-a e tenta outra vez';
        showTranscriptionError('Chave de Acesso', refusalMsg);
        showNotification(refusalMsg);
        openApiKeyModal(refusalMsg);
      } else if (errRec.message === 'A transcrição precisa de uma chave de acesso configurada') {
        showTranscriptionError('Configuração', errRec.message);
        showNotification(errRec.message);
        openApiKeyModal();
      } else {
        showTranscriptionError('Reconhecimento', errRec.message);
      }
      return;
    }

    const candidate1 = dataReconhecimento?.candidates?.[0];
    const rawText1 = extractCandidateText(candidate1);
    console.log('Gemini Passo 1 Resposta Bruta:', rawText1);

    let reconhecido = '';
    const parsedObj1 = parseGeminiJson(rawText1);
    if (parsedObj1 && typeof parsedObj1 === 'object') {
      reconhecido = parsedObj1.reconhecido || parsedObj1.transcricao || parsedObj1.texto || parsedObj1.transcription || parsedObj1.text || '';
      if (!reconhecido) {
        const vals = Object.values(parsedObj1);
        reconhecido = vals.find(v => typeof v === 'string' && v.trim().length > 0) || '';
      }
    }
    if (!reconhecido && rawText1) {
      reconhecido = rawText1.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }

    if (!reconhecido || !reconhecido.trim()) {
      showTranscriptionError('Reconhecimento', 'O modelo não detetou fala percetível no áudio gravado. Pode testar se o microfone gravou som carregando no botão de reprodução (▶) no Estúdio.');
      return;
    }

    // Atualiza imediatamente o texto reconhecido no ecrã e na sessão
    session.originalRecognizedText = reconhecido;
    elements.txtOriginalSpeech.textContent = reconhecido;
    await dbSaveSession(session);

    // ========================================================
    // PASSO 2: ADAPTAÇÃO (Normalização Ortográfica ALUPEC)
    // ========================================================
    elements.btnTranscribeLabel.textContent = '2/2: A adaptar para Crioulo...';
    elements.liveStatusBadge.className = 'status-badge status-transcribing';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">⚙ 2/2: ADAPTAÇÃO</span>';

    const variantInstructions = {
      'São Vicente': "Variante de São Vicente (Kriol d'Soncent / Barlavento). Usa a sonoridade e léxico desta ilha (ex: 'bocê', 'm\\' tá', 'sintid', 'caminh') sob as regras fonológicas ALUPEC.",
      'Sem adaptação': 'Sem adaptação dialetal: mantém estritamente o vocabulário e dialeto do texto reconhecido, aplicando apenas as regras ortográficas oficiais ALUPEC.',
      'Santiago': "Variante de Santiago (Badiu / Sotavento). Usa a sonoridade e léxico desta ilha (ex: 'abo/bô', 'N sta', 'djuntu', 'kaminhu') sob as regras ALUPEC."
    }[state.dialectVariant] || "Variante de Santiago (Badiu / Sotavento).";

    const promptAdaptacao = `
És um linguista perito em Crioulo de Cabo Verde e na ortografia oficial ALUPEC (Alfabeto Unificado para a Escrita do Caboverdiano - Decreto-Lei n.º 67/98).

Texto original reconhecido:
"${reconhecido}"

Variante dialetal solicitada:
${variantInstructions}

Instruções:
1. Adapta o conteúdo para Crioulo de Cabo Verde na variante indicada, aplicando rigorosamente as regras ortográficas ALUPEC (ex: uso de k, tx, dj, nh, lh, x, s, e vogais com acentos/diacríticos como ɔ, ɛ, ê, ô, ã).
2. Não adiciones comentários nem notas explicativas adicionais.

Responde estritamente em formato JSON:
{
  "kriolu": "texto em crioulo de Cabo Verde na ortografia ALUPEC"
}
`.trim();

    const payloadAdaptacao = {
      contents: [
        {
          parts: [
            {
              text: promptAdaptacao
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json'
      }
    };

    let dataAdaptacao;
    try {
      dataAdaptacao = await callGeminiWithRetry('Adaptação', payloadAdaptacao, apiKeyInfo.key, (statusMsg) => {
        elements.btnTranscribeLabel.textContent = statusMsg;
        elements.liveStatusBadge.innerHTML = `<span class="status-dot"></span><span class="status-label">⚙ 2/2: ${escapeHtml(statusMsg)}</span>`;
      });
    } catch (errAdp) {
      if (errAdp.isKeyRefused || isApiKeyError(errAdp, errAdp.httpStatus) || errAdp.message === 'A chave não foi aceite pela Google; confirma-a e tenta outra vez') {
        const refusalMsg = 'A chave não foi aceite pela Google; confirma-a e tenta outra vez';
        showTranscriptionError('Chave de Acesso', refusalMsg);
        showNotification(refusalMsg);
        openApiKeyModal(refusalMsg);
      } else if (errAdp.message === 'A transcrição precisa de uma chave de acesso configurada') {
        showTranscriptionError('Configuração', errAdp.message);
        showNotification(errAdp.message);
        openApiKeyModal();
      } else {
        showTranscriptionError('Adaptação', errAdp.message);
      }
      return;
    }

    const candidate2 = dataAdaptacao?.candidates?.[0];
    const rawText2 = extractCandidateText(candidate2);
    console.log('Gemini Passo 2 Resposta Bruta:', rawText2);

    let kriolu = '';
    const parsedObj2 = parseGeminiJson(rawText2);
    if (parsedObj2 && typeof parsedObj2 === 'object') {
      kriolu = parsedObj2.kriolu || parsedObj2.crioulo || parsedObj2.texto || parsedObj2.text || '';
      if (!kriolu) {
        const vals = Object.values(parsedObj2);
        kriolu = vals.find(v => typeof v === 'string' && v.trim().length > 0) || '';
      }
    }
    if (!kriolu && rawText2) {
      kriolu = rawText2.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
    if (!kriolu && reconhecido) {
      kriolu = reconhecido; // Fallback seguro
    }

    // Sucesso em ambos os passos
    session.krioluTranscription = kriolu;
    session.dialectVariant = state.dialectVariant;
    session.spokenLanguage = state.spokenLanguage;
    session.isReviewed = false;

    await dbSaveSession(session);
    loadSessionIntoUI(session);

    showNotification('Transcrição concluída com sucesso (Reconhecimento e Adaptação)!');
  } catch (errGeneral) {
    console.error('Transcription error:', errGeneral);
    if (errGeneral.isKeyRefused || isApiKeyError(errGeneral, errGeneral.httpStatus) || errGeneral.message === 'A chave não foi aceite pela Google; confirma-a e tenta outra vez') {
      const refusalMsg = 'A chave não foi aceite pela Google; confirma-a e tenta outra vez';
      showTranscriptionError('Chave de Acesso', refusalMsg);
      showNotification(refusalMsg);
      openApiKeyModal(refusalMsg);
    } else if (errGeneral.message === 'A transcrição precisa de uma chave de acesso configurada') {
      showTranscriptionError('Configuração', errGeneral.message);
      showNotification(errGeneral.message);
      openApiKeyModal();
    } else {
      showTranscriptionError('Geral', errGeneral.message || 'Erro durante o processamento.');
    }
  } finally {
    elements.btnTranscribe.disabled = false;
    elements.btnTranscribeLabel.textContent = 'Transcrever para crioulo';
    elements.liveStatusBadge.className = 'status-badge status-ready';
    elements.liveStatusBadge.innerHTML = '<span class="status-dot"></span><span class="status-label">✓ PRONTO</span>';
  }
}

function showTranscriptionError(step, msg) {
  if (elements.transcriptionErrorStep) {
    elements.transcriptionErrorStep.textContent = step ? `[PASSO: ${step.toUpperCase()}] ` : '';
  }
  elements.transcriptionErrorText.textContent = msg;
  elements.transcriptionErrorBanner.classList.remove('hidden');

  const isKeyError = msg.includes('chave de acesso') || msg.includes('configurada') || (step && step.toLowerCase().includes('config'));
  if (elements.btnOpenSettingsFromError) {
    elements.btnOpenSettingsFromError.classList.toggle('hidden', !isKeyError);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ==========================================
// 10. Repository View Controller
// ==========================================
async function renderRepositoryList() {
  const query = elements.inputSearch.value.trim().toLowerCase();
  const allSessions = await dbGetAllSessions();

  const filtered = allSessions.filter(s => {
    if (!query) return true;
    return (s.title && s.title.toLowerCase().includes(query)) ||
           (s.krioluTranscription && s.krioluTranscription.toLowerCase().includes(query));
  });

  elements.sessionCountBadge.textContent = `${filtered.length} sessões guardadas`;
  elements.sessionListContainer.innerHTML = '';

  if (filtered.length === 0) {
    elements.sessionListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 16px;">Nenhuma sessão encontrada.</p>
        <p style="font-size: 13px; margin-top: 6px;">Grave um áudio no Estúdio ou importe um ficheiro.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(session => {
    const card = document.createElement('div');
    card.className = 'session-item-card';

    const dateStr = new Date(session.createdAt).toLocaleString('pt-PT');
    const durStr = formatDurationShort(session.durationMs || 0);
    const sizeStr = formatBytes(session.fileSizeBytes || (session.audioBlob ? session.audioBlob.size : 0));

    card.innerHTML = `
      <div class="session-item-top">
        <div>
          <h4 class="session-item-title">${escapeHtml(session.title)}</h4>
          <span class="session-item-meta">${dateStr} • ${durStr} • ${sizeStr}</span>
        </div>
        <div class="session-item-badges">
          <span class="badge-variant">${escapeHtml(session.dialectVariant || 'Santiago')}</span>
          ${session.isReviewed ? '<span class="badge-reviewed">REVISTO</span>' : ''}
        </div>
      </div>
      <div class="session-snippet">
        ${escapeHtml(session.krioluTranscription || session.originalRecognizedText || '(Sem transcrição gerada)')}
      </div>
      <div class="session-item-actions">
        <button class="btn-mini-play" title="Ouvir áudio">▶</button>
        <div class="action-buttons-group">
          <button class="btn-action-sm primary-sm btn-open-studio">Estúdio</button>
          <button class="btn-action-sm btn-export-session">Exportar</button>
          <button class="btn-action-sm btn-download-audio">Descarregar</button>
          <button class="btn-action-sm danger-sm btn-delete-session">Eliminar</button>
        </div>
      </div>
    `;

    // Event listeners
    const btnPlay = card.querySelector('.btn-mini-play');
    btnPlay.addEventListener('click', () => {
      if (session.audioBlob) {
        const url = URL.createObjectURL(session.audioBlob);
        const player = new Audio(url);
        player.play();
        btnPlay.textContent = '❚❚';
        player.onended = () => { btnPlay.textContent = '▶'; };
      }
    });

    card.querySelector('.btn-open-studio').addEventListener('click', () => {
      loadSessionIntoUI(session);
      switchView('studio');
    });

    card.querySelector('.btn-export-session').addEventListener('click', () => {
      state.activeSession = session;
      switchView('export');
    });

    card.querySelector('.btn-download-audio').addEventListener('click', () => {
      downloadSessionAudio(session);
    });

    card.querySelector('.btn-delete-session').addEventListener('click', () => {
      state.sessionPendingDelete = session;
      elements.deleteModalMessage.textContent = `Tem a certeza que deseja eliminar a sessão "${session.title}"? Esta ação apagará permanentemente o áudio e as transcrições do IndexedDB.`;
      elements.modalDelete.classList.remove('hidden');
    });

    elements.sessionListContainer.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Audio Import
async function handleAudioImport(file) {
  if (!file) return;

  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/ogg', 'audio/webm'];
  const ext = file.name.split('.').pop().toLowerCase();
  const allowedExts = ['wav', 'mp3', 'm4a', 'ogg', 'webm'];

  if (!allowedExts.includes(ext) && !allowedTypes.includes(file.type)) {
    showNotification('Ficheiro recusado: utilize formatos WAV, MP3, M4A, OGG ou WebM.');
    return;
  }

  if (file.size <= 0) {
    showNotification('O ficheiro selecionado está vazio ou ilegível.');
    return;
  }

  // Reject > 250 MB
  if (file.size > 250 * 1024 * 1024) {
    showNotification('Ficheiro recusado: tamanho excede o limite máximo de 250 MB.');
    return;
  }

  // Read duration if possible
  const audioEl = new Audio(URL.createObjectURL(file));
  let durationMs = 0;
  await new Promise((res) => {
    audioEl.onloadedmetadata = () => {
      durationMs = (audioEl.duration || 0) * 1000;
      res();
    };
    audioEl.onerror = () => res();
    setTimeout(res, 800);
  });

  const session = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'import_' + Date.now(),
    title: file.name.replace(/\.[^/.]+$/, ''),
    createdAt: Date.now(),
    durationMs: durationMs,
    audioBlob: file,
    fileSizeBytes: file.size,
    dialectVariant: state.dialectVariant,
    spokenLanguage: state.spokenLanguage,
    originalRecognizedText: '',
    krioluTranscription: '',
    isReviewed: false
  };

  await dbSaveSession(session);
  loadSessionIntoUI(session);
  switchView('studio');
  showNotification('Ficheiro de áudio importado e guardado no IndexedDB!');
}

function downloadSessionAudio(session) {
  if (!session || !session.audioBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(session.audioBlob);
  const ext = session.audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
  a.download = `${session.title.replace(/\s+/g, '_')}.${ext}`;
  a.click();
}

// ==========================================
// 11. Export & Share Controller (PDF & Email)
// ==========================================
async function populateExportScreen() {
  const sessions = await dbGetAllSessions();
  elements.selectExportSession.innerHTML = '';

  if (sessions.length === 0) {
    elements.selectExportSession.innerHTML = '<option value="">(Nenhuma sessão no repositório)</option>';
    renderExportPreview(null);
    return;
  }

  sessions.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.title} (${s.dialectVariant || 'Santiago'}) - ${new Date(s.createdAt).toLocaleDateString('pt-PT')}`;
    elements.selectExportSession.appendChild(opt);
  });

  if (state.activeSession) {
    elements.selectExportSession.value = state.activeSession.id;
    renderExportPreview(state.activeSession);
  } else {
    elements.selectExportSession.value = sessions[0].id;
    state.activeSession = sessions[0];
    renderExportPreview(sessions[0]);
  }
}

function renderExportPreview(session) {
  if (!session) {
    elements.previewMetaBox.textContent = 'Nenhuma sessão selecionada.';
    elements.previewKrioluText.textContent = '';
    elements.previewOriginalText.textContent = '';
    return;
  }

  const dateStr = new Date(session.createdAt).toLocaleString('pt-PT');
  const durStr = formatDurationShort(session.durationMs || 0);

  elements.previewReviewStatus.textContent = session.isReviewed ? 'REVISTO POR HUMANO' : 'RASCUNHO PRELIMINAR';
  elements.previewReviewStatus.className = 'review-status-tag ' + (session.isReviewed ? 'reviewed' : '');

  elements.previewMetaBox.innerHTML = `
    <strong>Sessão:</strong> ${escapeHtml(session.title)}<br>
    <strong>Data:</strong> ${dateStr} &nbsp;•&nbsp; <strong>Duração:</strong> ${durStr} &nbsp;•&nbsp; <strong>Variante:</strong> ${escapeHtml(session.dialectVariant || 'Santiago')}<br>
    <strong>Língua de Origem:</strong> ${escapeHtml(session.spokenLanguage || 'Automática')} &nbsp;•&nbsp; <strong>Estado:</strong> ${session.isReviewed ? 'Revisto' : 'Rascunho de IA'}
  `;

  elements.previewKrioluText.textContent = session.krioluTranscription || '(Sem transcrição em Crioulo)';
  elements.previewOriginalText.textContent = session.originalRecognizedText || '(Sem transcrição original detetada)';
}

// PDF Export (A4, Paginado, com suporte Unicode para caracteres ALUPEC)
function exportPdfA4() {
  const session = state.activeSession;
  if (!session) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4' // 595.28 x 841.89 pt
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - (margin * 2);

  let y = 50;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(13, 19, 34);
  doc.text('VozKriolu Studio', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(76, 110, 140);
  doc.text('Transcrição e Normalização Ortográfica ALUPEC (Cabo Verde)', margin, y);
  y += 14;

  // Divider
  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // Metadata
  const dateStr = new Date(session.createdAt).toLocaleString('pt-PT');
  const durStr = formatDurationShort(session.durationMs || 0);
  const statusStr = session.isReviewed ? 'Revisto por humano' : 'Rascunho preliminar de IA';

  doc.setFontSize(9.5);
  doc.setTextColor(50, 60, 80);
  doc.text(`Sessão: ${session.title}`, margin, y);
  y += 14;
  doc.text(`Data: ${dateStr}   |   Duração: ${durStr}   |   Variante: ${session.dialectVariant || 'Santiago'}`, margin, y);
  y += 14;
  doc.text(`Língua falada: ${session.spokenLanguage || 'Automática'}   |   Estado: ${statusStr}`, margin, y);
  y += 16;
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // Section 1: Crioulo ALUPEC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('1. Crioulo de Cabo Verde (Ortografia ALUPEC)', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(20, 25, 35);

  const krioluText = session.krioluTranscription || '(Sem texto transcrito em Crioulo)';
  const krioluLines = doc.splitTextToSize(krioluText, contentWidth);

  for (let line of krioluLines) {
    if (y + 16 > pageHeight - 50) {
      drawPdfFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
      y = 50;
    }
    doc.text(line, margin, y);
    y += 15;
  }

  y += 20;

  // Section 2: Original Recognized Speech
  if (y + 40 > pageHeight - 50) {
    drawPdfFooter(doc, pageWidth, pageHeight, margin);
    doc.addPage();
    y = 50;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('2. Transcrição Fiel do Áudio Original', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 70, 85);

  const origText = session.originalRecognizedText || '(Sem transcrição original reconhecida)';
  const origLines = doc.splitTextToSize(origText, contentWidth);

  for (let line of origLines) {
    if (y + 16 > pageHeight - 50) {
      drawPdfFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
      y = 50;
    }
    doc.text(line, margin, y);
    y += 15;
  }

  drawPdfFooter(doc, pageWidth, pageHeight, margin);

  const safeTitle = session.title.replace(/[^a-zA-Z0-9_]/g, '_');
  doc.save(`VozKriolu_${safeTitle}.pdf`);
  showNotification('Documento PDF (A4 paginado) gerado e descarregado com sucesso!');
}

function drawPdfFooter(doc, pageWidth, pageHeight, margin) {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text('VozKriolu Studio: o crioulo é um rascunho de IA que necessita de revisão humana.', margin, pageHeight - 30);
}

// Email Draft Preparation
function prepareEmailDraft() {
  const session = state.activeSession;
  if (!session) return;

  const dateStr = new Date(session.createdAt).toLocaleString('pt-PT');
  const durStr = formatDurationShort(session.durationMs || 0);
  const statusStr = session.isReviewed ? 'Revisto por humano' : 'Rascunho de IA';

  const subject = `[VozKriolu Studio] Transcrição: ${session.title}`;

  const body = `=== VOZKRIOLU STUDIO - TRANSCRIÇÃO DE ÁUDIO ===
Título da Sessão: ${session.title}
Data: ${dateStr}
Duração: ${durStr}
Variante Dialetal: ${session.dialectVariant || 'Santiago'}
Língua de Origem: ${session.spokenLanguage || 'Automática'}
Estado: ${statusStr}

--- CRIOULO DE CABO VERDE (ALUPEC) ---
${session.krioluTranscription || '(Sem texto em crioulo transcrito)'}

--- TEXTO RECONHECIDO ORIGINAL ---
${session.originalRecognizedText || '(Sem texto original reconhecido)'}

==============================================
Aviso: O texto em Crioulo é um rascunho gerado por IA que requer revisão humana.
Preparado através do VozKriolu Studio.`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');

  // Explicit notice requirement: nunca diz que foi enviado
  showNotification('O seu programa de e-mail foi aberto com a mensagem pronta. (O e-mail foi apenas preparado, NÃO foi enviado).');
}

// ==========================================
// 12. Setup Event Handlers
// ==========================================
function initEvents() {
  // Navigation tabs
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Recording Buttons
  elements.btnRecord.addEventListener('click', startRecording);
  elements.btnPauseRecord.addEventListener('click', pauseRecording);
  elements.btnResumeRecord.addEventListener('click', resumeRecording);
  elements.btnStopRecord.addEventListener('click', stopRecording);

  // Playback Button
  elements.btnPlayAudio.addEventListener('click', toggleAudioPlayback);

  // Transcription
  elements.btnTranscribe.addEventListener('click', requestTranscriptionFlow);
  elements.btnConsentCancel.addEventListener('click', () => {
    elements.modalAiConsent.classList.add('hidden');
  });
  elements.btnConsentConfirm.addEventListener('click', executeGeminiTranscription);

  // Dialect Variant Chips
  elements.variantChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.variantChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.dialectVariant = chip.dataset.variant;
      if (state.activeSession) {
        state.activeSession.dialectVariant = state.dialectVariant;
        dbSaveSession(state.activeSession);
      }
    });
  });

  // Spoken Language Chips
  elements.languageChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.languageChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.spokenLanguage = chip.dataset.lang;
      if (state.activeSession) {
        state.activeSession.spokenLanguage = state.spokenLanguage;
        dbSaveSession(state.activeSession);
      }
    });
  });

  // Editor changes: "tem a caixa «Já revi este texto», que desaparece se o texto for editado"
  elements.txtKrioluEditor.addEventListener('input', () => {
    if (elements.chkReviewed.checked) {
      elements.chkReviewed.checked = false;
    }
    elements.reviewedIndicator.classList.add('hidden');
    if (state.activeSession) {
      state.activeSession.krioluTranscription = elements.txtKrioluEditor.value;
      state.activeSession.isReviewed = false;
      dbSaveSession(state.activeSession);
    }
  });

  // Review Checkbox toggle
  elements.chkReviewed.addEventListener('change', () => {
    const reviewed = elements.chkReviewed.checked;
    elements.reviewedIndicator.classList.toggle('hidden', !reviewed);
    if (state.activeSession) {
      state.activeSession.isReviewed = reviewed;
      dbSaveSession(state.activeSession);
    }
  });

  // Search input
  elements.inputSearch.addEventListener('input', () => {
    elements.btnClearSearch.classList.toggle('hidden', !elements.inputSearch.value);
    renderRepositoryList();
  });
  elements.btnClearSearch.addEventListener('click', () => {
    elements.inputSearch.value = '';
    elements.btnClearSearch.classList.add('hidden');
    renderRepositoryList();
  });

  // File Import
  elements.fileAudioInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAudioImport(e.target.files[0]);
    }
  });

  // Repo Record Button
  elements.btnRepoNewRecord.addEventListener('click', () => {
    switchView('studio');
    startRecording();
  });

  // Export Record Button
  elements.btnExportRecord.addEventListener('click', () => {
    switchView('studio');
    startRecording();
  });

  // Export Select
  elements.selectExportSession.addEventListener('change', async (e) => {
    const id = e.target.value;
    if (id) {
      const session = await dbGetSession(id);
      state.activeSession = session;
      renderExportPreview(session);
    }
  });

  // Export Actions
  elements.btnExportPdf.addEventListener('click', exportPdfA4);
  elements.btnPrepareEmail.addEventListener('click', prepareEmailDraft);

  elements.btnCopyText.addEventListener('click', () => {
    if (state.activeSession && state.activeSession.krioluTranscription) {
      navigator.clipboard.writeText(state.activeSession.krioluTranscription);
      showNotification('Texto em Crioulo copiado para a área de transferência!');
    }
  });

  elements.btnDownloadAudio.addEventListener('click', () => {
    downloadSessionAudio(state.activeSession);
  });

  elements.btnBackToStudio.addEventListener('click', () => {
    switchView('studio');
  });

  // Delete modal
  elements.btnDeleteCancel.addEventListener('click', () => {
    elements.modalDelete.classList.add('hidden');
    state.sessionPendingDelete = null;
  });

  elements.btnDeleteConfirm.addEventListener('click', async () => {
    if (state.sessionPendingDelete) {
      await dbDeleteSession(state.sessionPendingDelete.id);
      if (state.activeSession && state.activeSession.id === state.sessionPendingDelete.id) {
        state.activeSession = null;
      }
      elements.modalDelete.classList.add('hidden');
      state.sessionPendingDelete = null;
      renderRepositoryList();
      showNotification('Sessão eliminada do IndexedDB.');
    }
  });

  // Toast close
  elements.notificationClose.addEventListener('click', () => {
    elements.notificationToast.classList.add('hidden');
  });

  // API Key Modal Events & Settings
  if (elements.btnApiKey) {
    elements.btnApiKey.addEventListener('click', () => openApiKeyModal());
  }
  if (elements.btnApiKeyCancel) {
    elements.btnApiKeyCancel.addEventListener('click', closeApiKeyModal);
  }
  if (elements.btnApiKeySave) {
    elements.btnApiKeySave.addEventListener('click', saveApiKeyAndTranscribe);
  }
  if (elements.inputApiKey) {
    elements.inputApiKey.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveApiKeyAndTranscribe();
      }
    });
  }
  if (elements.btnToggleApiKeyVisibility) {
    elements.btnToggleApiKeyVisibility.addEventListener('click', toggleApiKeyVisibility);
  }
  if (elements.btnClearApiKey) {
    elements.btnClearApiKey.addEventListener('click', clearApiKey);
  }
  if (elements.btnOpenSettingsFromError) {
    elements.btnOpenSettingsFromError.addEventListener('click', () => openApiKeyModal());
  }

  // Window resize for waveform
  window.addEventListener('resize', () => {
    setupWaveformCanvas();
    drawWaveformStatic(0);
  });

  // Keyboard Shortcuts (Dicas de Atalhos)
  window.addEventListener('keydown', (e) => {
    const isEditing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    // Alt + R: Gravar / Parar
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      if (state.recordState === 'recording' || state.recordState === 'paused') {
        stopRecording();
      } else {
        switchView('studio');
        startRecording();
      }
      return;
    }

    // Alt + P: Pausar / Retomar
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (state.recordState === 'recording') {
        pauseRecording();
      } else if (state.recordState === 'paused') {
        resumeRecording();
      }
      return;
    }

    // Space: Play/Pause audio (only when not typing in an input/textarea)
    if (e.code === 'Space' && !isEditing) {
      e.preventDefault();
      toggleAudioPlayback();
      return;
    }

    // Alt + T: Transcrever
    if (e.altKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      if (!elements.btnTranscribe.disabled) {
        requestTranscriptionFlow();
      }
      return;
    }

    // Alt + E: Focar no Editor Crioulo
    if (e.altKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      switchView('studio');
      elements.txtKrioluEditor.focus();
      return;
    }

    // Alt + 1, 2, 3: Alternar entre vistas
    if (e.altKey && e.key === '1') { e.preventDefault(); switchView('studio'); return; }
    if (e.altKey && e.key === '2') { e.preventDefault(); switchView('repository'); return; }
    if (e.altKey && e.key === '3') { e.preventDefault(); switchView('export'); return; }
  });
}

// ==========================================
// 13. Application Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupWaveformCanvas();
  drawWaveformStatic(0);
  initEvents();
  updateApiKeyUiStatus();

  // Load most recent session if available
  const sessions = await dbGetAllSessions();
  if (sessions.length > 0) {
    loadSessionIntoUI(sessions[0]);
  }
});
