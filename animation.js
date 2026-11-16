document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 設定（速度や色はここで一括調整できます）
  // ==========================================
  const CONFIG = {
    // 1. タイプライター設定
    typewriterSpeed: 90,        // 1文字あたりの表示速度（ミリ秒）
    removeCursorAfter: false,   // trueにすると打ち終わった後にカーソルが消えます

    // 2. スクロールフェードイン設定
    fadeTargets: "h2, h3, p, img, li, section, article",
    fadeDuration: "0.8s",

    // 3. 背景パーティクル設定
    particleCount: 50,          // 粒子の数
    particleColor: "rgba(120, 140, 180, 0.5)",
    lineColorRGB: "120, 140, 180",
    mouseLineColorRGB: "100, 180, 255",
    canvasZIndex: "-1"          // 背景色で見えない場合は "0" に変更
  };

  // ==========================================
  // 1. 見出し（h1）のタイプライター演出
  // ==========================================
  const headings = document.querySelectorAll("h1");
  if (headings.length > 0) {
    const style = document.createElement("style");
    style.textContent = `
      .typewriter-cursor::after {
        content: "|";
        margin-left: 4px;
        animation: blinkCursor 0.8s steps(1) infinite;
      }
      @keyframes blinkCursor {
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    headings.forEach((h1) => {
      const fullText = h1.textContent.trim();
      if (!fullText) return;

      h1.textContent = "";
      h1.classList.add("typewriter-cursor");

      let index = 0;
      const timer = setInterval(() => {
        h1.textContent += fullText.charAt(index);
        index++;

        if (index >= fullText.length) {
          clearInterval(timer);
          if (CONFIG.removeCursorAfter) {
            setTimeout(() => h1.classList.remove("typewriter-cursor"), 1500);
          }
        }
      }, CONFIG.typewriterSpeed);
    });
  }

  // ==========================================
  // 2. スクロール連動フェードイン演出
  // ==========================================
  const rawTargets = document.querySelectorAll(CONFIG.fadeTargets);
  const fadeElements = [];

  rawTargets.forEach((el) => {
    // h1自体と、h1を囲む親要素（section等）は透明化の対象から除外
    if (el.querySelector("h1")) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity ${CONFIG.fadeDuration} ease-out, transform ${CONFIG.fadeDuration} ease-out`;
    fadeElements.push(el);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach((el) => observer.observe(el));

  // ==========================================
  // 3. 背景インタラクティブ・パーティクル
  // ==========================================
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: CONFIG.canvasZIndex,
    pointerEvents: "none"
  });
  document.body.appendChild(canvas);

  let width, height;
  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  const mouse = { x: null, y: null };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particles = Array.from({ length: CONFIG.particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2 + 1
  }));

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.particleColor;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColorRGB}, ${0.2 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const mouseDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (mouseDist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${CONFIG.mouseLineColorRGB}, ${0.4 * (1 - mouseDist / 150)})`;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  };

  animate();
});
