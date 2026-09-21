const STEPS = [
  "Discover",
  "Diagnose",
  "Design",
  "Deliver",
  "Evolve",
];

const DURATION = 3000;

const CSS = `
.pl {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #121212;
  color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  transition: opacity 0.6s ease;
}

.pl.out {
  opacity: 0;
  pointer-events: none;
}

.pl-count {
  font-size: clamp(64px, 12vw, 140px);
  font-weight: 700;
  line-height: 1;
}

.pl-pct {
  color: #777;
}

.pl-steps {
  display: flex;
  gap: clamp(24px, 5vw, 48px);
  list-style: none;
  margin: 0;
  padding: 0;
}

.pl-steps li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #555;
  transition: color 0.3s ease;
}

.pl-steps i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #444;
  transition: background 0.3s ease;
}

.pl-steps li.on {
  color: #eee;
}

.pl-steps li.on i {
  background: #fff;
}

.pl-steps li:last-child.on i {
  background: #84CC16;
}
`;

export function initPreloader(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.querySelector(".pl")) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "pl";

  overlay.innerHTML = `
    <div class="pl-count">
      <span class="pl-num">000</span>
      <span class="pl-pct">%</span>
    </div>

    <ul class="pl-steps">
      ${STEPS.map(
        (step) => `
          <li>
            <i></i>
            <span>${step}</span>
          </li>
        `
      ).join("")}
    </ul>
  `;

  document.body.appendChild(overlay);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const num = overlay.querySelector<HTMLElement>(".pl-num");
  const steps =
    overlay.querySelectorAll<HTMLElement>(".pl-steps li");

  if (!num) {
    overlay.remove();
    style.remove();
    document.body.style.overflow = previousOverflow;
    return;
  }

  const start = performance.now();

  const tick = (now: number): void => {
    const progress = Math.min(
      (now - start) / DURATION,
      1
    );

    const value = Math.round(progress * 100);

    num.textContent = String(value).padStart(3, "0");

    steps.forEach((step, index) => {
      step.classList.toggle(
        "on",
        value >= index * 25
      );
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    setTimeout(() => {
      overlay.classList.add("out");

      setTimeout(() => {
        overlay.remove();
        style.remove();
        document.body.style.overflow = previousOverflow;
      }, 600);
    }, 400);
  };

  requestAnimationFrame(tick);
}