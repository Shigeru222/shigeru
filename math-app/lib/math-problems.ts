export type Difficulty = "easy" | "medium" | "hard";

export type Topic =
  | "expansion"
  | "factoring"
  | "quadratic-eq"
  | "quadratic-fn"
  | "trigonometry"
  | "probability";

export interface MathQuestion {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  questionHtml: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  expansion: "展開",
  factoring: "因数分解",
  "quadratic-eq": "二次方程式",
  "quadratic-fn": "二次関数",
  trigonometry: "三角比",
  probability: "確率",
};

export const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
  expansion: "(x+a)(x+b) の形を展開する",
  factoring: "多項式を因数の積に分解する",
  "quadratic-eq": "ax² + bx + c = 0 の解を求める",
  "quadratic-fn": "放物線の頂点・軸・最大最小を求める",
  trigonometry: "sin・cos・tan の値と応用",
  probability: "場合の数と確率",
};

export const TOPIC_COLORS: Record<Topic, string> = {
  expansion: "blue",
  factoring: "purple",
  "quadratic-eq": "cyan",
  "quadratic-fn": "green",
  trigonometry: "orange",
  probability: "pink",
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sign(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function term(coef: number, variable: string): string {
  if (coef === 0) return "";
  if (coef === 1) return variable;
  if (coef === -1) return `-${variable}`;
  return `${coef}${variable}`;
}

function uniqueWrongOptions(correct: string, wrongs: string[]): string[] {
  const seen = new Set<string>([correct]);
  return wrongs.filter((w) => {
    if (seen.has(w)) return false;
    seen.add(w);
    return true;
  });
}

// ---- EXPANSION ----

function genExpansion(difficulty: Difficulty): MathQuestion {
  let question: string;
  let answer: string;
  let wrongs: string[];

  if (difficulty === "easy") {
    const a = rand(1, 6);
    const b = rand(1, 6);
    question = `(x${sign(a)})(x${sign(b)})`;
    const p = a + b;
    const q = a * b;
    answer = `x² ${sign(p)}x ${sign(q)}`;
    wrongs = [
      `x² ${sign(p - 1)}x ${sign(q)}`,
      `x² ${sign(p)}x ${sign(q + 1)}`,
      `x² ${sign(a * b)}x ${sign(a + b)}`,
    ];
  } else if (difficulty === "medium") {
    const a = rand(2, 5);
    const b = rand(1, 4);
    // (ax + b)²
    question = `(${a}x${sign(b)})²`;
    const A = a * a;
    const B = 2 * a * b;
    const C = b * b;
    answer = `${A}x² ${sign(B)}x ${sign(C)}`;
    wrongs = [
      `${A}x² ${sign(B + 1)}x ${sign(C)}`,
      `${a}x² ${sign(B)}x ${sign(C)}`,
      `${A}x² ${sign(B)}x ${sign(C - 1)}`,
    ];
  } else {
    const a = rand(2, 4);
    const b = rand(1, 3);
    const c = rand(2, 4);
    const d = rand(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    // (ax + b)(cx + d)
    question = `(${a}x${sign(b)})(${c}x${sign(d)})`;
    const A = a * c;
    const B = a * d + b * c;
    const C = b * d;
    answer = `${A}x² ${sign(B)}x ${sign(C)}`;
    wrongs = [
      `${A}x² ${sign(B - 1)}x ${sign(C)}`,
      `${A + 1}x² ${sign(B)}x ${sign(C)}`,
      `${A}x² ${sign(B)}x ${sign(C + 1)}`,
    ];
  }

  const opts = buildOptions(answer, wrongs);

  return {
    id: Math.random().toString(36).slice(2),
    topic: "expansion",
    difficulty,
    question: `次の式を展開せよ：${question}`,
    questionHtml: `次の式を展開せよ：<strong>${question}</strong>`,
    options: opts.options,
    correctIndex: opts.correctIndex,
    explanation: `${question} = ${answer}`,
  };
}

// ---- FACTORING ----

function genFactoring(difficulty: Difficulty): MathQuestion {
  let question: string;
  let answer: string;
  let wrongs: string[];
  let explanation: string;

  if (difficulty === "easy") {
    const a = rand(1, 5);
    const b = rand(1, 5);
    const p = a + b;
    const q = a * b;
    question = `x² ${sign(p)}x ${sign(q)}`;
    answer = `(x${sign(a)})(x${sign(b)})`;
    wrongs = [
      `(x${sign(a + 1)})(x${sign(b)})`,
      `(x${sign(a)})(x${sign(b + 1)})`,
      `(x${sign(p)})(x${sign(q)})`,
    ];
    explanation = `x² ${sign(p)}x ${sign(q)} = (x${sign(a)})(x${sign(b)})`;
  } else if (difficulty === "medium") {
    // 差の平方: x² - a²
    const a = rand(2, 8);
    const q = a * a;
    question = `x² - ${q}`;
    answer = `(x+${a})(x-${a})`;
    wrongs = [
      `(x-${a})(x-${a})`,
      `(x+${a})(x+${a})`,
      `(x+${a - 1})(x-${a + 1})`,
    ];
    explanation = `x² - ${q} = (x+${a})(x-${a})  （平方の差の公式）`;
  } else {
    // ax² + bx + c 型
    const a = rand(2, 3);
    const p = rand(1, 4);
    const q = rand(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    // a(x+p)(x+q) = ax² + a(p+q)x + apq
    const B = a * (p + q);
    const C = a * p * q;
    question = `${a}x² ${sign(B)}x ${sign(C)}`;
    answer = `${a}(x${sign(p)})(x${sign(q)})`;
    wrongs = [
      `(${a}x${sign(p)})(x${sign(q)})`,
      `${a}(x${sign(p + 1)})(x${sign(q)})`,
      `${a}(x${sign(p)})(x${sign(q + 1)})`,
    ];
    explanation = `${a}x² ${sign(B)}x ${sign(C)} = ${a}(x${sign(p)})(x${sign(q)})`;
  }

  const opts = buildOptions(answer, wrongs);

  return {
    id: Math.random().toString(36).slice(2),
    topic: "factoring",
    difficulty,
    question: `次の式を因数分解せよ：${question}`,
    questionHtml: `次の式を因数分解せよ：<strong>${question}</strong>`,
    options: opts.options,
    correctIndex: opts.correctIndex,
    explanation,
  };
}

// ---- QUADRATIC EQUATIONS ----

function genQuadraticEq(difficulty: Difficulty): MathQuestion {
  let question: string;
  let answer: string;
  let wrongs: string[];
  let explanation: string;

  if (difficulty === "easy") {
    // x² = a 型
    const a = [1, 4, 9, 16, 25, 36][rand(0, 5)];
    const sq = Math.sqrt(a);
    question = `x² = ${a}`;
    answer = `x = ±${sq}`;
    wrongs = [`x = ${sq}`, `x = -${sq}`, `x = ±${sq + 1}`];
    explanation = `x² = ${a} より x = ±√${a} = ±${sq}`;
  } else if (difficulty === "medium") {
    // (x+a)² = b 型
    const a = rand(1, 4) * (Math.random() < 0.5 ? 1 : -1);
    const b = [1, 4, 9, 16][rand(0, 3)];
    const sq = Math.sqrt(b);
    question = `(x${sign(a)})² = ${b}`;
    answer = `x = ${-a + sq}, ${-a - sq}`;
    wrongs = [
      `x = ${-a + sq + 1}, ${-a - sq - 1}`,
      `x = ${-a + sq}, ${-a + sq}`,
      `x = ±${sq}`,
    ];
    explanation = `x${sign(a)} = ±${sq} より x = ${-a + sq}, ${-a - sq}`;
  } else {
    // 因数分解できる二次方程式
    const p = rand(1, 5) * (Math.random() < 0.5 ? 1 : -1);
    const q = rand(1, 5) * (Math.random() < 0.5 ? 1 : -1);
    if (p === q) {
      // avoid double root for more interesting problem
      const B = p + q + 1;
      const C = (p + 1) * q;
      question = `x² ${sign(B)}x ${sign(C)} = 0`;
      answer = `x = ${-(p + 1)}, ${-q}`;
      wrongs = [
        `x = ${p + 1}, ${q}`,
        `x = ${-(p + 1)}, ${q}`,
        `x = ${p}, ${-q}`,
      ];
      explanation = `(x${sign(p + 1)})(x${sign(q)}) = 0 より x = ${-(p + 1)}, ${-q}`;
    } else {
      const B = p + q;
      const C = p * q;
      question = `x² ${sign(B)}x ${sign(C)} = 0`;
      answer = `x = ${-p}, ${-q}`;
      wrongs = [
        `x = ${p}, ${q}`,
        `x = ${-p}, ${q}`,
        `x = ${p}, ${-q}`,
      ];
      explanation = `(x${sign(p)})(x${sign(q)}) = 0 より x = ${-p}, ${-q}`;
    }
  }

  const opts = buildOptions(answer, wrongs);

  return {
    id: Math.random().toString(36).slice(2),
    topic: "quadratic-eq",
    difficulty,
    question: `次の二次方程式を解け：${question}`,
    questionHtml: `次の二次方程式を解け：<strong>${question}</strong>`,
    options: opts.options,
    correctIndex: opts.correctIndex,
    explanation,
  };
}

// ---- QUADRATIC FUNCTIONS ----

function genQuadraticFn(difficulty: Difficulty): MathQuestion {
  const a = rand(1, 3) * (Math.random() < 0.5 ? 1 : -1);
  const p = rand(-4, 4);
  const q = rand(-6, 6);

  if (difficulty === "easy") {
    // 軸の方程式
    const question = `y = ${a === 1 ? "" : a === -1 ? "-" : a}x²${p !== 0 ? ` ${sign(-2 * a * p)}x` : ""}${q - a * p * p !== 0 ? ` ${sign(q - a * p * p)}` : ""}`;
    // y = a(x-p)² + q の軸は x = p
    const answer = `x = ${p}`;
    const wrongs = [`x = ${p + 1}`, `x = ${-p}`, `x = ${p - 1}`];
    const opts = buildOptions(answer, wrongs);
    const expanded = expandQuadratic(a, p, q);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-fn",
      difficulty,
      question: `y = ${expanded} の対称軸を求めよ`,
      questionHtml: `<strong>y = ${expanded}</strong> の対称軸を求めよ`,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: `y = ${a === 1 ? "" : a === -1 ? "-" : a}(x${sign(-p)})² ${sign(q)} の形に変形すると、軸は x = ${p}`,
    };
  } else if (difficulty === "medium") {
    // 頂点の座標
    const expanded = expandQuadratic(a, p, q);
    const answer = `(${p}, ${q})`;
    const wrongs = [
      `(${-p}, ${q})`,
      `(${p}, ${-q})`,
      `(${p + 1}, ${q})`,
    ];
    const opts = buildOptions(answer, wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-fn",
      difficulty,
      question: `y = ${expanded} の頂点の座標を求めよ`,
      questionHtml: `<strong>y = ${expanded}</strong> の頂点の座標を求めよ`,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: `y = ${a === 1 ? "" : a === -1 ? "-" : a}(x${sign(-p)})² ${sign(q)} と変形でき、頂点は (${p}, ${q})`,
    };
  } else {
    // 最大値・最小値（定義域あり）
    const left = rand(-3, 0);
    const right = rand(1, 4);
    const absA = Math.abs(a);
    const aStr = a === 1 ? "" : a === -1 ? "-" : `${a}`;
    const expanded = expandQuadratic(a, p, q);
    const isMin = a > 0;
    const label = isMin ? "最小値" : "最大値";

    // Evaluate at key points
    const evalAt = (x: number) => a * (x - p) * (x - p) + q;

    // Vertex x=p: if p in [left, right] it's the min(a>0) or max(a<0)
    const vals: { x: number; y: number }[] = [
      { x: left, y: evalAt(left) },
      { x: right, y: evalAt(right) },
    ];
    if (p >= left && p <= right) vals.push({ x: p, y: q });

    const extremeVal = isMin
      ? Math.min(...vals.map((v) => v.y))
      : Math.max(...vals.map((v) => v.y));

    const answer = `${extremeVal}`;
    const wrongs = [
      `${extremeVal + (rand(1, 3) * (Math.random() < 0.5 ? 1 : -1))}`,
      `${extremeVal + 1}`,
      `${extremeVal - 1}`,
    ];
    const opts = buildOptions(answer, wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-fn",
      difficulty,
      question: `y = ${expanded}（${left} ≤ x ≤ ${right}）の${label}を求めよ`,
      questionHtml: `<strong>y = ${expanded}</strong>（${left} ≤ x ≤ ${right}）の${label}を求めよ`,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: `頂点 (${p}, ${q})、定義域 [${left}, ${right}] において${label}は ${extremeVal}`,
    };
  }
}

function expandQuadratic(a: number, p: number, q: number): string {
  // y = a(x-p)² + q = ax² - 2apx + ap² + q
  const B = -2 * a * p;
  const C = a * p * p + q;
  const aStr = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  let s = `${aStr}x²`;
  if (B !== 0) s += ` ${sign(B)}x`;
  if (C !== 0) s += ` ${sign(C)}`;
  return s;
}

// ---- TRIGONOMETRY ----

const TRIG_TABLE: Record<string, Record<string, string>> = {
  "0": { sin: "0", cos: "1", tan: "0" },
  "30": { sin: "1/2", cos: "√3/2", tan: "1/√3" },
  "45": { sin: "1/√2", cos: "1/√2", tan: "1" },
  "60": { sin: "√3/2", cos: "1/2", tan: "√3" },
  "90": { sin: "1", cos: "0", tan: "undefined" },
};

function genTrigonometry(difficulty: Difficulty): MathQuestion {
  if (difficulty === "easy") {
    const angles = ["0", "30", "45", "60", "90"];
    const fns = ["sin", "cos", "tan"];
    let angle: string;
    let fn: string;
    let answer: string;

    // avoid tan(90)
    do {
      angle = angles[rand(0, angles.length - 1)];
      fn = fns[rand(0, fns.length - 1)];
      answer = TRIG_TABLE[angle][fn];
    } while (answer === "undefined");

    const allVals = ["0", "1/2", "1/√2", "√3/2", "1", "1/√3", "√3", "-1/2", "-√3/2"];
    const wrongs = shuffle(allVals.filter((v) => v !== answer)).slice(0, 3);
    const opts = buildOptions(answer, wrongs);

    return {
      id: Math.random().toString(36).slice(2),
      topic: "trigonometry",
      difficulty,
      question: `${fn} ${angle}° の値を求めよ`,
      questionHtml: `<strong>${fn} ${angle}°</strong> の値を求めよ`,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: `${fn} ${angle}° = ${answer}`,
      hint: "三角比の表を思い出そう（0°, 30°, 45°, 60°, 90°）",
    };
  } else if (difficulty === "medium") {
    // sinθ が与えられたとき cosθ を求める (sin²θ + cos²θ = 1)
    const sinVals: [string, string][] = [
      ["1/2", "√3/2"],
      ["1/√2", "1/√2"],
      ["√3/2", "1/2"],
      ["1/3", "2√2/3"],
      ["2/3", "√5/3"],
    ];
    const [sinVal, cosVal] = sinVals[rand(0, sinVals.length - 1)];
    const wrongs = [
      `${cosVal.replace("√", "1/")}`,
      sinVal,
      `1 - ${cosVal}`,
    ];
    const opts = buildOptions(cosVal, wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "trigonometry",
      difficulty,
      question: `0° < θ < 90° で sin θ = ${sinVal} のとき、cos θ の値を求めよ`,
      questionHtml: `0° &lt; θ &lt; 90° で <strong>sin θ = ${sinVal}</strong> のとき、<strong>cos θ</strong> の値を求めよ`,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: `sin²θ + cos²θ = 1 より cos²θ = 1 - (${sinVal})² → cos θ = ${cosVal}`,
    };
  } else {
    // 正弦定理・余弦定理
    const problems = [
      {
        q: "△ABC で a=6, b=4, C=60° のとき、c の値を求めよ",
        a: "2√7",
        ws: ["√52", "√36", "√48"],
        exp: "余弦定理：c² = a²+b²-2ab·cosC = 36+16-24 = 28 より c = 2√7",
      },
      {
        q: "△ABC で a=√3, A=30°, B=60° のとき、b の値を求めよ",
        a: "√3",
        ws: ["2√3", "3", "1"],
        exp: "正弦定理：a/sinA = b/sinB → √3/(1/2) = b/(√3/2) → b = √3",
      },
      {
        q: "△ABC で a=5, b=7, c=8 のとき、cos A の値を求めよ",
        a: "11/14",
        ws: ["5/14", "1/2", "7/10"],
        exp: "余弦定理：cos A = (b²+c²-a²)/(2bc) = (49+64-25)/112 = 88/112 = 11/14",
      },
    ];
    const p = problems[rand(0, problems.length - 1)];
    const opts = buildOptions(p.a, p.ws);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "trigonometry",
      difficulty,
      question: p.q,
      questionHtml: p.q,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: p.exp,
    };
  }
}

// ---- PROBABILITY ----

function genProbability(difficulty: Difficulty): MathQuestion {
  if (difficulty === "easy") {
    const problems = [
      {
        q: "1つのサイコロを投げる。偶数の目が出る確率は？",
        a: "1/2",
        ws: ["1/3", "2/3", "1/6"],
        exp: "偶数の目：2, 4, 6 の3通り。全体：6通り。確率 = 3/6 = 1/2",
      },
      {
        q: "1から10の整数から1つ選ぶ。3の倍数が選ばれる確率は？",
        a: "3/10",
        ws: ["1/3", "2/5", "1/5"],
        exp: "3の倍数：3, 6, 9 の3通り。確率 = 3/10",
      },
      {
        q: "赤玉3個・白玉2個の袋から1個取り出す。赤玉の確率は？",
        a: "3/5",
        ws: ["2/5", "1/2", "3/4"],
        exp: "全体5個のうち赤3個。確率 = 3/5",
      },
      {
        q: "52枚のトランプから1枚引く。ハートの確率は？",
        a: "1/4",
        ws: ["1/13", "1/2", "1/52"],
        exp: "ハート13枚 / 全体52枚 = 1/4",
      },
    ];
    const p = problems[rand(0, problems.length - 1)];
    const opts = buildOptions(p.a, p.ws);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "probability",
      difficulty,
      question: p.q,
      questionHtml: p.q,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: p.exp,
    };
  } else if (difficulty === "medium") {
    const problems = [
      {
        q: "2枚のコインを投げる。少なくとも1枚表が出る確率は？",
        a: "3/4",
        ws: ["1/2", "1/4", "2/3"],
        exp: "全体：(表表)(表裏)(裏表)(裏裏) = 4通り。少なくとも1枚表：3通り。確率 = 3/4",
      },
      {
        q: "2個のサイコロを投げる。目の和が7になる確率は？",
        a: "1/6",
        ws: ["1/12", "7/36", "1/7"],
        exp: "全体36通り。和7：(1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6通り。確率 = 6/36 = 1/6",
      },
      {
        q: "5人から3人を選ぶ組み合わせの数は？",
        a: "10",
        ws: ["15", "20", "60"],
        exp: "₅C₃ = 5!/(3!×2!) = 120/12 = 10",
      },
      {
        q: "A, B, C, D の4文字を1列に並べる。Aが先頭になる確率は？",
        a: "1/4",
        ws: ["1/3", "1/6", "1/2"],
        exp: "全体：4! = 24通り。Aが先頭：3! = 6通り。確率 = 6/24 = 1/4",
      },
    ];
    const p = problems[rand(0, problems.length - 1)];
    const opts = buildOptions(p.a, p.ws);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "probability",
      difficulty,
      question: p.q,
      questionHtml: p.q,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: p.exp,
    };
  } else {
    const problems = [
      {
        q: "袋に赤3・青2・白1の玉。2個取り出したとき、2個とも赤の確率は？",
        a: "1/5",
        ws: ["1/4", "3/10", "2/15"],
        exp: "全体：₆C₂ = 15。赤2個：₃C₂ = 3。確率 = 3/15 = 1/5",
      },
      {
        q: "カードが5枚（1〜5）。2枚引いて積が偶数になる確率は？",
        a: "7/10",
        ws: ["1/2", "3/5", "4/5"],
        exp: "全体：₅C₂ = 10。偶数にならない（両方奇数）：1,3,5の₃C₂ = 3。偶数になる = 10-3 = 7。確率 = 7/10",
      },
      {
        q: "男3人女2人から代表2人を選ぶ。男女1人ずつになる確率は？",
        a: "3/5",
        ws: ["2/5", "1/2", "6/10"],
        exp: "全体：₅C₂ = 10。男1女1：₃C₁×₂C₁ = 6。確率 = 6/10 = 3/5",
      },
    ];
    const p = problems[rand(0, problems.length - 1)];
    const opts = buildOptions(p.a, p.ws);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "probability",
      difficulty,
      question: p.q,
      questionHtml: p.q,
      options: opts.options,
      correctIndex: opts.correctIndex,
      explanation: p.exp,
    };
  }
}

// ---- HELPERS ----

function buildOptions(
  correct: string,
  rawWrongs: string[]
): { options: string[]; correctIndex: number } {
  const wrongs = uniqueWrongOptions(correct, rawWrongs).slice(0, 3);
  // Pad if needed
  while (wrongs.length < 3) wrongs.push(`${correct}（別解なし）`);
  const all = shuffle([correct, ...wrongs]);
  return { options: all, correctIndex: all.indexOf(correct) };
}

// ---- PUBLIC API ----

// ---- ELITE (最難関) PROBLEMS ----

const ELITE_PROBLEMS: MathQuestion[] = [
  // ===== 展開 =====
  {
    id: "elite-exp-1",
    topic: "expansion",
    difficulty: "hard",
    question: "(x+y+z)² を展開せよ",
    questionHtml: "<strong>(x+y+z)²</strong> を展開せよ",
    options: [
      "x²+y²+z²+2xy+2yz+2zx",
      "x²+y²+z²+xy+yz+zx",
      "x²+y²+z²+2xy+yz+zx",
      "x²+y²+z²",
    ],
    correctIndex: 0,
    explanation: "(x+y+z)² = x²+y²+z²+2xy+2yz+2zx（3項の平方展開）",
  },
  {
    id: "elite-exp-2",
    topic: "expansion",
    difficulty: "hard",
    question: "(x+1)(x-1)(x²+1) を展開せよ",
    questionHtml: "<strong>(x+1)(x-1)(x²+1)</strong> を展開せよ",
    options: ["x⁴-1", "x⁴+1", "x⁴-x²-1", "x⁴-2x²+1"],
    correctIndex: 0,
    explanation: "(x+1)(x-1)=x²-1、次に(x²-1)(x²+1)=x⁴-1",
  },
  {
    id: "elite-exp-3",
    topic: "expansion",
    difficulty: "hard",
    question: "(2x-3)³ を展開せよ",
    questionHtml: "<strong>(2x-3)³</strong> を展開せよ",
    options: [
      "8x³-36x²+54x-27",
      "8x³-18x²+27x-27",
      "6x³-36x²+54x-27",
      "8x³-36x²+27x-27",
    ],
    correctIndex: 0,
    explanation: "(a-b)³=a³-3a²b+3ab²-b³ に a=2x, b=3 を代入：8x³-36x²+54x-27",
  },

  // ===== 因数分解 =====
  {
    id: "elite-fac-1",
    topic: "factoring",
    difficulty: "hard",
    question: "x⁴ - 5x² + 4 を因数分解せよ",
    questionHtml: "<strong>x⁴ - 5x² + 4</strong> を因数分解せよ",
    options: [
      "(x+1)(x-1)(x+2)(x-2)",
      "(x²-1)(x²-4)",
      "(x+1)(x-1)(x²-4)",
      "(x²+1)(x²-4)",
    ],
    correctIndex: 0,
    explanation: "x²=Xとおくと X²-5X+4=(X-1)(X-4)=(x²-1)(x²-4)=(x+1)(x-1)(x+2)(x-2)",
  },
  {
    id: "elite-fac-2",
    topic: "factoring",
    difficulty: "hard",
    question: "2x² + 7x + 3 を因数分解せよ",
    questionHtml: "<strong>2x² + 7x + 3</strong> を因数分解せよ",
    options: ["(2x+1)(x+3)", "(x+1)(2x+3)", "(2x+3)(x+1)", "(x+3)(2x+1)"],
    correctIndex: 0,
    explanation: "たすき掛け：2×3=6、和が7になる組合せ→1と6。(2x+1)(x+3)を確認：2x²+6x+x+3=2x²+7x+3 ✓",
  },
  {
    id: "elite-fac-3",
    topic: "factoring",
    difficulty: "hard",
    question: "x³ + 3x² + 3x + 1 を因数分解せよ",
    questionHtml: "<strong>x³ + 3x² + 3x + 1</strong> を因数分解せよ",
    options: ["(x+1)³", "(x+1)²(x-1)", "(x+1)(x²+2x+1)", "(x³+1)(x+1)"],
    correctIndex: 0,
    explanation: "(a+b)³=a³+3a²b+3ab²+b³ の形。a=x, b=1 で (x+1)³",
  },

  // ===== 二次方程式 =====
  {
    id: "elite-qeq-1",
    topic: "quadratic-eq",
    difficulty: "hard",
    question: "x² + 2x - 2 = 0 を解け",
    questionHtml: "<strong>x² + 2x - 2 = 0</strong> を解け",
    options: ["x = -1±√3", "x = 1±√3", "x = -1±√2", "x = -2±√6"],
    correctIndex: 0,
    explanation: "x = (-2±√(4+8))/2 = (-2±√12)/2 = (-2±2√3)/2 = -1±√3",
  },
  {
    id: "elite-qeq-2",
    topic: "quadratic-eq",
    difficulty: "hard",
    question: "2x² - 3x - 1 = 0 を解け",
    questionHtml: "<strong>2x² - 3x - 1 = 0</strong> を解け",
    options: [
      "x = (3±√17)/4",
      "x = (3±√7)/4",
      "x = (3±√17)/2",
      "x = (-3±√17)/4",
    ],
    correctIndex: 0,
    explanation: "x = (3±√(9+8))/4 = (3±√17)/4",
  },
  {
    id: "elite-qeq-3",
    topic: "quadratic-eq",
    difficulty: "hard",
    question: "x² + px + q = 0 の2つの解が 3+√2 と 3-√2 のとき、p と q の値は？",
    questionHtml: "x² + px + q = 0 の2解が <strong>3+√2</strong> と <strong>3-√2</strong> のとき、<strong>p, q</strong> の値は？",
    options: ["p = -6, q = 7", "p = 6, q = 7", "p = -6, q = 11", "p = -3, q = 7"],
    correctIndex: 0,
    explanation: "解と係数の関係：和 = (3+√2)+(3-√2) = 6 = -p → p=-6、積 = (3+√2)(3-√2) = 9-2 = 7 = q",
  },

  // ===== 三角比 =====
  {
    id: "elite-tri-1",
    topic: "trigonometry",
    difficulty: "hard",
    question: "sin θ + cos θ = 1/2 のとき、sin θ cos θ の値を求めよ",
    questionHtml: "<strong>sin θ + cos θ = 1/2</strong> のとき、<strong>sin θ cos θ</strong> の値を求めよ",
    options: ["-3/8", "3/8", "-1/8", "1/4"],
    correctIndex: 0,
    explanation: "両辺を2乗：1 + 2sinθcosθ = 1/4 → 2sinθcosθ = -3/4 → sinθcosθ = -3/8",
  },
  {
    id: "elite-tri-2",
    topic: "trigonometry",
    difficulty: "hard",
    question: "△ABCでa=7, b=5, c=3のとき、cos A の値を求めよ",
    questionHtml: "△ABCで<strong>a=7, b=5, c=3</strong>のとき、<strong>cos A</strong> の値を求めよ",
    options: ["1/2", "-1/2", "√3/2", "1/4"],
    correctIndex: 1,
    explanation: "余弦定理：cos A = (b²+c²-a²)/(2bc) = (25+9-49)/30 = -15/30 = -1/2",
  },
  {
    id: "elite-tri-3",
    topic: "trigonometry",
    difficulty: "hard",
    question: "0° ≤ θ ≤ 180° で 2cos²θ + cosθ - 1 = 0 を解け",
    questionHtml: "0° ≤ θ ≤ 180° で <strong>2cos²θ + cosθ - 1 = 0</strong> を解け",
    options: ["θ = 60°, 180°", "θ = 60°", "θ = 120°, 180°", "θ = 0°, 60°"],
    correctIndex: 0,
    explanation: "(2cosθ-1)(cosθ+1)=0 → cosθ=1/2 or cosθ=-1。cosθ=1/2→θ=60°、cosθ=-1→θ=180°",
  },

  // ===== 確率 =====
  {
    id: "elite-prob-1",
    topic: "probability",
    difficulty: "hard",
    question: "袋Aに赤2個・白3個、袋Bに赤4個・白1個。コインの表なら袋A、裏なら袋Bから1個取り出す。赤だった確率で、袋Aから取り出した確率は？",
    questionHtml: "袋A（赤2白3）/ 袋B（赤4白1）。コインで袋を選び1個取り出すと<strong>赤</strong>だった。<strong>袋Aから</strong>取り出した確率は？",
    options: ["1/3", "2/5", "1/2", "2/3"],
    correctIndex: 0,
    explanation: "P(A|赤)=P(赤|A)P(A)/P(赤)=(2/5×1/2)/[(2/5×1/2)+(4/5×1/2)]=(1/5)/(3/5)=1/3（ベイズの定理）",
  },
  {
    id: "elite-prob-2",
    topic: "probability",
    difficulty: "hard",
    question: "1〜9の整数から重複なく3つ選ぶ。3つの積が偶数になる確率は？",
    questionHtml: "1〜9の整数から重複なく3つ選ぶ。<strong>積が偶数</strong>になる確率は？",
    options: ["37/42", "5/42", "1/2", "7/9"],
    correctIndex: 0,
    explanation: "余事象（積が奇数）= 奇数3つを選ぶ確率。奇数は1,3,5,7,9の5個。₅C₃/₉C₃ = 10/84 = 5/42。よって偶数の確率 = 1-5/42 = 37/42",
  },
  {
    id: "elite-prob-3",
    topic: "probability",
    difficulty: "hard",
    question: "コインを5回投げる。表が連続して2回以上出る確率は？",
    questionHtml: "コインを5回投げる。<strong>表が連続して2回以上</strong>出る確率は？",
    options: ["3/4", "1/2", "19/32", "13/32"],
    correctIndex: 2,
    explanation: "余事象（表が連続2回以上出ない）を求める。全体2⁵=32通り。「連続2回表なし」のパターンを数えると13通り（詳細は樹形図）。よって1-13/32 = 19/32",
  },

  // ===== 二次関数 =====
  {
    id: "elite-qfn-1",
    topic: "quadratic-fn",
    difficulty: "hard",
    question: "放物線 y = x² と直線 y = 2x + k が接するとき、k の値は？",
    questionHtml: "放物線 <strong>y = x²</strong> と直線 <strong>y = 2x + k</strong> が接するとき、<strong>k</strong> の値は？",
    options: ["k = -1", "k = 1", "k = -2", "k = 2"],
    correctIndex: 0,
    explanation: "接するとき重解条件 D=0。x²=2x+k → x²-2x-k=0、D = 4+4k = 0 → k = -1",
  },
  {
    id: "elite-qfn-2",
    topic: "quadratic-fn",
    difficulty: "hard",
    question: "y = 2x² - 8x + 5 の最小値と、そのときの x の値は？",
    questionHtml: "<strong>y = 2x² - 8x + 5</strong> の最小値と、そのときの <strong>x</strong> の値は？",
    options: ["x=2 で最小値 -3", "x=-2 で最小値 -3", "x=2 で最小値 3", "x=4 で最小値 -3"],
    correctIndex: 0,
    explanation: "y = 2(x-2)² - 3 と変形。頂点 (2, -3) が最小値（a=2>0なので下に凸）",
  },
];

export function generateEliteQuestion(): MathQuestion {
  const q = ELITE_PROBLEMS[rand(0, ELITE_PROBLEMS.length - 1)];
  // Return a fresh copy with new id
  return { ...q, id: Math.random().toString(36).slice(2) };
}

export function generateEliteChallengeSet(): MathQuestion[] {
  // Pick 2 from each topic, no repeats
  const byTopic: Record<string, MathQuestion[]> = {};
  for (const q of ELITE_PROBLEMS) {
    if (!byTopic[q.topic]) byTopic[q.topic] = [];
    byTopic[q.topic].push(q);
  }
  const selected: MathQuestion[] = [];
  for (const topic of Object.keys(byTopic)) {
    const topicQs = shuffle([...byTopic[topic]]);
    selected.push(...topicQs.slice(0, 2));
  }
  return shuffle(selected).map((q) => ({ ...q, id: Math.random().toString(36).slice(2) }));
}

export function getChallengeRank(pct: number): {
  rank: string;
  title: string;
  color: string;
  message: string;
} {
  if (pct === 100) return { rank: "S+", title: "数学の覇者", color: "#ffd700", message: "完全制覇！あなたは本物の天才です！" };
  if (pct >= 90)  return { rank: "S",  title: "超一流",     color: "#ffd700", message: "圧巻の結果！トップ校合格レベル！" };
  if (pct >= 80)  return { rank: "A",  title: "優秀",       color: "#60a5fa", message: "素晴らしい！難関校レベルです！" };
  if (pct >= 70)  return { rank: "B",  title: "実力者",     color: "#4ade80", message: "よくできました！あと一歩！" };
  if (pct >= 50)  return { rank: "C",  title: "挑戦者",     color: "#fb923c", message: "難しかったけど、よく挑戦した！" };
  return               { rank: "D",  title: "修行中",     color: "#f87171", message: "最難関は甘くない。基礎を固めて再挑戦！" };
}

export function generateQuestion(topic: Topic, difficulty: Difficulty): MathQuestion {
  switch (topic) {
    case "expansion": return genExpansion(difficulty);
    case "factoring": return genFactoring(difficulty);
    case "quadratic-eq": return genQuadraticEq(difficulty);
    case "quadratic-fn": return genQuadraticFn(difficulty);
    case "trigonometry": return genTrigonometry(difficulty);
    case "probability": return genProbability(difficulty);
  }
}

export function generateQuestionSet(
  topics: Topic[],
  count: number
): MathQuestion[] {
  const difficulties: Difficulty[] = ["easy", "easy", "medium", "medium", "hard"];
  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length];
    const diff = difficulties[Math.min(Math.floor(i / 2), difficulties.length - 1)];
    return generateQuestion(topic, diff);
  });
}

export function getEncouragementMessage(correct: number, total: number): string {
  const pct = correct / total;
  if (pct === 1) return "完璧！満点達成！天才かも！！";
  if (pct >= 0.9) return "すごい！ほぼ満点！あと少しで完璧！";
  if (pct >= 0.7) return "なかなかいい！もう少し練習すれば完璧！";
  if (pct >= 0.5) return "まずまず！復習すれば次はもっとできる！";
  if (pct >= 0.3) return "もう少し頑張ろう！諦めなければ必ず伸びる！";
  return "大丈夫！基礎から一歩ずつ！君ならできる！";
}

export const GAME_MODES = [
  {
    id: "quiz" as const,
    label: "クイズモード",
    description: "10問を解いてスコアを競おう",
    icon: "BookOpen",
    color: "blue",
  },
  {
    id: "time-attack" as const,
    label: "タイムアタック",
    description: "60秒間で何問解けるか挑戦！",
    icon: "Zap",
    color: "cyan",
  },
  {
    id: "survival" as const,
    label: "サバイバル",
    description: "3ミス失格！どこまで続けられる？",
    icon: "Shield",
    color: "purple",
  },
] as const;

export type GameMode = typeof GAME_MODES[number]["id"];
