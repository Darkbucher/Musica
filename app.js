const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const songName = document.querySelector(".music-player h1");
const artistName = document.querySelector(".music-player p");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const effectToggle = document.getElementById("effect-toggle");
const loading = document.querySelector(".loading");

const songs = [

  //1
  {
    title: "Smoked OUT",
    name: "TREVASPURA",
    source: "song-list/SMOKED.mp3",
  },
  //2
  {
    title: "VENGEANCE🌻",
    name: "TREVASPURA",
    source: "song-list/VENGEANCE.mp3",
  },
  //3
  {
    title: "GLORY 🐦‍🔥",
    name: "RXCV XEZ",
    source: "song-list/GLORY.mp3",
  },
   //14
   {
    title: "CANDY SHOP",
    name: "50-Cent",
    source: "song-list/candy.mp3",
    },
  //4
  {
    title: "FXCK IT, LEt's G0",
    name: "RYnera",
    source: "song-list/FUCKIT.mp3",
  },
  //5
  {
    title: "Died once",
    name: "Yeat",
    source: "song-list/Died.mp3",
  },
  //6
  {
    title: "The Bottom 2",
    name: "Yehuti 90",
    source: "song-list/The Bottom 2.mp3",
  },
  //7
  {
    title: "Aim On Me",
    name: "Adarsh",
    source: "song-list/Aim on me.mp3",
  },
  //8
  {
    title: "EXPLICIT GLAMOUR",
    name: "Aias1 -ft. Sivana 🦄",
    source: "song-list/GLAMOUR-slowedandreverbstudio.mp3",
  },
  //9
  {
    title: "Million Doller Baby",
    name: "Delion Richman 💸",
    source: "song-list/MDB.mp3",
  },
  //10
  {
    title: "MAFIA GAME ",
    name: "Aias1 ft. Sivana",
    source: "song-list/MAFIA game ❄️.mp3",
  },
  //11
  {
    title: "Mexican Phonk Eki",
    name: "Eki MXiCVON",
    source: "song-list/Mexican Phonk Eki.mp3",
  },
  //12
  {
    title: "New thing",
    name: "ZICO Ft. Homies",
    source: "song-list/New_thing.mp3",
  },
  //13
  {
    title: "Flawless",
    name: "Yeat",
    source: "song-list/FLAWLES.mp3",
  },
    
    //15
    {
      title: "She goT NiGGa",
      name: "YeaTI",
      source: "song-list/nigga.mp3",
      }

];

//! Updating song info

let currentSongIndex = 3;

function updateSongInfo() {
  songName.textContent = songs[currentSongIndex].title;
  artistName.textContent = songs[currentSongIndex].name;
  song.src = songs[currentSongIndex].source;
  
  // Show loading indicator only when loading new song
  if (loading) {
    loading.style.display = 'flex';
  }

  song.addEventListener("loadeddata", function () {
    if (loading) {
      loading.style.display = 'none';
    }
  }, { once: true }); // Use once: true to prevent multiple listeners
  
  song.addEventListener("error", function() {
    console.error('Error loading audio file:', song.src);
    if (loading) {
      loading.style.display = 'none';
    }
  }, { once: true });
}

//! Showing the current time and updating the progress bar more frequently

song.addEventListener("timeupdate", function () {
  if (!song.paused) {
    progress.value = song.currentTime;
    updateTimeDisplay();
  }
});

//! Duration and current time of the song for the progress bar

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
  updateTimeDisplay();
});

// Optimize canvas rendering
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Set canvas size with device pixel ratio
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Set display size
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  // Scale context to account for pixel ratio
  ctx.scale(dpr, dpr);
  
  // Adjust effect sizes for mobile
  if (width < 768) {
    // Reduce particle sizes and counts for mobile
    const mobileScale = Math.min(width / 768, 1);
    ctx.globalAlpha = 0.7; // Increase visibility on mobile
  } else {
    ctx.globalAlpha = 0.5; // Normal opacity for desktop
  }
}

// Call resize on load and orientation change
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

// Cache DOM elements
const elements = {
  progress: document.getElementById("progress"),
  song: document.getElementById("song"),
  controlIcon: document.getElementById("controlIcon"),
  playPauseButton: document.querySelector(".play-pause-btn"),
  forwardButton: document.querySelector(".controls button.forward"),
  backwardButton: document.querySelector(".controls button.backward"),
  songName: document.querySelector(".music-player h1"),
  artistName: document.querySelector(".music-player p"),
  currentTimeDisplay: document.getElementById("current-time"),
  totalTimeDisplay: document.getElementById("total-time"),
  canvas: document.getElementById("visualizer"),
  effectToggle: document.getElementById("effect-toggle"),
  loading: document.querySelector(".loading")
};

// Hide loading screen initially
if (elements.loading) {
  elements.loading.style.display = 'none';
}

// Optimize audio context setup
let audioContext;
let analyser;
let dataArray;
let animationId;
let isInitialized = false;

function setupAudioContext() {
  if (!isInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaElementSource(elements.song);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    isInitialized = true;
  }
}

// Optimize effect switching
let currentEffect = 0;
const effectTypes = ['circular', 'wave', 'spiral', 'matrix'];
let lastEffectChange = Date.now();
let autoChangeEffects = true;

// Debounce effect switching
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedEffectSwitch = debounce(() => {
  currentEffect = (currentEffect + 1) % effectTypes.length;
  lastEffectChange = Date.now();
}, 300);

// Optimize effect toggle
elements.effectToggle.addEventListener('click', () => {
  autoChangeEffects = !autoChangeEffects;
  if (!autoChangeEffects) {
    debouncedEffectSwitch();
    elements.effectToggle.style.animation = 'none';
    requestAnimationFrame(() => {
      elements.effectToggle.style.animation = 'blink 2s infinite';
    });
  }
});

// Optimize animation frame
function animate() {
  if (!analyser) return;
  
  animationId = requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);
  
  // Use requestAnimationFrame timestamp for smoother animations
  const time = performance.now() * 0.001;
  
  // Clear canvas with a very subtle fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate average frequency more efficiently
  const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  
  // Change effect every 30 seconds if auto-change is enabled
  if (autoChangeEffects && time - lastEffectChange > 30) {
    debouncedEffectSwitch();
  }
  
  // Create subtle gradient flash effect
  if (average > 50) {
    const intensity = Math.min(average / 255, 0.8); // Increased intensity
    const corners = [
      { x: 0, y: 0 },                    // Top-left
      { x: canvas.width, y: 0 },         // Top-right
      { x: 0, y: canvas.height },        // Bottom-left
      { x: canvas.width, y: canvas.height } // Bottom-right
    ];

    corners.forEach(corner => {
      const gradient = ctx.createRadialGradient(
        corner.x, corner.y, 0,
        corner.x, corner.y, canvas.width * 0.7
      );
      
      gradient.addColorStop(0, `rgba(255, 50, 150, ${intensity * 0.9})`); // Deep pink-magenta
      gradient.addColorStop(0.25, `rgba(75, 200, 255, ${intensity * 0.4})`);  // Bright sky blue
      gradient.addColorStop(0.5, `rgba(150, 50, 255, ${intensity * 0.2})`); // Vivid medium purple
      gradient.addColorStop(0.75, `rgba(50, 0, 100, ${intensity * 0.6})`);  // Deep violet
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);                         // Full fade-out to transparent
      
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }
  
  // Draw corner equalizer
  drawCornerEqualizer();
  
  // Apply current effect
  switch(effectTypes[currentEffect]) {
    case 'circular': drawCircularEffect(time); break;
    case 'wave': drawWaveEffect(time); break;
    case 'spiral': drawSpiralEffect(time); break;
    case 'matrix': drawMatrixEffect(); break;
  }
}

// Add corner equalizer function
function drawCornerEqualizer() {
  const cornerSize = 100;
  const barCount = 20;
  const barWidth = cornerSize / barCount;
  const cornerX = canvas.width - cornerSize - 20;
  const cornerY = canvas.height - cornerSize - 20;
  
  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(cornerX, cornerY, cornerSize, cornerSize);
}

// Modify existing effects to be more subtle
function drawCircularEffect(time) {
  const radius = canvas.width * 0.3;
  const isMobile = window.innerWidth < 768;
  const particleSize = isMobile ? 15 : 10; // Larger particles on mobile
  const lineWidth = isMobile ? 3 : 2; // Thicker lines on mobile
  
  for (let i = 0; i < dataArray.length; i += 2) {
    const value = dataArray[i];
    const percent = value / 255;
    const angle = (i / dataArray.length) * Math.PI * 2 + time;
    
    const x = canvas.width / 2 + Math.cos(angle) * radius * percent;
    const y = canvas.height / 2 + Math.sin(angle) * radius * percent;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${percent * 0.8})`); // Increased opacity
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, particleSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    if (i > 0) {
      const prevValue = dataArray[i - 2];
      const prevPercent = prevValue / 255;
      const prevAngle = ((i - 2) / dataArray.length) * Math.PI * 2 + time;
      const prevX = canvas.width / 2 + Math.cos(prevAngle) * radius * prevPercent;
      const prevY = canvas.height / 2 + Math.sin(prevAngle) * radius * prevPercent;
      
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${percent * 0.4})`; // Increased line opacity
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }
}

// Wave effect
function drawWaveEffect(time) {
  ctx.beginPath();
  
  for (let x = 0; x < canvas.width; x += 5) {
    const i = Math.floor((x / canvas.width) * dataArray.length);
    const value = dataArray[i];
    const percent = value / 255;
    const y = canvas.height / 2 + Math.sin(x * 0.01 + time) * 100 * percent;
    
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Spiral effect
function drawSpiralEffect(time) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.beginPath();
  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i];
    const percent = value / 255;
    const angle = i * 0.1 + time;
    const radius = 50 + percent * 200;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Matrix-like effect
function drawMatrixEffect() {
  const gridSize = 20;
  const cols = Math.floor(canvas.width / gridSize);
  const rows = Math.floor(canvas.height / gridSize);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const index = Math.floor((i / cols) * dataArray.length);
      const value = dataArray[index];
      const percent = value / 255;
      
      const x = i * gridSize;
      const y = j * gridSize;
      const size = gridSize * 0.8 * percent;
      
      ctx.beginPath();
      ctx.arc(x + gridSize/2, y + gridSize/2, size/2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${percent * 0.5})`;
      ctx.fill();
    }
  }
}

// Update play/pause functions to handle visualizer
function playSong() {
  if (!audioContext) {
    setupAudioContext();
  }
  song.play();
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
  animate();
}

function pauseSong() {
  song.pause();
  controlIcon.classList.remove("fa-pause");
  controlIcon.classList.add("fa-play");
  cancelAnimationFrame(animationId);
}

//! Function to play or pause the music

function playPause() {
  if (song.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

playPauseButton.addEventListener("click", playPause);

//! Jumping to the desired time of the song by clicking the progress bar

progress.addEventListener("input", function () {
  song.currentTime = progress.value;
});

//! When the song is still paused, if you click the progress bar, the song keeps playing

progress.addEventListener("change", function () {
  playSong();
});

//! Next song

forwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

//! Previous song

backwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});

updateSongInfo();

// Add touch-friendly swipe controls
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next song
      currentSongIndex = (currentSongIndex + 1) % songs.length;
    } else {
      // Swipe right - previous song
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }
    updateSongInfo();
    playSong();
  }
}

// Prevent default touch behaviors
document.addEventListener('touchmove', e => {
  if (e.target.closest('.swiper')) {
    e.preventDefault();
  }
}, { passive: false });

// Optimize Swiper for mobile
var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  centeredSlides: true,
  initialSlide: 3,
  slidesPerView: "auto",
  allowTouchMove: true, // Enable touch on mobile
  spaceBetween: 40,
  coverflowEffect: {
    rotate: 25,
    stretch: 0,
    depth: 50,
    modifier: 1,
    slideShadows: false,
  },
  navigation: {
    nextEl: ".forward",
    prevEl: ".backward",
  },
  // Add mobile-specific settings
  touchRatio: 1,
  touchAngle: 45,
  resistance: true,
  resistanceRatio: 0.85,
  watchSlidesProgress: true,
  preventInteractionOnTransition: true,
});

// Add double-tap to play/pause
let lastTap = 0;
document.addEventListener('touchend', e => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    playPause();
  }
  lastTap = currentTime;
});

// Format time in minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update time display
function updateTimeDisplay() {
  currentTimeDisplay.textContent = formatTime(song.currentTime);
  totalTimeDisplay.textContent = formatTime(song.duration);
}

// Initialize the player
document.addEventListener('DOMContentLoaded', function() {
  updateSongInfo();
  // Hide loading screen after everything is loaded
  if (elements.loading) {
    elements.loading.style.display = 'none';
  }
});

