<template>
  <div class="rose-side-module">
    <!-- 星空背景（保留2D背景） -->
    <div class="bg-stars" aria-hidden="true">
      <span v-for="i in 80" :key="'star-'+i" class="star" :style="cachedStarStyles[i - 1]"></span>
    </div>
    <div class="bg-moon" aria-hidden="true"></div>
    <div class="bg-petals" aria-hidden="true">
      <span v-for="i in 35" :key="'petal-'+i" class="petal" :style="cachedPetalStyles[i - 1]"></span>
    </div>

    <canvas ref="canvasRef" class="rose-canvas"></canvas>

    <MusicPlayer :music-src="musicSrc" :auto-play="isRoseShareMode" />

    <div class="rose-overlay">
      <!-- 分享链接信息 -->
      <div v-if="isRoseShareMode && roseFrom" class="rose-share-header">
        <p class="rose-share-from">来自 {{ roseFrom }} 的祝福</p>
        <h1 v-if="roseTo" class="rose-share-to">Dear {{ roseTo }}</h1>
        <p v-if="roseMsg" class="rose-share-msg">{{ roseMsg }}</p>
      </div>
      <p class="rose-hint" :style="{ opacity: textOpacity }">{{ hintText }}</p>
      <p class="rose-subtitle" :style="{ opacity: subtitleOpacity }">愿爱意岁岁绵长</p>
      <div class="rose-actions">
        <!-- 再次绽放（始终显示） -->
        <button v-if="autoPlayDone" class="icon-btn" @click="replay" title="再次绽放">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4l4-4 4 4H6c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        <!-- 鹊桥相会（非分享模式显示） -->
        <a v-if="!isRoseShareMode" :href="withBase('/blessing/qixi')" class="icon-btn" title="鹊桥相会">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.5 19c0-1.7-1.3-3-3-3h-5c-1.7 0-3 1.3-3 3"/>
            <path d="M12 16V8"/>
            <path d="M8 10l4-4 4 4"/>
            <path d="M6 19c0-2 2-4 6-4s6 2 6 4"/>
          </svg>
        </a>
        <!-- 摇签（非分享模式显示） -->
        <a v-if="!isRoseShareMode" :href="withBase('/blessing/qixi?step=1')" class="icon-btn" title="摇签">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3h8v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V3z"/>
            <path d="M10 3L8 1"/>
            <path d="M14 3L16 1"/>
            <path d="M12 5v4"/>
            <path d="M12 10v4"/>
            <path d="M12 15v4"/>
          </svg>
        </a>
        <!-- 分享（非分享模式显示） -->
        <button v-if="!isShareMode && !isRoseShareMode" class="icon-btn" @click="shareRose" title="分享">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98"/>
            <path d="M15.41 6.51l-6.82 3.98"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入语句必须在顶层作用域
import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { buildShareUrl, buildRoseShareUrl, decodeRoseSharePayload } from '../../utils/shareCodec';
import MusicPlayer from '../../components/shared/MusicPlayer.vue';
import { withBase } from '../../utils/baseUrl';

// 日志记录
console.log('RoseSide.vue script loaded');
console.log('RoseSide component setup initiated');
console.log('All imports successful');

const props = defineProps({ isShareMode: Boolean });
const emit = defineEmits(['share-step']);

// 分享链接信息
const roseFrom = ref('');
const roseTo = ref('');
const roseMsg = ref('');
// 在 setup 阶段同步检测分享模式，确保子组件 MusicPlayer 挂载时能读到正确值
function detectRoseShareMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');
  if (encoded) {
    const payload = decodeRoseSharePayload(encoded);
    return !!(payload && payload.page === 'rose');
  }
  return false;
}
const isRoseShareMode = ref(detectRoseShareMode());

// 立即执行的代码，用于测试组件是否被正确实例化
console.log('Props received:', props.isShareMode);

// 检查是否在浏览器环境中
if (typeof window !== 'undefined') {
  console.log('Running in browser environment');
} else {
  console.log('Running in SSR environment');
}

// 添加初始化检查
console.log('Creating refs...');
const canvasRef = ref();
const autoPlayDone = ref(false);
console.log('Refs created successfully');
const hintText = ref('一朵玫瑰，在月下悄然盛放…');
const textOpacity = ref(0); // 主标题透明度，跟随绽放进度
const subtitleOpacity = ref(0); // 副标题透明度，盛开后浮现
const musicSrc = withBase('musics/clavier-music-canon-canon-in-d.mp3'); // 音乐源

let scene, camera, renderer;
let stemGroup, petalGroups = [], effectPoints, flowerCenter, sepals = [], heartMesh, heartRippleRing, pistil;
let startTime = 0, rafId = 0;
const DURATION = 12000;

// ============ 花瓣几何体（玫瑰专用） ============
function createPetalGeometry(length, maxWidth, curlX, curlY) {
  const wS = 16, hS = 24;
  const geo = new THREE.PlaneGeometry(maxWidth, length, wS, hS);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = (y + length / 2) / length; // 0=base, 1=tip

    // 玫瑰花瓣轮廓：底部尖、中部最宽、顶端微凹
    const widthProfile = Math.sin(Math.pow(t, 0.7) * Math.PI) * (1 - Math.pow(t - 0.85, 2) * 0.3);
    const normalizedX = maxWidth > 0 ? x / maxWidth : 0;
    const newX = normalizedX * widthProfile * maxWidth;

    // 纵向弯曲（花瓣从基部向上拱起）
    const archZ = -curlY * Math.pow(t, 1.5) * (0.4 + 0.6 * Math.abs(normalizedX));
    // 横向杯状凹陷
    const cupZ = -curlY * 0.25 * normalizedX * normalizedX * Math.pow(t, 0.4);
    // 边缘向内卷（玫瑰特有）
    const edgeRoll = curlX * Math.pow(Math.abs(normalizedX), 2) * Math.pow(t, 0.6);

    pos.setXYZ(i, newX, y, archZ + cupZ + edgeRoll);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();
  return geo;
}

// ============ 叶子几何体（带叶脉纹路） ============
function createLeafGeometry(length, width) {
  const wS = 12, hS = 20;
  const geo = new THREE.PlaneGeometry(width, length, wS, hS);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    const t = (y + length / 2) / length; // 0=基部, 1=叶尖

    // 叶片轮廓：椭圆形带尖端
    const wProfile = Math.sin(Math.pow(t, 0.7) * Math.PI) * (1 - Math.pow(t, 2) * 0.3);
    x = x * wProfile;

    const nx = width > 0 ? x / width : 0; // 归一化横向位置

    // 主叶脉（中央脊线）：沿叶片中心线隆起
    const mainVein = Math.exp(-Math.pow(nx * 8, 2)) * 0.015 * Math.sin(t * Math.PI);

    // 侧叶脉：从主脉向两侧辐射的细纹
    const sideVeinFreq = 6;
    const sideVein = Math.sin(nx * Math.PI * sideVeinFreq) * 0.006 * Math.sin(t * Math.PI * 0.8) * Math.exp(-Math.abs(nx) * 3);

    // 叶脉起伏（原有微纹）
    const ripple = Math.sin(t * Math.PI * 5) * 0.003 * Math.abs(x);

    // 叶片自然弯曲：中部微微拱起
    const arch = -0.02 * Math.pow(t, 1.5) * (0.3 + 0.7 * Math.pow(nx, 2));

    pos.setXYZ(i, x, y + length / 2, mainVein + sideVein + ripple + arch);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();
  return geo;
}

// ============ 创建花茎（底部固定，向上生长） ============
function createStem() {
  // 茎从 y=0（底部）到 y=1.5（顶部），生长时 scaleY 从 0→1
  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.04, 0.4, 0.02),
    new THREE.Vector3(-0.03, 0.9, -0.01),
    new THREE.Vector3(0.02, 1.2, 0.01),
    new THREE.Vector3(0, 1.5, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a6b34,
    roughness: 0.75,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);

  // 茎上的小刺（更明显的玫瑰刺）
  const thornMat = new THREE.MeshStandardMaterial({ color: 0x3a6b2a, roughness: 0.5, metalness: 0.1 });
  const thornPositions = [
    { t: 0.15, angle: 0.8, size: 0.015, height: 0.07 },
    { t: 0.30, angle: 3.5, size: 0.012, height: 0.055 },
    { t: 0.45, angle: 1.2, size: 0.014, height: 0.065 },
    { t: 0.60, angle: 4.8, size: 0.011, height: 0.05 },
    { t: 0.75, angle: 2.0, size: 0.013, height: 0.06 },
    { t: 0.88, angle: 5.5, size: 0.010, height: 0.045 },
  ];
  thornPositions.forEach(tp => {
    const thornGeo = new THREE.ConeGeometry(tp.size, tp.height, 4);
    const thorn = new THREE.Mesh(thornGeo, thornMat);
    const p = curve.getPointAt(tp.t);
    const tangent = curve.getTangentAt(tp.t);
    thorn.position.set(
      p.x + Math.cos(tp.angle) * 0.055,
      p.y,
      p.z + Math.sin(tp.angle) * 0.055
    );
    // 刺的方向：尖端朝外，远离茎干
    thorn.rotation.z = -Math.cos(tp.angle) * 0.9;
    thorn.rotation.x = -Math.sin(tp.angle) * 0.9;
    mesh.add(thorn);
  });

  return mesh;
}

// ============ 创建叶子（带叶脉颜色） ============
function createLeaf(length, width, color) {
  const geo = createLeafGeometry(length, width);
  const mat = new THREE.MeshStandardMaterial({
    color,
    side: THREE.DoubleSide,
    roughness: 0.55,
    metalness: 0.05,
    emissive: new THREE.Color(0x0a3010),
    emissiveIntensity: 0.1,
  });
  return new THREE.Mesh(geo, mat);
}

// ============ 创建花瓣层（玫瑰螺旋排列） ============
function createPetalLayers() {
  const groups = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

  // 玫瑰花瓣配置：从内到外，逐渐变大、变平
  // 关键：所有花瓣初始都向上紧闭（tiltStart≈0），绽放时才展开到 tiltEnd
  const configs = [
    // 内层花心瓣：小而紧，深红色
    { count: 8, len: 0.22, w: 0.10, tiltEnd: 0.55, delay: 0.42, curlX: 0.22, curlY: 0.20, hBase: 0.02, hue: 350, sat: 90, light: 28 },
    // 第二层：稍大，开始展开
    { count: 10, len: 0.34, w: 0.14, tiltEnd: 1.10, delay: 0.50, curlX: 0.18, curlY: 0.16, hBase: 0.00, hue: 352, sat: 85, light: 33 },
    // 第三层：中等大小
    { count: 12, len: 0.48, w: 0.19, tiltEnd: 1.55, delay: 0.57, curlX: 0.14, curlY: 0.12, hBase: -0.02, hue: 354, sat: 80, light: 38 },
    // 第四层：较大，明显展开
    { count: 14, len: 0.62, w: 0.24, tiltEnd: 1.85, delay: 0.64, curlX: 0.10, curlY: 0.08, hBase: -0.04, hue: 356, sat: 75, light: 43 },
    // 外层：最大，最舒展（完全水平+明显下垂）
    { count: 16, len: 0.78, w: 0.30, tiltEnd: 2.25, delay: 0.71, curlX: 0.06, curlY: 0.05, hBase: -0.06, hue: 358, sat: 70, light: 48 },
  ];

  let petalIndex = 0;
  configs.forEach((cfg, li) => {
    for (let i = 0; i < cfg.count; i++) {
      // 黄金角螺旋排列（phyllotaxis）
      const angle = petalIndex * goldenAngle;
      const radiusFactor = 0.08 + li * 0.12; // 内层更靠近中心

      const geo = createPetalGeometry(cfg.len, cfg.w, cfg.curlX, cfg.curlY);

      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(`hsl(${cfg.hue + (Math.random() - 0.5) * 6}, ${cfg.sat}%, ${cfg.light + (Math.random() - 0.5) * 4}%)`),
        side: THREE.DoubleSide,
        roughness: 0.30 + Math.random() * 0.10,
        metalness: 0.0,
        clearcoat: 0.40,
        clearcoatRoughness: 0.35,
        emissive: new THREE.Color(`hsl(${cfg.hue}, 60%, 8%)`),
        emissiveIntensity: 0.15,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const pivot = new THREE.Group();

      // 初始状态：小花苞（缩小 + 垂直向上 + 贴近中心）
      const budScale = 0.18;
      mesh.scale.set(budScale, budScale, budScale);
      mesh.rotation.x = -(Math.PI / 2 - 0.02); // 几乎垂直向上
      mesh.position.y = cfg.len * 0.15; // 贴近中心

      pivot.add(mesh);
      pivot.userData = {
        mesh,
        tiltEnd: cfg.tiltEnd,
        budScale,
        delay: cfg.delay + (i * 0.012),
        layerIndex: li,
        angle,
        len: cfg.len,
        radiusFactor,
      };

      groups.push(pivot);
      petalIndex++;
    }
  });

  return groups;
}

// ============ 创建花蕊 ============
function createPistil() {
  const geo = new THREE.SphereGeometry(0.06, 12, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const sphere = new THREE.Mesh(geo, mat);
  sphere.position.set(0, 0.02, 0);
  return sphere;
}

// ============ 创建效果粒子 ============
function createEffectParticles() {
  const count = 80;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.userData.particles = [];
  points.userData.active = false;
  points.visible = false;
  return points;
}

function updateEffectParticles(particles, progress, time) {
  if (progress < 0.5) return;

  particles.visible = true;
  particles.userData.active = true;
  const data = particles.userData.particles;

  // 生成新粒子
  if (Math.random() < 0.35 && data.length < 60) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.005 + Math.random() * 0.015;
    data.push({
      x: (Math.random() - 0.5) * 0.3,
      y: Math.random() * 0.2,
      z: (Math.random() - 0.5) * 0.3,
      vx: Math.cos(angle) * speed,
      vy: 0.008 + Math.random() * 0.015,
      vz: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 60,
    });
  }

  // 先移除过期粒子（倒序遍历避免索引错位）
  for (let i = data.length - 1; i >= 0; i--) {
    data[i].life++;
    if (data[i].life >= data[i].maxLife) {
      data.splice(i, 1);
    }
  }

  const posArr = particles.geometry.attributes.position.array;
  const colArr = particles.geometry.attributes.color.array;
  const sizeArr = particles.geometry.attributes.size.array;

  // 更新所有 buffer 槽位
  for (let i = 0; i < 80; i++) {
    if (i < data.length) {
      const p = data[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.vy += 0.0001;
      const lifeRatio = 1 - p.life / p.maxLife;

      posArr[i * 3] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;
      colArr[i * 3] = 1.0 * lifeRatio;
      colArr[i * 3 + 1] = 0.85 * lifeRatio;
      colArr[i * 3 + 2] = 0.3 * lifeRatio;
      sizeArr[i] = (0.03 + Math.random() * 0.02) * lifeRatio;
    } else {
      // 未使用的槽位设为安全值
      posArr[i * 3] = 0;
      posArr[i * 3 + 1] = -10;
      posArr[i * 3 + 2] = 0;
      colArr[i * 3] = 0;
      colArr[i * 3 + 1] = 0;
      colArr[i * 3 + 2] = 0;
      sizeArr[i] = 0;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.color.needsUpdate = true;
  particles.geometry.attributes.size.needsUpdate = true;
}

// ============ 初始化场景 ============
function initScene() {
  console.log('Initializing scene');
  const canvas = canvasRef.value;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    scene = new THREE.Scene();
    console.log('THREE.Scene created successfully');

    // 相机：侧面视角，花在画面中下部，不挡月亮
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    console.log('THREE.PerspectiveCamera created successfully');
    console.log('Setting camera position and target');
    camera.position.set(0, -0.6, 4.0);
    camera.lookAt(0, -0.8, 0);
    console.log('Camera position:', camera.position);
    console.log('Camera lookAt target: [0, -0.8, 0]');

    // 渲染器
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    console.log('THREE.WebGLRenderer created successfully');

    // 添加错误检查
    if (!renderer) {
      console.error('Failed to create WebGL renderer');
      return;
    }

    // 检查 WebGL 上下文是否成功创建
    if (!renderer.getContext()) {
      console.error('Failed to get WebGL context');
      return;
    }

    console.log('WebGL context created successfully');

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    console.log('Renderer configured successfully');

    // 灯光（增强亮度）
    const ambient = new THREE.AmbientLight(0x606080, 1.2);
    scene.add(ambient);

    // 主光源（暖色，从右上方）
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    // 补光（从左侧，稍冷）
    const fillLight = new THREE.DirectionalLight(0xe0e8ff, 0.8);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // 边缘光（从后方，勾勒轮廓）
    const rimLight = new THREE.DirectionalLight(0xff90a0, 0.6);
    rimLight.position.set(0, 2, -4);
    scene.add(rimLight);

    // 顶部点光（模拟月光）
    const moonLight = new THREE.PointLight(0xfff0d0, 1.5, 20);
    moonLight.position.set(0, 8, 2);
    scene.add(moonLight);

    // 底部暖色补光
    const bottomFill = new THREE.PointLight(0xffa060, 0.5, 10);
    bottomFill.position.set(0, -3, 2);
    scene.add(bottomFill);

    // 花茎（底部固定在 y=-1.8，向上生长）
    const stem = createStem();
    stemGroup = new THREE.Group();
    stemGroup.add(stem);
    stemGroup.position.set(0, -1.8, 0); // 底部固定
    stemGroup.scale.set(1, 0, 1); // 初始高度为0

    // 叶子（根部连接茎，向侧面水平伸展，Y轴旋转让叶面朝向相机）
    const leaf1 = createLeaf(0.40, 0.20, 0x1e7a3a);
    leaf1.position.set(0.025, 0.5, 0); // 茎表面右侧
    leaf1.rotation.set(0.1, 0.4, -Math.PI/2 + 0.15); // 向右展开，叶面朝向相机
    leaf1.userData.baseRotZ = -Math.PI/2 + 0.15;
    stemGroup.add(leaf1);

    const leaf2 = createLeaf(0.35, 0.17, 0x22883e);
    leaf2.position.set(-0.025, 0.9, 0); // 茎表面左侧
    leaf2.rotation.set(-0.1, -0.35, Math.PI/2 - 0.15); // 向左展开，叶面朝向相机
    leaf2.userData.baseRotZ = Math.PI/2 - 0.15;
    stemGroup.add(leaf2);

    const leaf3 = createLeaf(0.28, 0.14, 0x2a8a45);
    leaf3.position.set(0.02, 1.2, 0); // 茎表面右侧
    leaf3.rotation.set(0.15, 0.45, -Math.PI/2 + 0.2); // 向右展开，叶面朝向相机
    leaf3.userData.baseRotZ = -Math.PI/2 + 0.2;
    stemGroup.add(leaf3);

    scene.add(stemGroup);

    // 花瓣层（初始隐藏，茎长到70%后才出现）
    petalGroups = createPetalLayers();
    console.log('Created', petalGroups.length, 'petal groups');
    flowerCenter = new THREE.Group();
    petalGroups.forEach(pg => flowerCenter.add(pg));
    console.log('Added petal groups to flowerCenter');
    flowerCenter.position.set(0, 1.5, 0); // 茎顶端
    flowerCenter.visible = false;
    scene.add(flowerCenter);
    console.log('Added flowerCenter to scene');
    console.log('Total objects in scene:', scene.children.length);

    // 花蕊（初始隐藏，花瓣绽放后才出现）
    pistil = createPistil();
    pistil.scale.set(0, 0, 0); // 初始大小为0
    flowerCenter.add(pistil);

    // 萼片（玫瑰底部绿色叶状结构，初始包裹花苞）
    sepals = [];
    const sepalGeo = createLeafGeometry(0.25, 0.09);
    const sepalMat = new THREE.MeshStandardMaterial({
      color: 0x1a6b34,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    for (let i = 0; i < 5; i++) {
      const sepal = new THREE.Mesh(sepalGeo, sepalMat);
      const a = (i / 5) * Math.PI * 2;
      sepal.position.set(Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04); // 基部贴合花头底部
      // 初始状态：向上收拢包裹花苞（通过 rotation.y 定位方向，rotation.x 固定不变）
      sepal.rotation.set(-Math.PI / 2 + 0.15, a, 0); // 几乎垂直向上
      sepal.userData.baseRotX = -Math.PI / 2 + 0.15;
      sepal.userData.baseAngle = a;
      // 初始缩小，绽放时放大并向外展开
      sepal.scale.set(0.8, 0.8, 0.8);
      flowerCenter.add(sepal);
      sepals.push(sepal);
    }

    // 红心（绽放完成后从花心出现）
    const heartShape = new THREE.Shape();
    const hs = 0.08;
    heartShape.moveTo(0, hs * 0.3);
    heartShape.bezierCurveTo(0, hs * 0.6, -hs * 0.5, hs * 0.8, -hs * 0.5, hs * 0.3);
    heartShape.bezierCurveTo(-hs * 0.5, 0, 0, -hs * 0.6, hs * 0.3, -hs * 0.2);
    heartShape.bezierCurveTo(hs * 0.6, -hs * 0.4, hs * 0.6, hs * 0.2, 0, hs * 0.3);
    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xf06595,
      emissive: 0xb7416e,
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    });
    heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0, 0.05, 0);
    heartMesh.scale.set(0, 0, 0); // 初始隐藏
    flowerCenter.add(heartMesh);

    // 心形水纹光圈（绽放完成后从花心向外扩散）
    const rippleGeo = new THREE.RingGeometry(0.05, 0.06, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xffaacc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.rotation.x = -Math.PI / 2; // 平躺
    flowerCenter.add(rippleMesh);
    heartRippleRing = {
      mesh: rippleMesh,
      rings: [],
      lastRippleTime: 0,
    };

    // 效果粒子系统
    effectPoints = createEffectParticles();
    scene.add(effectPoints);

    console.log('Scene initialized successfully');

    // 强制渲染一帧以确保场景正确初始化
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      console.log('Initial frame rendered');
    }
  } catch (error) {
    console.error('Error initializing Three.js scene:', error);
  }
}

// ============ 缓动函数 ============
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ============ 动画循环 ============
function render(time) {
  if (!startTime) {
    startTime = time;
    console.log('Animation started, initial time set');
  }
  const elapsed = time - startTime;
  const progress = Math.min(1, elapsed / DURATION);

  // 输出进度，每秒一次
  if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
    console.log('Animation progress:', progress.toFixed(2));
  }

  // 花茎生长（0-40％，底部固定，向上生长）
  const stemProg = easeOutCubic(Math.min(1, progress / 0.40));
  stemGroup.scale.set(1, stemProg, 1);

  // 添加花茎生长调试信息
  if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
    console.log('Stem growth progress:', stemProg.toFixed(2), 'Y-scale:', stemGroup.scale.y);
  }

  // 花头出现（茎长到70%时开始淡入）
  const flowerAppearT = Math.max(0, Math.min(1, (progress - 0.28) / 0.07));
  flowerCenter.visible = flowerAppearT > 0;

  // 添加调试信息
  if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
    console.log('Flower visibility:', flowerCenter.visible, 'Progress:', progress.toFixed(2), 'flowerAppearT:', flowerAppearT.toFixed(2));
  }

  if (flowerCenter.visible) {
    // 在绽放过程中跟随茎顶端，绽放完成后固定在稳定位置
    if (progress < 1) {
      flowerCenter.position.y = -1.8 + 1.5 * stemProg; // 跟随茎顶端
    } else {
      flowerCenter.position.y = -1.8 + 1.5; // 绽放完成后的位置，即 -0.3
    }
  }

  // 花瓣绽放（茎长好后才开始）
  petalGroups.forEach(pg => {
    const d = pg.userData;
    const rawT = Math.max(0, (progress - d.delay) / (1 - d.delay));
    const t = easeInOutCubic(Math.min(1, rawT));

    // 缩放：从花苞小尺寸 → 全尺寸
    const scaleT = easeOutCubic(Math.min(1, rawT * 1.2));
    const s = d.budScale + (1 - d.budScale) * scaleT;
    d.mesh.scale.set(s, s, s);

    // 旋转：从垂直向上 → 目标展开角度
    const startAngle = -(Math.PI / 2 - 0.02);
    const endAngle = -(Math.PI / 2 - d.tiltEnd);
    const rotT = easeOutBack(Math.min(1, rawT * 0.9));
    d.mesh.rotation.x = startAngle + (endAngle - startAngle) * rotT;

    // 位置：从贴近中心 → 向外展开
    d.mesh.position.y = d.len * (0.15 + 0.25 * t);

    // 螺旋排列 + 微摇摆
    const sway = Math.sin(time * 0.0008 + d.angle * 1.5) * 0.012 * t;
    pg.rotation.y = d.angle + sway;
    // 花瓣径向展开：早期缓慢展开，后期外层花瓣向中心收束形成倒三角
    let r = d.radiusFactor * Math.pow(t, 2.0);
    // 当接近完全绽放时，外层花瓣向中心收束，形成倒三角根部
    if (progress > 0.9) {
      // 外层花瓣向中心收束
      const contractionStrength = Math.min(1.0, (progress - 0.9) * 10); // 从0到1的收束强度
      const layerContractionFactor = 1.0 - (d.layerIndex / 4) * 0.3; // 外层花瓣收束更多
      r *= (1 - 0.4 * contractionStrength * layerContractionFactor);
    }
    pg.position.x = Math.cos(d.angle) * r * 0.10;
    pg.position.z = Math.sin(d.angle) * r * 0.10;
  });

  // 萼片绽放（40-60% 进度，只调整缩放和位置，不改变 rotation.x）
  const sepalT = easeOutCubic(Math.max(0, Math.min(1, (progress - 0.40) / 0.20)));
  sepals.forEach((sepal, idx) => {
    // 从缩小到正常大小
    const s = 0.8 + 0.2 * sepalT;
    sepal.scale.set(s, s, s);
    // 向外展开（增加与中心的距离）
    const a = sepal.userData.baseAngle;
    const dist = 0.04 + 0.06 * sepalT; // 从 0.04 → 0.10
    sepal.position.x = Math.cos(a) * dist;
    sepal.position.z = Math.sin(a) * dist;
    // 轻微摇摆
    const sway = Math.sin(time * 0.0012 + idx * 1.3) * 0.02 * sepalT;
    sepal.rotation.z = sway;
  });

  // 红心动画（绽放完成后从花心向外扩散）
  if (heartMesh) {
    const heartStart = 0.85;
    const heartT = Math.max(0, Math.min(1, (progress - heartStart) / (1 - heartStart)));
    if (heartT > 0) {
      heartMesh.material.opacity = Math.min(1, heartT * 3);
      const heartScale = easeOutBack(Math.min(1, heartT * 1.5));
      heartMesh.scale.set(heartScale, heartScale, heartScale);
      heartMesh.position.y = 0.05 + heartT * 0.15; // 向上飘
    }
  }

  // 花蕊动画（花瓣绽放后从花心慢慢变大）
  if (pistil) {
    const pistilStart = 0.70; // 花瓣绽放到70%时开始
    const pistilT = Math.max(0, Math.min(1, (progress - pistilStart) / 0.25)); // 用25%的进度完成生长
    if (pistilT > 0) {
      const pistilScale = easeOutCubic(pistilT);
      pistil.scale.set(pistilScale, pistilScale, pistilScale);
    }
  }

  // 效果粒子
  updateEffectParticles(effectPoints, progress, time * 0.001);

  // 相机微动
  camera.position.x = Math.sin(time * 0.0002) * 0.10;
  camera.position.y = -0.3 + Math.sin(time * 0.0003) * 0.05;
  camera.lookAt(0, -0.3, 0); // 与花头位置保持一致

  // 确保相机矩阵更新
  camera.updateMatrixWorld();

  // 绽放完成后持续动画
  if (progress >= 1) {
    const breathe = Math.sin(time * 0.002) * 0.5 + 0.5;

    // 花头呼吸律动 - 使用绽放结束时的位置作为基础
    const baseY = -0.3; // 这是绽放结束时花头的稳定位置
    flowerCenter.position.y = baseY + Math.sin(time * 0.002) * 0.01; // 减小呼吸幅度
    const breatheScale = 1 + breathe * 0.008; // 减小呼吸缩放
    flowerCenter.scale.set(breatheScale, breatheScale, breatheScale);

    // 花瓣微颤
    petalGroups.forEach(pg => {
      const d = pg.userData;
      const tremble = Math.sin(time * 0.003 + d.angle * 3) * 0.006;
      d.mesh.rotation.z = tremble;
      if (d.mesh.material) {
        d.mesh.material.clearcoat = 0.35 + Math.sin(time * 0.001 + d.angle) * 0.08;
      }
    });

    // 叶子摇摆
    stemGroup.children.forEach((child, idx) => {
      if (child.userData.baseRotZ !== undefined) {
        const swayAngle = Math.sin(time * 0.0015 + idx * 2.1) * 0.06;
        child.rotation.z = child.userData.baseRotZ + swayAngle;
      }
    });

    // 花茎整体微弯
    stemGroup.rotation.z = Math.sin(time * 0.001) * 0.012;
    stemGroup.rotation.x = Math.sin(time * 0.0008 + 1) * 0.008;

    // 心形水纹光圈（绽放完成后从花心向外扩散）
    if (heartRippleRing && time > heartRippleRing.lastRippleTime + 2000) { // 每2秒生成一个新的水纹
      // 创建一个新的心形环
      const newRipple = heartRippleRing.mesh.clone();
      newRipple.scale.set(0.1, 0.1, 0.1); // 初始小尺寸
      newRipple.material = newRipple.material.clone();
      newRipple.material.opacity = 0.6;
      flowerCenter.add(newRipple);

      // 记录水纹信息
      heartRippleRing.rings.push({
        mesh: newRipple,
        startTime: time,
        duration: 3000, // 3秒消失
        maxSize: 1.5, // 最大扩展到1.5倍
      });

      heartRippleRing.lastRippleTime = time;
    }

    // 更新现有的水纹环
    if (heartRippleRing) {
      for (let i = heartRippleRing.rings.length - 1; i >= 0; i--) {
        const ring = heartRippleRing.rings[i];
        const elapsed = time - ring.startTime;

        if (elapsed > ring.duration) {
          // 移除过期的环
          flowerCenter.remove(ring.mesh);
          heartRippleRing.rings.splice(i, 1);
        } else {
          // 更新环的大小和透明度
          const prog = elapsed / ring.duration;
          const scale = 0.1 + (ring.maxSize - 0.1) * prog; // 从0.1倍扩展到maxSize
          ring.mesh.scale.set(scale, scale, scale);

          const opacity = 0.6 * (1 - prog); // 逐渐变透明
          if (ring.mesh.material) {
            ring.mesh.material.opacity = opacity;
          }
        }
      }
    }
  }

  if (progress >= 1 && !autoPlayDone.value) {
    autoPlayDone.value = true;
    hintText.value = '月下玫瑰';
  }

  // 文案淡入：跟随绽放进度，20%开始淡入，90%完全显示
  if (progress < 0.20) {
    textOpacity.value = 0;
  } else if (progress < 0.90) {
    textOpacity.value = easeOutCubic((progress - 0.20) / 0.70);
  } else {
    textOpacity.value = 1;
  }

  // 副标题：花朵完全盛开后才缓缓浮现（用盛开后的 elapsed 时间计算）
  if (autoPlayDone.value) {
    const subElapsed = elapsed - DURATION; // 盛开后经过的毫秒数
    const subT = Math.min(1, subElapsed / 2000); // 2秒内淡入
    subtitleOpacity.value = easeOutCubic(subT);
  } else {
    subtitleOpacity.value = 0;
  }

  // 确保渲染正常执行
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  } else {
    console.error('Rendering failed - missing renderer, scene, or camera');
  }
  rafId = requestAnimationFrame(render);
}

// ============ 控制 ============
function startAnimation() {
  startTime = 0;
  autoPlayDone.value = false;
  hintText.value = '一朵玫瑰，在月下悄然盛放…';
  textOpacity.value = 0;
  subtitleOpacity.value = 0;
  if (effectPoints) {
    effectPoints.userData.particles = [];
    effectPoints.visible = false;
  }
  // 重置持续动画状态
  if (flowerCenter) {
    flowerCenter.position.y = -0.6;
    flowerCenter.scale.set(1, 1, 1);
    flowerCenter.visible = false;
  }
  if (heartMesh) {
    heartMesh.scale.set(0, 0, 0);
    heartMesh.material.opacity = 0;
    heartMesh.position.y = 0.05;
  }
  if (pistil) {
    pistil.scale.set(0, 0, 0);
  }
  if (stemGroup) {
    stemGroup.scale.set(1, 0, 1);
    stemGroup.rotation.z = 0;
    stemGroup.rotation.x = 0;
  }
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
}

function replay() {
  startAnimation();
}

function shareRose() {
  // 生成玫瑰花页面的加密分享链接
  const url = buildRoseShareUrl();
  if (navigator.share) {
    navigator.share({
      title: '玫瑰绽放',
      text: '一朵玫瑰，在月下悄然盛放…',
      url
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(url).then(() => {
      hintText.value = '链接已复制，快去分享吧！';
      setTimeout(() => {
        if (autoPlayDone.value) {
          hintText.value = '月下玫瑰';
        }
      }, 2000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  }
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 背景样式辅助（预计算缓存，避免 re-render 时重新随机） ============
const cachedStarStyles = shallowRef(Array.from({ length: 80 }, () => {
  const size = 0.5 + Math.random() * 2.5;
  return {
    width: `${size}px`, height: `${size}px`,
    left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  };
}));

const cachedPetalStyles = shallowRef(Array.from({ length: 35 }, () => {
  const size = 6 + Math.random() * 10;
  return {
    width: `${size}px`, height: `${size * 1.6}px`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${6 + Math.random() * 5}s`,
  };
}));

// ============ 生命周期 ============
onMounted(() => {
  console.log('RoseSide component mounted');
  // 确保在浏览器环境中运行
  if (typeof window !== 'undefined') {
    console.log('Running in browser environment');

    // 分享模式已在 setup 阶段检测，此处仅做日志记录
    console.log('Rose share mode:', isRoseShareMode.value);

    // 确保 DOM 已经完全加载
    if (document.readyState === 'loading') {
      console.log('Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded, initializing scene');
        // 立即尝试初始化
        setTimeout(() => {
          initScene();
          console.log('About to start animation');
          startAnimation();
        }, 50);
      });
    } else {
      console.log('DOM already loaded, initializing scene');
      // 立即尝试初始化
      setTimeout(() => {
        initScene();
        console.log('About to start animation');
        startAnimation();
      }, 50);
    }

    // 同时监听页面可见性，确保在页面变为可见时也能正确初始化
    const handleVisibilityChange = () => {
      if (!document.hidden && (!scene || !renderer)) {
        // 页面变为可见且场景未初始化时，重新初始化
        console.log('Page became visible, reinitializing scene');
        setTimeout(() => {
          initScene();
          startAnimation();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理事件监听器
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);

      if (renderer) {
        renderer.dispose();
        scene?.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      }
    });
  }

  window.addEventListener('resize', onResize);
});
</script>

<style scoped>
.rose-side-module {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0e0828 40%, #080418 80%, #03020a 100%);
  z-index: 5;
}

.bg-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.7;
  animation: twinkle linear infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.bg-moon {
  position: absolute;
  top: 8%; /* 稍微上移 */
  left: 50%;
  transform: translateX(-50%);
  width: min(18vw, 18vh); /* 缩小月亮 */
  height: min(18vw, 18vh); /* 缩小月亮 */
  max-width: 160px; /* 减小最大尺寸 */
  max-height: 160px; /* 减小最大尺寸 */
  min-width: 60px; /* 减小最小尺寸 */
  min-height: 60px; /* 减小最小尺寸 */
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffbeb 0%, #fef3c7 30%, #fde68a 70%, #fbbf24 100%);
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.2), 0 0 80px rgba(251, 191, 36, 0.08); /* 减小光晕 */
  opacity: 0.8; /* 稍微降低透明度，增加距离感 */
  pointer-events: none;
  z-index: 0; /* 保持背景层级 */
}

.bg-petals {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.petal {
  position: absolute;
  top: -30px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(to bottom, rgba(244, 114, 182, 0.7), rgba(254, 205, 211, 0.4));
  opacity: 0.65;
  animation: fallPetals linear infinite;
}
@keyframes fallPetals {
  0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 0.65; }
  90% { opacity: 0.65; }
  100% { transform: translateY(110vh) rotate(360deg) translateX(40px); opacity: 0; }
}

.rose-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.rose-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-bottom: 80px;
  z-index: 10;
  pointer-events: none;
}

/* 音乐控制按钮 */
.music-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 15;
}

.music-btn {
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

.music-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.music-btn.muted {
  opacity: 0.6;
}

/* 播放状态下添加旋转动画 */
.music-btn.playing {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rose-overlay > * {
  pointer-events: auto;
}

/* 分享链接信息 */
.rose-share-header {
  text-align: center;
  margin-bottom: 16px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.rose-share-from {
  font-size: 14px;
  color: rgba(251, 191, 136, 0.6);
  margin-bottom: 8px;
  letter-spacing: 2px;
  font-family: 'Noto Serif SC', serif;
}

.rose-share-to {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(to right, #fda4af, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  font-family: 'Noto Serif SC', serif;
}

.rose-share-msg {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  line-height: 1.8;
  font-family: 'Noto Serif SC', serif;
}

.rose-hint {
  font-size: 1.6rem;
  color: rgba(253, 230, 233, 0.95);
  font-family: 'Noto Serif SC', serif;
  font-weight: 300;
  letter-spacing: 6px;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.7), 0 0 40px rgba(244, 63, 94, 0.12);
  text-align: center;
  padding: 0 20px;
  margin: 0;
  transition: opacity 0.1s ease;
}

.rose-subtitle {
  font-size: 0.75rem;
  color: rgba(253, 220, 225, 0.85);
  font-family: 'Noto Serif SC', serif;
  font-weight: 300;
  letter-spacing: 3px;
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
  text-align: center;
  padding: 0 20px;
  margin: 0;
  transition: opacity 0.1s ease;
}

.rose-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  outline: none;
  padding: 0;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}
</style>
