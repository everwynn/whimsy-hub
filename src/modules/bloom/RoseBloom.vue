<template>
  <div class="scene-wrapper" ref="wrapperRef">
    <canvas ref="canvasRef" @click="onCanvasClick" />
    <div class="top-text">
<!--      鹊桥已成 · 牛郎织女终相会 · 点击画面有惊喜 · 可开启背景音乐-->
      · 牛郎织女终相会 ·
    </div>
    <div v-if="!isSharedView" class="button-group">
      <div class="icon-wrapper" @mouseenter="showTooltip('rose')" @mouseleave="hideTooltip">
        <a :href="withBase('/rose')" class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- 简洁的玫瑰花图标 -->
            <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /> <!-- 花心 -->
            <path d="M12 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /> <!-- 内花瓣 -->
            <path d="M12 2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" /> <!-- 外花瓣 -->
            <path d="M8 14l-2 4" /> <!-- 花茎 -->
            <path d="M16 14l2 4" /> <!-- 花茎 -->
            <path d="M10 16l-2 4" /> <!-- 花茎 -->
            <path d="M14 16l2 4" /> <!-- 花茎 -->
            <path d="M10 16c0 1 1.5 2 2 2s2-1 2-2" /> <!-- 叶子 -->
          </svg>
        </a>
        <div :class="{'tooltip': true, 'visible': tooltip === 'rose'}">玫瑰花</div>
      </div>
      <div class="icon-wrapper" @mouseenter="showTooltip('fortune')" @mouseleave="hideTooltip">
        <a :href="withBase('/blessing/qixi')" class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- 简洁的摇签筒图标 -->
            <path d="M8 3h8v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V3z" /> <!-- 筒身 -->
            <path d="M10 3L8 1" /> <!-- 顶部装饰 -->
            <path d="M14 3L16 1" /> <!-- 顶部装饰 -->
            <path d="M12 5v4" /> <!-- 筒内签条 -->
            <path d="M12 10v4" /> <!-- 筒内签条 -->
            <path d="M12 15v4" /> <!-- 筒内签条 -->
          </svg>
        </a>
        <div :class="{'tooltip': true, 'visible': tooltip === 'fortune'}">摇签</div>
      </div>
      <div class="icon-wrapper" @mouseenter="showTooltip('share')" @mouseleave="hideTooltip">
        <button @click="shareContent" class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- 简洁的分享图标 -->
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98" />
            <path d="M15.41 6.51l-6.82 3.98" />
          </svg>
        </button>
        <div :class="{'tooltip': true, 'visible': tooltip === 'share'}">分享</div>
      </div>
    </div>
    <!-- 使用统一的音乐播放器组件 -->
    <MusicPlayer :music-src="musicSrc" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { buildShareUrl } from '../../utils/shareCodec';
import type { SharePayload } from '../../utils/shareCodec';
import MusicPlayer from '../../components/shared/MusicPlayer.vue';
import { withBase } from '../../utils/baseUrl';

interface Props { autoPlay?: boolean; showControls?: boolean; loop?: boolean; }
const props = withDefaults(defineProps<Props>(), { autoPlay: true, showControls: true, loop: false });
const emit = defineEmits<{ (e: 'scene-complete'): void }>();

const wrapperRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
// 移除了原来的 audioRef，因为使用了 MusicPlayer 组件
const isPlaying = ref(true);
const musicOn = ref(false);
const audioLoaded = ref(false);
const musicSrc = withBase('musics/clavier-music-canon-canon-in-d.mp3');

// 检测是否为分享页面
const isSharedView = ref(false);

// 在组件挂载时检查 URL 参数
onMounted(() => {
  // 检查 URL 中是否有分享相关的参数
  const urlParams = new URLSearchParams(window.location.search);
  const encodedParam = urlParams.get('s'); // 假设分享链接使用 's' 参数
  
  isSharedView.value = !!encodedParam;
});

// 添加 tooltip 相关数据
const tooltip = ref('');

function showTooltip(iconType: string) {
  tooltip.value = iconType;
}

function hideTooltip() {
  tooltip.value = '';
}

// 分享功能
function shareContent() {
  // 构建分享载荷
  const payload: SharePayload = {
    festivalId: 'qixi',
    step: 1,
    from: '牛郎织女鹊桥相会',
    msg: '欣赏牛郎织女鹊桥相会的浪漫场景'
  };

  // 生成加密分享链接
  const shareLink = buildShareUrl(payload);

  // 如果浏览器支持 Web Share API
  if (navigator.share) {
    navigator.share({
      title: '七夕鹊桥相会',
      text: '欣赏牛郎织女鹊桥相会的浪漫场景',
      url: shareLink
    }).catch(console.error);
  } else {
    // 否则复制链接到剪贴板
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('链接已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  }
}

let animationId: number | null = null;
let startTime = 0;
let paused = false;
let pausedAt = 0;
let ctx: CanvasRenderingContext2D;
let cw = 0, ch = 0, dpr = 1;

const SCENE_DURATION = 18;
const PERSON_HEIGHT = 115;

// 桥参数
let bridgeCx = 0, bridgeCy = 0, bridgeW = 0, bridgeH = 0;
const ROW_SPACING = 7;
const ROW_COUNT = 5;

// 星空
interface Star { x: number; y: number; size: number; alpha: number; tw: number; twOff: number; }
let stars: Star[] = [];

// 极光
interface Aurora { x: number; y: number; w: number; hue: number; alpha: number; speed: number; phase: number; }
let auroras: Aurora[] = [];

// 喜鹊
interface Magpie {
  startX: number; startY: number;
  targetT: number; targetRow: number;
  x: number; y: number;
  flyDelay: number; flyDuration: number; flyProgress: number;
  wingPhase: number; wingSpeed: number;
  size: number;
  arrived: boolean;
  colorProgress: number;
  hue: number;
  side: number; // -1 left, 1 right
  trail: { x: number; y: number; alpha: number }[];
}
let magpies: Magpie[] = [];

// 暖色调色相：金→橙→红→玫红→粉→品红
function warmHue(t: number): number {
  return ((50 - t * 100) + 360) % 360;
}

// 人物
interface Person {
  startT: number; currentT: number; targetT: number;
  delay: number; duration: number;
  type: 'cowherd' | 'weaver';
  walkProgress: number;
  bobPhase: number;
  alpha: number;
}
let persons: Person[] = [];

// 玫瑰
interface Rose {
  x: number; y: number;
  delay: number;
  bloomProgress: number;
  sway: number;
  petals: { angle: number; layer: number; length: number; width: number; delay: number }[];
  stemHeight: number;
}
let roses: Rose[] = [];

// 爆发粒子
interface Sparkle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number; color: string; gravity: number; }
let sparkles: Sparkle[] = [];
interface FallingPetal { x: number; y: number; vx: number; vy: number; rotation: number; rotSpeed: number; size: number; alpha: number; color: string; swayPhase: number; }
let fallingPetals: FallingPetal[] = [];

// 诗句
interface PoetryLine { text: string; x: number; y: number; alpha: number; showTime: number; duration: number; }
let poetryLines: PoetryLine[] = [];
const POETRY = ['金风玉露一相逢', '便胜却人间无数', '两情若是久长时，又岂在朝朝暮暮'];

let burstTriggered = false;
let roseTriggered = false;
let sceneCompleteEmitted = false;
let lastPetalSpawn = 0;

// ============ 初始化 ============
function initScene() {
  bridgeCx = cw * 0.5;
  bridgeCy = ch * 0.62;
  bridgeW = Math.min(cw * 0.88, 1000);
  bridgeH = Math.min(ch * 0.25, 180);

  // 星空
  stars = [];
  const starCount = Math.min(250, Math.floor((cw * ch) / 5000));
  for (let i = 0; i < starCount; i++) {
    stars.push({ x: Math.random() * cw, y: Math.random() * ch * 0.75, size: 0.3 + Math.random() * 2.5, alpha: 0.1 + Math.random() * 0.7, tw: 0.5 + Math.random() * 3, twOff: Math.random() * Math.PI * 2 });
  }

  // 极光
  auroras = [];
  for (let i = 0; i < 3; i++) {
    auroras.push({ x: cw * (0.2 + i * 0.3), y: ch * (0.12 + i * 0.04), w: cw * (0.4 + Math.random() * 0.2), hue: [260, 280, 300][i], alpha: 0.05 + Math.random() * 0.04, speed: 0.003 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2 });
  }

  // 喜鹊
  initMagpies();

  // 人物
  persons = [
    { startT: 0, currentT: 0, targetT: 0.485, delay: 12, duration: 4, type: 'cowherd', walkProgress: 0, bobPhase: 0, alpha: 0 },
    { startT: 1, currentT: 1, targetT: 0.515, delay: 12, duration: 4, type: 'weaver', walkProgress: 0, bobPhase: Math.PI, alpha: 0 },
  ];

  // 诗句
  poetryLines = POETRY.map((text, i) => ({ text, x: cw * 0.5, y: ch * 0.36 + i * 30, alpha: 0, showTime: 16.5 + i * 0.6, duration: 8 }));

  burstTriggered = false;
  roseTriggered = false;
  sceneCompleteEmitted = false;
  lastPetalSpawn = 0;
  sparkles = [];
  fallingPetals = [];
}

function initMagpies() {
  magpies = [];
  const totalPerSide = 45;
  const rows = ROW_COUNT;
  const perRow = Math.ceil(totalPerSide / rows);
  const spacing = 0.48 / perRow;

  for (let side = 0; side < 2; side++) {
    const s = side === 0 ? -1 : 1;
    let idx = 0;
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < perRow; i++) {
        if (idx >= totalPerSide) break;
        // 从中心(0.5)向两侧对称分布
        const tBase = side === 0 ? 0.50 - (i + 1) * spacing : 0.50 + (i + 1) * spacing;
        // 离中心越远越早飞 → 从两端往中间搭建
        const distFromCenter = Math.abs(tBase - 0.5) * 2; // 0=中心, 1=两端
        const flyDelay = 2 + (1 - distFromCenter) * 5.5 + row * 0.3 + Math.random() * 0.4;
        magpies.push({
          startX: s < 0 ? -50 - Math.random() * 100 : cw + 50 + Math.random() * 100,
          startY: ch * (0.15 + Math.random() * 0.2),
          targetT: tBase,
          targetRow: row,
          x: s < 0 ? -50 : cw + 50,
          y: ch * (0.15 + Math.random() * 0.2),
          flyDelay,
          flyDuration: 1.5 + Math.random() * 0.8,
          flyProgress: 0,
          wingPhase: Math.random() * Math.PI * 2,
          wingSpeed: 10 + Math.random() * 6,
          size: (28 + row * 4 + Math.random() * 5),
          arrived: false,
          colorProgress: 0,
          hue: warmHue(tBase),
          side: s,
          trail: [],
        });
        idx++;
      }
    }
  }
}

function initRoses() {
  roses = [];
  const cx = bridgePoint(0.5, 0).x;
  const cy = bridgePoint(0.5, 0).y - 5;
  // 5朵玫瑰：中间1朵，左右各2朵
  const positions = [
    { dx: 0, dy: 0 },
    { dx: -35, dy: 10 },
    { dx: 35, dy: 10 },
    { dx: -65, dy: 20 },
    { dx: 65, dy: 20 },
  ];
  for (let i = 0; i < 5; i++) {
    const petals = [];
    const layers = 6;
    for (let l = 0; l < layers; l++) {
      const count = 6 + l;
      for (let j = 0; j < count; j++) {
        petals.push({
          angle: (j / count) * Math.PI * 2 + l * 0.3,
          layer: l,
          length: 10 + l * 5,
          width: 6 + l * 2.5,
          delay: (l / layers) * 0.4,
        });
      }
    }
    roses.push({
      x: cx + positions[i].dx,
      y: cy + positions[i].dy,
      delay: 18 + i * 0.6,
      bloomProgress: 0,
      sway: Math.random() * Math.PI * 2,
      petals,
      stemHeight: 0,
    });
  }
}

// ============ 桥上点位 ============
function bridgePoint(t: number, row: number): { x: number; y: number } {
  const x = bridgeCx + (t - 0.5) * bridgeW;
  const arc = Math.sin(t * Math.PI);
  const y = bridgeCy - arc * bridgeH + row * ROW_SPACING;
  return { x, y };
}

// ============ 缓动 ============
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuad(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ============ 背景绘制 ============
function drawBackground(t: number) {
  const bg = ctx.createRadialGradient(cw * 0.5, ch * 0.4, 50, cw * 0.5, ch * 0.5, Math.max(cw, ch));
  bg.addColorStop(0, '#1a1040');
  bg.addColorStop(0.3, '#0e0828');
  bg.addColorStop(0.7, '#080418');
  bg.addColorStop(1, '#03020a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

  drawAuroras(t);
  drawStars(t);
  drawMilkyWay(t);
  drawMountains();
}

function drawAuroras(t: number) {
  for (const a of auroras) {
    const wave = Math.sin(t * a.speed * 60 + a.phase);
    ctx.save();
    const grad = ctx.createLinearGradient(0, a.y - 30, 0, a.y + 50);
    grad.addColorStop(0, `hsla(${a.hue}, 80%, 60%, 0)`);
    grad.addColorStop(0.5, `hsla(${a.hue + 20}, 80%, 65%, ${a.alpha})`);
    grad.addColorStop(1, `hsla(${a.hue}, 80%, 60%, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(a.x - a.w / 2, a.y - 30 + wave * 20, a.w, 80);
    ctx.restore();
  }
}

function drawStars(t: number) {
  for (const s of stars) {
    const tw = Math.sin(t * s.tw + s.twOff) * 0.4 + 0.6;
    ctx.save();
    ctx.globalAlpha = s.alpha * tw;
    ctx.fillStyle = '#fff';
    if (s.size > 1.5) { ctx.shadowColor = '#c4b5fd'; ctx.shadowBlur = s.size * 5; }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMilkyWay(t: number) {
  ctx.save();
  ctx.translate(cw * 0.5, ch * 0.22);
  ctx.rotate(-0.12);
  const w = cw * 1.8, h = 80;
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, 'rgba(139, 92, 246, 0)');
  grad.addColorStop(0.5, 'rgba(196, 181, 253, 0.06)');
  grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  for (let i = 0; i < 80; i++) {
    const px = -w / 2 + ((i * 53 + t * 5) % w);
    const py = Math.sin(i * 0.7) * h * 0.3;
    ctx.fillStyle = `rgba(220, 200, 255, ${0.06 + Math.sin(t * 2 + i) * 0.04 + 0.06})`;
    ctx.beginPath();
    ctx.arc(px, py, 0.4 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMountains() {
  ctx.save();
  ctx.fillStyle = 'rgba(20, 12, 35, 0.5)';
  ctx.beginPath();
  ctx.moveTo(0, ch * 0.82);
  ctx.lineTo(cw * 0.12, ch * 0.74); ctx.lineTo(cw * 0.25, ch * 0.8);
  ctx.lineTo(cw * 0.45, ch * 0.72); ctx.lineTo(cw * 0.6, ch * 0.78);
  ctx.lineTo(cw * 0.78, ch * 0.73); ctx.lineTo(cw, ch * 0.8);
  ctx.lineTo(cw, ch); ctx.lineTo(0, ch); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(8, 4, 18, 0.8)';
  ctx.beginPath();
  ctx.moveTo(0, ch * 0.9);
  ctx.lineTo(cw * 0.18, ch * 0.84); ctx.lineTo(cw * 0.35, ch * 0.88);
  ctx.lineTo(cw * 0.55, ch * 0.82); ctx.lineTo(cw * 0.72, ch * 0.86);
  ctx.lineTo(cw, ch * 0.88); ctx.lineTo(cw, ch); ctx.lineTo(0, ch); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ============ 圆月 ============
function drawMoon(time: number) {
  const cx = bridgeCx;
  const cy = ch * 0.26;
  const r = Math.min(cw, ch) * 0.13;
  const pulse = Math.sin(time * 0.6) * 0.02 + 1;

  ctx.save();

  // 外层巨大光晕
  const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.8 * pulse);
  outerGlow.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
  outerGlow.addColorStop(0.3, 'rgba(251, 191, 36, 0.08)');
  outerGlow.addColorStop(0.7, 'rgba(244, 63, 94, 0.03)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.8 * pulse, 0, Math.PI * 2); ctx.fill();

  // 月亮本体
  const moonGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
  moonGrad.addColorStop(0, '#fffbeb');
  moonGrad.addColorStop(0.4, '#fef3c7');
  moonGrad.addColorStop(0.8, '#fde68a');
  moonGrad.addColorStop(1, '#fbbf24');
  ctx.fillStyle = moonGrad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // 月亮表面淡淡纹理
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#d97706';
  ctx.beginPath(); ctx.arc(cx - r * 0.25, cy + r * 0.1, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.15, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.1, cy + r * 0.45, r * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ============ 喜鹊更新 ============
function updateMagpies(elapsed: number) {
  for (const m of magpies) {
    if (m.arrived) {
      if (m.colorProgress < 1) m.colorProgress = Math.min(1, m.colorProgress + 0.02);
      continue;
    }
    if (elapsed < m.flyDelay) continue;
    const t = Math.min(1, (elapsed - m.flyDelay) / m.flyDuration);
    const eased = easeOutCubic(t);
    m.flyProgress = eased;

    const target = bridgePoint(m.targetT, m.targetRow);
    const cpX = (m.startX + target.x) / 2;
    const cpY = Math.min(m.startY, target.y) - 60 - Math.random() * 40;
    m.x = (1 - eased) ** 2 * m.startX + 2 * (1 - eased) * eased * cpX + eased ** 2 * target.x;
    m.y = (1 - eased) ** 2 * m.startY + 2 * (1 - eased) * eased * cpY + eased ** 2 * target.y;

    // 拖尾
    m.trail.unshift({ x: m.x, y: m.y, alpha: 1 });
    if (m.trail.length > 12) m.trail.pop();
    for (const tr of m.trail) tr.alpha *= 0.92;

    if (t >= 1) { m.arrived = true; m.x = target.x; m.y = target.y; m.trail = []; }
  }
}

// ============ 喜鹊绘制 ============
function drawMagpie(m: Magpie, time: number) {
  const target = bridgePoint(m.targetT, m.targetRow);
  const px = m.arrived ? target.x : m.x;
  const py = m.arrived ? target.y : m.y;
  const baseHue = m.hue;
  const colorT = m.colorProgress;
  const size = m.size;

  // 飞行拖尾（暖色发光）
  if (!m.arrived && m.trail.length > 1) {
    ctx.save();
    for (let i = m.trail.length - 1; i >= 0; i--) {
      const tr = m.trail[i];
      const tFade = 1 - i / m.trail.length;
      ctx.globalAlpha = tr.alpha * tFade * 0.5;
      ctx.fillStyle = `hsl(40, 80%, 60%)`;
      ctx.shadowColor = `hsl(40, 90%, 65%)`;
      ctx.shadowBlur = 6 * tFade;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, size * 0.2 * tFade, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(px, py);
  const wingFlap = Math.sin(time * m.wingSpeed + m.wingPhase);

  if (m.arrived) {
    // 到位站姿 - 暖色调
    const sat = lerp(30, 75, colorT);
    const light = lerp(28, 58, colorT);
    const bodyColor = `hsl(${baseHue}, ${sat}%, ${light}%)`;
    ctx.fillStyle = bodyColor;
    if (colorT > 0.2) { ctx.shadowColor = `hsl(${baseHue}, 80%, 60%)`; ctx.shadowBlur = size * 0.6 * colorT; }
    // 身体
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    // 头
    ctx.beginPath(); ctx.arc(size * 0.3, -size * 0.12, size * 0.18, 0, Math.PI * 2); ctx.fill();
    // 喙
    ctx.fillStyle = `hsl(${baseHue}, ${sat}%, ${light + 18}%)`;
    ctx.beginPath(); ctx.moveTo(size * 0.42, -size * 0.12); ctx.lineTo(size * 0.55, -size * 0.08); ctx.lineTo(size * 0.42, -size * 0.04); ctx.closePath(); ctx.fill();
    // 翅膀（微动）
    const wy = wingFlap * 1.5;
    ctx.fillStyle = bodyColor;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-size * 0.25, -size * 0.35 + wy, -size * 0.5, size * 0.08 + wy); ctx.quadraticCurveTo(-size * 0.15, size * 0.15, 0, 0); ctx.closePath(); ctx.fill();
    // 尾巴
    ctx.beginPath(); ctx.moveTo(-size * 0.35, 0); ctx.lineTo(-size * 0.7, -size * 0.05); ctx.lineTo(-size * 0.35, size * 0.08); ctx.closePath(); ctx.fill();
  } else {
    // 飞行姿态 - 暖色深棕 + 发光
    const flyColor = `hsl(35, 45%, 28%)`;
    ctx.rotate(m.side < 0 ? 0.12 : -0.12);
    // 发光底
    ctx.shadowColor = `hsla(40, 90%, 55%, 0.6)`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = flyColor;
    // 身体
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.4, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    // 翅膀（大幅拍打）
    ctx.shadowBlur = 0;
    const wa = wingFlap * 0.7;
    ctx.save(); ctx.rotate(wa);
    ctx.fillStyle = `hsl(35, 40%, 22%)`;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-size * 0.4, -size * 0.55, -size * 0.8, -size * 0.05); ctx.quadraticCurveTo(-size * 0.2, size * 0.1, 0, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.rotate(-wa);
    ctx.fillStyle = `hsl(35, 40%, 22%)`;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-size * 0.4, size * 0.55, -size * 0.8, size * 0.05); ctx.quadraticCurveTo(-size * 0.2, -size * 0.1, 0, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    // 头
    ctx.fillStyle = flyColor;
    ctx.beginPath(); ctx.arc(size * 0.25, -size * 0.08, size * 0.14, 0, Math.PI * 2); ctx.fill();
    // 尾巴
    ctx.beginPath(); ctx.moveTo(-size * 0.25, 0); ctx.lineTo(-size * 0.6, -size * 0.04); ctx.lineTo(-size * 0.25, size * 0.06); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ============ 桥体光效 ============
function drawBridgeGlow(elapsed: number, time: number) {
  const arrivedCount = magpies.filter(m => m.arrived).length;
  if (arrivedCount === 0) return;
  const formRatio = Math.min(1, arrivedCount / magpies.length);

  ctx.save();
  // 桥拱光带
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const hue = warmHue(t);
    const p = bridgePoint(t, 0);
    const glowR = 28 * formRatio;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
    glow.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.06 * formRatio})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2); ctx.fill();
  }
  // 桥拱主线
  ctx.strokeStyle = `rgba(255, 220, 240, ${0.08 * formRatio})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const p = bridgePoint(i / steps, 0);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

// ============ 桥中心相会平台 ============
function drawBridgePlatform(elapsed: number, time: number) {
  const platformStart = 8;
  const platformEnd = 11;
  if (elapsed < platformStart) return;
  const progress = Math.min(1, (elapsed - platformStart) / (platformEnd - platformStart));
  const eased = easeOutCubic(progress);
  const center = bridgePoint(0.5, 0);
  const rx = Math.min(cw, ch) * 0.09;
  const ry = rx * 0.55;
  const pulse = Math.sin(time * 1.5) * 0.05 + 1;

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.globalAlpha = eased;

  // 1. 大范围光晕
  const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.8 * pulse);
  outerGlow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
  outerGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.8 * pulse, ry * 1.8 * pulse, 0, 0, Math.PI * 2); ctx.fill();

  // 2. 平台主体
  const bodyGrad = ctx.createRadialGradient(0, -ry * 0.3, 0, 0, 0, rx);
  bodyGrad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
  bodyGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
  bodyGrad.addColorStop(0.8, 'rgba(244, 63, 94, 0.25)');
  bodyGrad.addColorStop(1, 'rgba(225, 29, 72, 0.15)');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();

  // 3. 外圈亮环
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
  ctx.lineWidth = 2 * eased;
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.92, ry * 0.92, 0, 0, Math.PI * 2); ctx.stroke();

  // 4. 内圈装饰
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2); ctx.stroke();

  // 5. 中心高光
  const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.25 * pulse);
  centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  centerGlow.addColorStop(0.5, 'rgba(254, 240, 138, 0.4)');
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.25 * pulse, ry * 0.25 * pulse, 0, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ============ 人物更新和绘制 ============
function updatePersons(elapsed: number) {
  for (const p of persons) {
    if (elapsed < p.delay) continue;
    if (p.walkProgress >= 1) continue;
    const t = Math.min(1, (elapsed - p.delay) / p.duration);
    const eased = easeInOutQuad(t);
    p.walkProgress = eased;
    p.currentT = p.startT + (p.targetT - p.startT) * eased;
    p.alpha = Math.min(1, eased * 2);
  }
}

function drawPerson(p: Person, time: number) {
  if (p.alpha <= 0) return;
  const pos = bridgePoint(p.currentT, 0);
  const bob = Math.sin(time * 1.5 + p.bobPhase) * 2;
  const px = pos.x;
  const py = pos.y - 4 + bob;
  const h = PERSON_HEIGHT;
  // 头部向中心倾斜的偏移量
  const leanIn = p.type === 'cowherd' ? 5 : -5;

  ctx.save();
  ctx.globalAlpha = p.alpha;

  // 人物发光底
  const glowColor = p.type === 'cowherd' ? 'rgba(124, 169, 255, 0.38)' : 'rgba(255, 130, 190, 0.38)';
  const glow = ctx.createRadialGradient(px + leanIn * 0.6, py - h * 0.45, 0, px + leanIn * 0.6, py - h * 0.45, h * 1.1);
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px + leanIn * 0.6, py - h * 0.45, h * 1.1, 0, Math.PI * 2); ctx.fill();

  // 边缘 rim light
  const rimColor = p.type === 'cowherd' ? 'rgba(180, 170, 255, 0.6)' : 'rgba(255, 150, 200, 0.6)';
  ctx.shadowColor = rimColor;
  ctx.shadowBlur = 24;

  if (p.type === 'cowherd') {
    // 牛郎剪影 - 蓝紫渐变
    const grad = ctx.createLinearGradient(px - 25, py - h, px + 35, py);
    grad.addColorStop(0, '#6b8ce8');
    grad.addColorStop(0.35, '#8b7fd8');
    grad.addColorStop(0.65, '#a78bfa');
    grad.addColorStop(0.9, '#7c3aed');
    grad.addColorStop(1, '#4c1d95');
    ctx.fillStyle = grad;

    // 身体+双臂（并肩，双手在胸前与织女交握）
    ctx.beginPath();
    ctx.moveTo(px - 13, py - h * 0.68);       // 左肩
    ctx.lineTo(px + 10, py - h * 0.64);       // 右肩（略向中心倾）
    // 右臂前伸到中心双手（胸前高度）
    ctx.quadraticCurveTo(px + 18, py - h * 0.6, px + 24, py - h * 0.58);
    ctx.quadraticCurveTo(px + 26, py - h * 0.55, px + 22, py - h * 0.52);
    // 左臂从中心双手回到左肩
    ctx.quadraticCurveTo(px + 8, py - h * 0.5, px - 8, py - h * 0.54);
    ctx.quadraticCurveTo(px - 16, py - h * 0.58, px - 13, py - h * 0.68);
    ctx.closePath();
    ctx.fill();

    // 躯干+衣袍下摆
    ctx.beginPath();
    ctx.moveTo(px - 10, py - h * 0.55);
    ctx.lineTo(px + 8, py - h * 0.53);
    ctx.lineTo(px + 10, py - h * 0.22);
    ctx.quadraticCurveTo(px + 12, py - h * 0.1, px + 5, py); // 右下摆
    ctx.lineTo(px - 10, py); // 左下摆
    ctx.quadraticCurveTo(px - 16, py - h * 0.1, px - 12, py - h * 0.22);
    ctx.closePath();
    ctx.fill();

    // 头（向织女倾斜）
    ctx.beginPath(); ctx.arc(px + leanIn, py - h * 0.8, 12, 0, Math.PI * 2); ctx.fill();
    // 发髻
    ctx.beginPath(); ctx.arc(px + leanIn - 6, py - h * 0.88, 7, 0, Math.PI * 2); ctx.fill();

    // 衣褶高光
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(210, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - h * 0.58); ctx.quadraticCurveTo(px - 4, py - h * 0.42, px - 6, py - h * 0.26);
    ctx.stroke();

    // 牛郎腰带飘带（向左上飘）
    const sway = Math.sin(time * 2.2 + p.bobPhase) * 10;
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px - 4, py - h * 0.32);
    ctx.bezierCurveTo(
      px - 28 + sway, py - h * 0.38,
      px - 44 - sway * 0.6, py - h * 0.55,
      px - 38 + sway, py - h * 0.72
    );
    ctx.stroke();

  } else {
    // 织女剪影 - 玫红紫渐变
    const grad = ctx.createLinearGradient(px + 25, py - h, px - 35, py);
    grad.addColorStop(0, '#f472b6');
    grad.addColorStop(0.3, '#e879f9');
    grad.addColorStop(0.6, '#c084fc');
    grad.addColorStop(0.9, '#9333ea');
    grad.addColorStop(1, '#581c87');
    ctx.fillStyle = grad;

    // 身体+双臂（并肩，双手在胸前与牛郎交握）
    ctx.beginPath();
    ctx.moveTo(px + 13, py - h * 0.7);        // 右肩
    ctx.lineTo(px - 10, py - h * 0.66);       // 左肩（略向中心倾）
    // 左臂前伸到中心双手
    ctx.quadraticCurveTo(px - 18, py - h * 0.62, px - 24, py - h * 0.58);
    ctx.quadraticCurveTo(px - 26, py - h * 0.55, px - 22, py - h * 0.52);
    // 右臂从中心双手回到右肩
    ctx.quadraticCurveTo(px - 8, py - h * 0.5, px + 8, py - h * 0.55);
    ctx.quadraticCurveTo(px + 16, py - h * 0.58, px + 13, py - h * 0.7);
    ctx.closePath();
    ctx.fill();

    // 长裙下摆（宽大飘逸）
    ctx.beginPath();
    ctx.moveTo(px + 8, py - h * 0.55);
    ctx.lineTo(px - 10, py - h * 0.53);
    const dressSway = Math.sin(time * 1.6 + p.bobPhase) * 12;
    ctx.quadraticCurveTo(px - 20 + dressSway, py - h * 0.25, px - 16 + dressSway * 0.6, py); // 左下摆
    ctx.lineTo(px + 18, py); // 右下摆
    ctx.quadraticCurveTo(px + 16, py - h * 0.12, px + 12, py - h * 0.22);
    ctx.closePath();
    ctx.fill();

    // 头（向牛郎倾斜）
    ctx.beginPath(); ctx.arc(px + leanIn, py - h * 0.82, 11, 0, Math.PI * 2); ctx.fill();
    // 高发髻
    ctx.beginPath(); ctx.arc(px + leanIn + 7, py - h * 0.91, 8, 0, Math.PI * 2); ctx.fill();
    // 垂发（与头连接）
    ctx.beginPath();
    ctx.ellipse(px + leanIn + 12, py - h * 0.74, 5, 13, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 裙褶高光
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 180, 220, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 6, py - h * 0.6); ctx.quadraticCurveTo(px + 1, py - h * 0.42, px + 7, py - h * 0.24);
    ctx.stroke();

    // 身后飘带（向右上、向上飞扬）
    const ribbonPhase = time * 3 + p.bobPhase;
    const w1 = Math.sin(ribbonPhase) * 16;
    const w2 = Math.sin(ribbonPhase + 1.3) * 20;
    const w3 = Math.sin(ribbonPhase + 2.6) * 14;
    const w4 = Math.sin(ribbonPhase + 0.8) * 18;

    ctx.lineCap = 'round';

    // 主飘带 - 向右上飞扬
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px + leanIn + 14, py - h * 0.6);
    ctx.bezierCurveTo(
      px + 58 + w1, py - h * 0.78,
      px + 88 + w2, py - h * 0.62,
      px + 76 + w3, py - h * 0.35
    );
    ctx.stroke();

    // 次飘带 - 向右上
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + leanIn + 11, py - h * 0.52);
    ctx.bezierCurveTo(
      px + 48 + w2, py - h * 0.68,
      px + 70 + w3, py - h * 0.52,
      px + 62 + w4, py - h * 0.28
    );
    ctx.stroke();

    // 细飘带 - 向上
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px + leanIn + 8, py - h * 0.45);
    ctx.bezierCurveTo(
      px + 38 + w3, py - h * 0.58,
      px + 54 + w4, py - h * 0.45,
      px + 48 + w1, py - h * 0.22
    );
    ctx.stroke();
  }
  ctx.restore();
}

// ============ 中心相握的双手 ============
function drawClaspedHands(elapsed: number, time: number) {
  const bothArrived = persons.every(p => p.walkProgress >= 0.95);
  if (!bothArrived) return;
  const center = bridgePoint(0.5, 0);
  const fadeStart = persons[0].delay + persons[0].duration - 0.5;
  const fade = Math.min(1, Math.max(0, (elapsed - fadeStart) / 1));
  if (fade <= 0) return;
  const pulse = Math.sin(time * 2.5) * 0.08 + 1;
  const hx = center.x;
  const hy = center.y - PERSON_HEIGHT * 0.55;

  ctx.save();
  ctx.globalAlpha = fade;

  // 手的发光底
  const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12 * pulse);
  glow.addColorStop(0, 'rgba(255, 200, 220, 0.6)');
  glow.addColorStop(0.5, 'rgba(244, 63, 94, 0.25)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(hx, hy, 12 * pulse, 0, Math.PI * 2); ctx.fill();

  // 牛郎的手（偏左蓝色）
  ctx.fillStyle = '#7c6bc4';
  ctx.beginPath(); ctx.ellipse(hx - 3, hy, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  // 织女的手（偏右粉色）
  ctx.fillStyle = '#e879f9';
  ctx.beginPath(); ctx.ellipse(hx + 3, hy, 5, 4, 0.3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ============ 相会心形光晕 ============
function drawHeartHalo(elapsed: number, time: number) {
  const bothArrived = persons.every(p => p.walkProgress >= 0.95);
  if (!bothArrived) return;
  const center = bridgePoint(0.5, 0);
  const fadeStart = persons[0].delay + persons[0].duration - 0.5;
  const fadeProgress = Math.min(1, Math.max(0, (elapsed - fadeStart) / 1.2));
  const eased = easeOutCubic(fadeProgress);
  const pulse = Math.sin(time * 2) * 0.08 + 1;
  const size = 55 * pulse * eased;

  ctx.save();
  ctx.translate(center.x, center.y - 128);
  ctx.globalAlpha = eased;

  // 外层光晕
  const outer = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.6);
  outer.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
  outer.addColorStop(0.5, 'rgba(251, 191, 36, 0.18)');
  outer.addColorStop(1, 'transparent');
  ctx.fillStyle = outer;
  ctx.beginPath(); ctx.arc(0, 0, size * 1.6, 0, Math.PI * 2); ctx.fill();

  // 心形
  ctx.fillStyle = `rgba(244, 63, 94, ${0.85 * eased})`;
  ctx.shadowColor = '#fb7185';
  ctx.shadowBlur = 20 * eased * pulse;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.25);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.25, -size * 0.55, -size * 0.75, 0, -size * 0.55);
  ctx.bezierCurveTo(size * 0.55, -size * 0.75, size * 0.55, -size * 0.25, 0, size * 0.25);
  ctx.closePath();
  ctx.fill();

  // 心形内部高光
  ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * eased})`;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(-size * 0.18, -size * 0.45, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============ 相会爆发 ============
function checkReunion(elapsed: number) {
  const bothMet = persons.every(p => p.walkProgress >= 0.95);
  if (bothMet && !burstTriggered) {
    burstTriggered = true;
    triggerBurst();
  }
}

function triggerBurst() {
  const p = bridgePoint(0.5, 0);
  const colors = ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#f43f5e', '#fda4af', '#fcd34d'];
  for (let i = 0; i < 120; i++) {
    const angle = (i / 120) * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    sparkles.push({
      x: p.x, y: p.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
      size: 1.5 + Math.random() * 3, alpha: 0.6 + Math.random() * 0.4,
      life: 0, maxLife: 80 + Math.random() * 60, color: colors[i % 7], gravity: 0.02,
    });
  }
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 0.5 + Math.random() * 2;
    fallingPetals.push({
      x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.05,
      size: 5 + Math.random() * 7, alpha: 0.7 + Math.random() * 0.3,
      color: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'][Math.floor(Math.random() * 4)],
      swayPhase: Math.random() * Math.PI * 2,
    });
  }
}

function drawBurstRings(elapsed: number) {
  if (!burstTriggered) return;
  const burstTime = elapsed - 16;
  if (burstTime < 0 || burstTime > 3) return;
  const p = bridgePoint(0.5, 0);
  const colors = ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#f43f5e', '#fda4af', '#fcd34d'];
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const ringT = Math.max(0, burstTime - i * 0.1);
    if (ringT <= 0) continue;
    const rT = Math.min(1, ringT / 2);
    const r = rT * (80 + i * 35);
    const alpha = (1 - rT) * 0.35;
    ctx.strokeStyle = colors[i].replace(')', `)`.replace('#', 'rgba('));
    ctx.strokeStyle = `${colors[i]}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 2.5 * (1 - rT);
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
  }
  if (burstTime < 1) {
    const fa = (1 - burstTime) * 0.35;
    const fl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 120);
    fl.addColorStop(0, `rgba(255, 255, 255, ${fa})`);
    fl.addColorStop(0.3, `rgba(254, 240, 138, ${fa * 0.5})`);
    fl.addColorStop(1, 'transparent');
    ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(p.x, p.y, 120, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ============ 玫瑰绽放 ============
function updateRoses(elapsed: number, time: number) {
  for (const r of roses) {
    r.sway = Math.sin(time * 0.8 + r.x * 0.01);
    if (elapsed < r.delay) continue;
    const t = Math.min(1, (elapsed - r.delay) / 6);
    r.bloomProgress = easeOutCubic(t);
    r.stemHeight = Math.min(1, t * 2) * 35;
  }
}

function drawRoses(elapsed: number, time: number) {
  for (const r of roses) {
    if (r.bloomProgress <= 0 && elapsed < r.delay) continue;
    const bp = r.bloomProgress;

    ctx.save();
    ctx.translate(r.x + r.sway * 1.5, r.y);

    // 花茎
    if (r.stemHeight > 0) {
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-2, -r.stemHeight * 0.5, 0, -r.stemHeight); ctx.stroke();
      // 叶子
      if (r.stemHeight > 10) {
        const lp = Math.min(1, (r.stemHeight - 10) / 15);
        ctx.fillStyle = '#22c55e';
        ctx.save(); ctx.translate(-1, -r.stemHeight * 0.4); ctx.rotate(-0.5);
        ctx.beginPath(); ctx.ellipse(0, 0, 6 * lp, 3 * lp, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    // 花朵
    if (bp > 0) {
      ctx.translate(0, -r.stemHeight);
      drawRoseFlower(r, bp, time);
    }
    ctx.restore();
  }
}

function drawRoseFlower(r: Rose, bp: number, time: number) {
  // 花蕾阶段 (bp < 0.15): 绿色小球
  if (bp < 0.15) {
    const budP = bp / 0.15;
    ctx.fillStyle = `hsl(${100 - budP * 40}, 60%, ${20 + budP * 10}%)`;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    return;
  }

  // 花瓣阶段
  const sorted = [...r.petals].sort((a, b) => b.layer - a.layer);
  for (const petal of sorted) {
    const pp = Math.max(0, Math.min(1, (bp - petal.delay) / (1 - petal.delay + 0.01)));
    if (pp <= 0) continue;
    const eased = easeOutCubic(pp);
    const len = petal.length * eased;
    const wid = petal.width * eased;

    ctx.save();
    ctx.rotate(petal.angle);
    ctx.rotate(-Math.PI / 2 + petal.layer * 0.15 * eased);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-wid * 0.8, -len * 0.3, -wid * 0.3, -len * 0.7, 0, -len);
    ctx.bezierCurveTo(wid * 0.3, -len * 0.7, wid * 0.8, -len * 0.3, 0, 0);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, -len * 0.3, 0, 0, -len * 0.5, len);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.4, '#dc2626');
    grad.addColorStop(0.7, '#e11d48');
    grad.addColorStop(1, '#fb7185');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.strokeStyle = '#9f1239';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.restore();
  }

  // 花蕊
  if (bp > 0.6) {
    const cp = Math.min(1, (bp - 0.6) / 0.4);
    const r2 = 4 * easeOutCubic(cp);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r2);
    g.addColorStop(0, '#fef3c7'); g.addColorStop(0.5, '#fbbf24'); g.addColorStop(1, '#d97706');
    ctx.fillStyle = g; ctx.globalAlpha = cp;
    ctx.beginPath(); ctx.arc(0, 0, r2, 0, Math.PI * 2); ctx.fill();
  }

  // 光晕
  if (bp > 0.5) {
    const pulse = Math.sin(time * 1.5 + r.sway) * 0.05 + 0.1;
    const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
    glow.addColorStop(0, `rgba(244, 63, 94, ${pulse * bp})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
  }
}

// ============ 粒子 ============
function drawSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.x += s.vx; s.y += s.vy; s.vy += s.gravity; s.life++;
    if (s.life >= s.maxLife) { sparkles.splice(i, 1); continue; }
    const lr = 1 - s.life / s.maxLife;
    ctx.save(); ctx.globalAlpha = s.alpha * lr; ctx.fillStyle = s.color; ctx.shadowColor = s.color; ctx.shadowBlur = s.size * 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size * lr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}

function drawFallingPetals(time: number) {
  for (let i = fallingPetals.length - 1; i >= 0; i--) {
    const fp = fallingPetals[i];
    const sway = Math.sin(time * 1.5 + fp.swayPhase) * 0.6;
    fp.x += fp.vx + sway; fp.y += fp.vy; fp.vy += 0.01; fp.rotation += fp.rotSpeed; fp.alpha -= 0.003;
    if (fp.y > ch + 20 || fp.alpha <= 0) { fallingPetals.splice(i, 1); continue; }
    ctx.save(); ctx.translate(fp.x, fp.y); ctx.rotate(fp.rotation); ctx.globalAlpha = fp.alpha;
    ctx.beginPath(); ctx.ellipse(0, 0, fp.size * 0.35, fp.size, 0, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(0, -fp.size, 0, fp.size); g.addColorStop(0, fp.color); g.addColorStop(1, 'rgba(254, 205, 211, 0.6)');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }
}

function spawnAmbientPetals(time: number) {
  if (time - lastPetalSpawn < 0.8) return;
  lastPetalSpawn = time;
  const center = bridgePoint(0.5, 0);
  const colors = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fcd34d', '#fbbf24'];
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 0.3 + Math.random() * 1.2;
    fallingPetals.push({
      x: center.x + Math.cos(a) * (30 + Math.random() * 40),
      y: center.y - 30 - Math.random() * 40,
      vx: Math.cos(a) * s, vy: -0.5 - Math.random() * 1,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
      size: 5 + Math.random() * 7, alpha: 0.6 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      swayPhase: Math.random() * Math.PI * 2,
    });
  }
}

// ============ 诗句 ============
function drawPoetry(elapsed: number, time: number) {
  for (const p of poetryLines) {
    if (elapsed < p.showTime) continue;
    const lt = elapsed - p.showTime;
    if (lt > p.duration) continue;
    let alpha = 0;
    if (lt < 1.5) alpha = lt / 1.5;
    else if (lt < p.duration - 1.5) alpha = 1;
    else alpha = (p.duration - lt) / 1.5;
    alpha *= 0.2;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#e0c8ff'; ctx.font = '16px "Noto Serif SC", serif'; ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y + Math.sin(time * 0.5) * 2); ctx.restore();
  }
}

// ============ 点击交互 ============
function onCanvasClick(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    sparkles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, size: 1 + Math.random() * 2.5, alpha: 0.5 + Math.random() * 0.4, life: 0, maxLife: 50 + Math.random() * 30, color: ['#fbbf24', '#fda4af', '#c4b5fd', '#f43f5e'][Math.floor(Math.random() * 4)], gravity: 0.015 });
  }
}

// ============ 主渲染循环 ============
function render(timestamp: number) {
  if (!ctx || paused) return;
  if (startTime === 0) startTime = timestamp;
  const elapsed = (timestamp - startTime) / 1000;
  const time = timestamp / 1000;

  drawBackground(time);
  drawMoon(time);
  drawPoetry(elapsed, time);
  drawBridgeGlow(elapsed, time);

  // 喜鹊按 row 从远到近排序绘制
  updateMagpies(elapsed);
  const sortedMagpies = [...magpies].sort((a, b) => a.targetRow - b.targetRow);
  for (const m of sortedMagpies) drawMagpie(m, time);

  // 桥中心相会平台（在喜鹊之上、人物之下）
  drawBridgePlatform(elapsed, time);

  updatePersons(elapsed);
  for (const p of persons) drawPerson(p, time);

  // 中心相握的双手
  drawClaspedHands(elapsed, time);

  // 相会心形光晕
  drawHeartHalo(elapsed, time);

  checkReunion(elapsed);
  drawBurstRings(elapsed);

  // 场景结束后持续飘落花瓣
  if (elapsed > SCENE_DURATION) {
    spawnAmbientPetals(time);
  }

  drawSparkles();
  drawFallingPetals(time);

  if (elapsed > SCENE_DURATION) {
    if (!sceneCompleteEmitted) {
      emit('scene-complete');
      sceneCompleteEmitted = true;
    }
    if (props.loop) resetScene();
  }
  animationId = requestAnimationFrame(render);
}

function resetScene() {
  startTime = 0; sparkles = []; fallingPetals = []; burstTriggered = false; roseTriggered = false;
  sceneCompleteEmitted = false; lastPetalSpawn = 0;
  initScene();
}

function togglePlay() {
  if (paused) { paused = false; isPlaying.value = true; startTime = performance.now() - pausedAt * 1000; animationId = requestAnimationFrame(render); }
  else { paused = true; isPlaying.value = false; pausedAt = (performance.now() - startTime) / 1000; if (animationId) cancelAnimationFrame(animationId); }
}

function replay() {
  paused = false; isPlaying.value = true; resetScene();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(render);
}

function onVisibilityChange() {
  if (document.hidden) {
    paused = true; isPlaying.value = false;
    if (animationId) cancelAnimationFrame(animationId);
  } else {
    if (props.autoPlay) {
      startTime = Date.now();
      paused = false; isPlaying.value = true; resetScene();
      if (animationId) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(render);
    }
  }
}

// 不再需要 toggleMusic 函数，因为使用了 MusicPlayer 组件

function setupCanvas() {
  const canvas = canvasRef.value;
  const wrapper = wrapperRef.value;
  if (!canvas || !wrapper) return;
  dpr = window.devicePixelRatio || 1;
  const rect = wrapper.getBoundingClientRect();
  cw = rect.width; ch = rect.height;
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
  ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);
  initScene();
}

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setupCanvas();
  if (props.autoPlay) animationId = requestAnimationFrame(render);
  resizeObserver = new ResizeObserver(() => { setupCanvas(); if (!paused && !animationId) animationId = requestAnimationFrame(render); });
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value);
});
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (resizeObserver) resizeObserver.disconnect();
  // 移除对 audioRef 的清理，因为不再使用页面内的音频控制
});
defineExpose({ replay, togglePlay });
</script>

<style scoped>
.scene-wrapper { position: relative; width: 100%; height: 100%; min-height: 400px; cursor: pointer; }
.scene-wrapper canvas { display: block; width: 100%; height: 100%; }
.canvas-controls { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 10; }
.ctrl-btn { padding: 6px 20px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); color: rgba(255, 255, 255, 0.8); font-size: 13px; cursor: pointer; transition: all 0.3s; }
.ctrl-btn:hover { background: rgba(124, 58, 237, 0.4); border-color: rgba(167, 139, 250, 0.5); color: white; }
.ctrl-btn.music-btn.active { background: rgba(244, 63, 94, 0.35); border-color: rgba(244, 63, 94, 0.6); color: rgba(255, 200, 210, 0.95); }
.ctrl-btn:not(.active)[title='暂无音乐文件'] { opacity: 0.5; cursor: not-allowed; }

/* 图标按钮组 */
.button-group {
  position: absolute;
  bottom: 80px; /* 调整位置到页面底部中央上方 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 15;
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-icon:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip.visible {
  opacity: 1;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.75);
}

.top-text {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 14px;
  z-index: 10;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
