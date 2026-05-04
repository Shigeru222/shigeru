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
  steps?: string[];
  keyPoint?: string;
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

// ---- ELITE (最難関) GENERATORS ----

// Each generator takes a variant index so generateEliteChallengeSet
// can guarantee two different problem types per topic per session.

function genEliteExpansion(variant: number): MathQuestion {
  const v = ((variant % 3) + 3) % 3;

  if (v === 0) {
    // (ax-b)³
    const a = rand(2, 3), b = rand(2, 4);
    const a3 = a ** 3, C1 = 3 * a * a * b, C2 = 3 * a * b * b, b3 = b ** 3;
    const ans = `${a3}x³-${C1}x²+${C2}x-${b3}`;
    const opts = buildOptions(ans, [
      `${a3}x³-${C1 + a}x²+${C2}x-${b3}`,
      `${a3}x³-${C1}x²+${C2 - a}x-${b3}`,
      `${a * a}x³-${C1}x²+${C2}x-${b3}`,
    ]);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "expansion", difficulty: "hard",
      question: `(${a}x-${b})³ を展開せよ`,
      questionHtml: `<strong>(${a}x-${b})³</strong> を展開せよ`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `(a-b)³=a³-3a²b+3ab²-b³ に a=${a}x, b=${b} を代入：${ans}`,
      keyPoint: "(a-b)³ = a³-3a²b+3ab²-b³",
      steps: [
        `a=${a}x, b=${b} と置く`,
        `a³ = (${a}x)³ = ${a3}x³`,
        `3a²b = 3·(${a}x)²·${b} = 3·${a * a}x²·${b} = ${C1}x²`,
        `3ab² = 3·(${a}x)·${b * b} = ${C2}x`,
        `b³ = ${b}³ = ${b3}`,
        `代入してまとめる: ${ans}`,
      ],
    };
  }

  if (v === 1) {
    // (x+a)(x-a)(x²+a²) = x⁴-a⁴
    const a = rand(1, 3);
    const a2 = a * a, a4 = a2 * a2;
    const qStr = a === 1 ? "(x+1)(x-1)(x²+1)" : `(x+${a})(x-${a})(x²+${a2})`;
    const ans = `x⁴-${a4}`;
    const opts = buildOptions(ans, [`x⁴+${a4}`, `x⁴-${a2}x²-${a4}`, `x⁴-${2 * a2}x²+${a4}`]);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "expansion", difficulty: "hard",
      question: `${qStr} を展開せよ`,
      questionHtml: `<strong>${qStr}</strong> を展開せよ`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `(x+${a})(x-${a})=x²-${a2}、次に(x²-${a2})(x²+${a2})=${ans}`,
      keyPoint: "差の積 (A+B)(A-B)=A²-B² を繰り返し使う",
      steps: [
        `(x+${a})(x-${a}) を先に計算 = x²-${a2}（差の積の公式）`,
        `次に (x²-${a2})(x²+${a2}) を計算`,
        `= (x²)²-(${a2})² = ${ans}`,
      ],
    };
  }

  // v === 2: (x+a)(x+b)(x+c) triple product
  const vals = shuffle([1, 2, 3, 4]).slice(0, 3).sort((x, y) => x - y);
  const [pa, pb, pc] = vals;
  const S1 = pa + pb + pc, S2 = pa * pb + pb * pc + pc * pa, S3 = pa * pb * pc;
  const ans = `x³+${S1}x²+${S2}x+${S3}`;
  const opts = buildOptions(ans, [
    `x³+${S1}x²+${S2 + 1}x+${S3}`,
    `x³+${S1 + 1}x²+${S2}x+${S3}`,
    `x³+${S1}x²+${S2}x+${S3 + 1}`,
  ]);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "expansion", difficulty: "hard",
    question: `(x+${pa})(x+${pb})(x+${pc}) を展開せよ`,
    questionHtml: `<strong>(x+${pa})(x+${pb})(x+${pc})</strong> を展開せよ`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `(x+a)(x+b)(x+c)=x³+(a+b+c)x²+(ab+bc+ca)x+abc に代入: ${ans}`,
    keyPoint: "(x+a)(x+b)(x+c) = x³+(a+b+c)x²+(ab+bc+ca)x+abc",
    steps: [
      `まず (x+${pa})(x+${pb}) = x²+${pa + pb}x+${pa * pb}`,
      `次に (x²+${pa + pb}x+${pa * pb})(x+${pc}) を展開`,
      `x²の係数: ${pa + pb}+${pc} = ${S1}`,
      `xの係数: ${pa * pb}+${pc * (pa + pb)} = ${S2}`,
      `定数: ${pa * pb}×${pc} = ${S3}`,
      `結果: ${ans}`,
    ],
  };
}

function genEliteFactoring(variant: number): MathQuestion {
  const v = ((variant % 3) + 3) % 3;

  if (v === 0) {
    // x⁴-(a²+b²)x²+a²b² = (x+a)(x-a)(x+b)(x-b)
    const a = rand(1, 2), b = a + rand(1, 2);
    const p = a * a + b * b, q = a * a * b * b;
    const qStr = `x⁴-${p}x²+${q}`;
    const ans = `(x+${a})(x-${a})(x+${b})(x-${b})`;
    const opts = buildOptions(ans, [
      `(x²-${a * a})(x²-${b * b})`,
      `(x+${a})(x-${a})(x²-${b * b})`,
      `(x²+${a * a})(x²-${b * b})`,
    ]);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "factoring", difficulty: "hard",
      question: `次の式を因数分解せよ：${qStr}`,
      questionHtml: `次の式を因数分解せよ：<strong>${qStr}</strong>`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `t=x²と置くと(t-${a*a})(t-${b*b})=(x²-${a*a})(x²-${b*b})=${ans}`,
      keyPoint: "t=x² と置換して二次式として因数分解",
      steps: [
        `t=x² と置くと t²-${p}t+${q} = (t-${a*a})(t-${b*b})`,
        `t を x² に戻す: (x²-${a*a})(x²-${b*b})`,
        `各因数を差の積で分解: (x+${a})(x-${a})·(x+${b})(x-${b})`,
      ],
    };
  }

  if (v === 1) {
    // ax²+bx+c (tasuki-gake)
    type TCase = { q: string; ans: string; w: string[]; p1: [number,number]; p2: [number,number]; ca: number; cb: number; cc: number };
    const cases: TCase[] = [
      { q:"2x²+7x+3",  ans:"(2x+1)(x+3)", w:["(2x+3)(x+1)","(2x+1)(x+2)","(x+3)(2x+2)"], p1:[2,1], p2:[1,3], ca:2, cb:7, cc:3 },
      { q:"2x²+5x+3",  ans:"(2x+3)(x+1)", w:["(2x+1)(x+3)","(2x+3)(x+2)","(x+1)(2x+2)"], p1:[2,3], p2:[1,1], ca:2, cb:5, cc:3 },
      { q:"3x²+7x+2",  ans:"(3x+1)(x+2)", w:["(3x+2)(x+1)","(3x+1)(x+3)","(x+2)(3x+3)"], p1:[3,1], p2:[1,2], ca:3, cb:7, cc:2 },
      { q:"3x²+8x+4",  ans:"(3x+2)(x+2)", w:["(3x+4)(x+1)","(3x+2)(x+3)","(x+2)(3x+1)"], p1:[3,2], p2:[1,2], ca:3, cb:8, cc:4 },
      { q:"2x²+9x+4",  ans:"(2x+1)(x+4)", w:["(2x+4)(x+1)","(2x+1)(x+3)","(x+4)(2x+3)"], p1:[2,1], p2:[1,4], ca:2, cb:9, cc:4 },
    ];
    const cp = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(cp.ans, cp.w);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "factoring", difficulty: "hard",
      question: `次の式を因数分解せよ：${cp.q}`,
      questionHtml: `次の式を因数分解せよ：<strong>${cp.q}</strong>`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `たすき掛け：${cp.p1[0]}×${cp.p2[1]}+${cp.p1[1]}×1=${cp.cb} → ${cp.ans}`,
      keyPoint: "たすき掛け：a·cの積の組合せで和がbになるものを探す",
      steps: [
        `a=${cp.ca}, c=${cp.cc} → a·c = ${cp.ca * cp.cc}`,
        `${cp.p1[0]}×${cp.p2[1]}+${cp.p1[1]}×1 = ${cp.p1[0]*cp.p2[1]}+${cp.p1[1]} = ${cp.cb} ✓`,
        `${cp.ans} と推測して確認`,
        `展開: ${cp.ca}x²+(${cp.p1[0]*cp.p2[1]}+${cp.p1[1]})x+${cp.p1[1]*cp.p2[1]} = ${cp.q} ✓`,
      ],
    };
  }

  // v === 2: x³+3ax²+3a²x+a³ = (x+a)³
  const a = rand(1, 3);
  const C1 = 3 * a, C2 = 3 * a * a, C3 = a ** 3;
  const qStr = `x³+${C1}x²+${C2}x+${C3}`;
  const ans = `(x+${a})³`;
  const opts = buildOptions(ans, [
    `(x+${a})²(x+${a + 1})`,
    a < 3 ? `(x+${a + 1})³` : `(x+${a - 1})³`,
    `(x+${a})(x²+${C1}x+${C2})`,
  ]);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "factoring", difficulty: "hard",
    question: `次の式を因数分解せよ：${qStr}`,
    questionHtml: `次の式を因数分解せよ：<strong>${qStr}</strong>`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `(a+b)³=a³+3a²b+3ab²+b³ の形。a=x, b=${a} で ${ans}`,
    keyPoint: "(a+b)³ = a³+3a²b+3ab²+b³（係数 1,3,3,1）",
    steps: [
      `係数 1, ${C1}, ${C2}, ${C3} → パスカルの三角形の形`,
      `(x+b)³ = x³+3bx²+3b²x+b³ と比較`,
      `b³=${C3} より b=${a}、確認: 3b=${C1} ✓、3b²=${C2} ✓`,
      `答え: ${ans}`,
    ],
  };
}

function genEliteQuadraticEq(variant: number): MathQuestion {
  const v = ((variant % 3) + 3) % 3;

  if (v === 0) {
    // x²+px+q=0 with irrational roots (a=1)
    type QCase = { q: string; b: number; c: number; D: number; sqrtD: string; ans: string; wrongs: string[]; stepD: string };
    const cases: QCase[] = [
      { q:"x²+2x-2", b:2, c:-2, D:12, sqrtD:"2√3", ans:"x = -1±√3", wrongs:["x = 1±√3","x = -1±√2","x = -2±√6"], stepD:"D = 2²-4(1)(-2) = 4+8 = 12" },
      { q:"x²+4x+2", b:4, c:2,  D:8,  sqrtD:"2√2", ans:"x = -2±√2", wrongs:["x = 2±√2","x = -2±√3","x = -4±√8"],  stepD:"D = 4²-4(1)(2) = 16-8 = 8"  },
      { q:"x²+6x+2", b:6, c:2,  D:28, sqrtD:"2√7", ans:"x = -3±√7", wrongs:["x = 3±√7","x = -3±√5","x = -6±2√7"], stepD:"D = 6²-4(1)(2) = 36-8 = 28" },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(c.ans, c.wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-eq", difficulty: "hard",
      question: `${c.q} = 0 を解け`,
      questionHtml: `<strong>${c.q} = 0</strong> を解け`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `${c.stepD}、x = (-${c.b}±${c.sqrtD})/2 = ${c.ans.split(" = ")[1]}`,
      keyPoint: "解の公式: x = (-b ± √(b²-4ac)) / (2a)",
      steps: [
        `a=1, b=${c.b}, c=${c.c} を確認`,
        c.stepD,
        `√${c.D} = ${c.sqrtD} に整理`,
        `x = (-${c.b}±${c.sqrtD})/2 = ${c.ans.split(" = ")[1]}`,
      ],
    };
  }

  if (v === 1) {
    // ax²+bx+c=0 with a>1, quadratic formula
    type QCase2 = { q: string; a: number; b: number; c: number; D: number; ans: string; wrongs: string[]; stepD: string; nb: string };
    const cases: QCase2[] = [
      { q:"2x²-3x-1", a:2, b:-3, c:-1, D:17, ans:"x = (3±√17)/4",  wrongs:["x = (3±√7)/4","x = (3±√17)/2","x = (-3±√17)/4"], stepD:"D = (-3)²-4(2)(-1) = 9+8 = 17",  nb:"3"  },
      { q:"3x²-x-1",  a:3, b:-1, c:-1, D:13, ans:"x = (1±√13)/6",  wrongs:["x = (1±√7)/6","x = (-1±√13)/6","x = (1±√13)/3"],  stepD:"D = (-1)²-4(3)(-1) = 1+12 = 13", nb:"1"  },
      { q:"2x²+3x-1", a:2, b:3,  c:-1, D:17, ans:"x = (-3±√17)/4", wrongs:["x = (3±√17)/4","x = (-3±√7)/4","x = (-3±√17)/2"], stepD:"D = 3²-4(2)(-1) = 9+8 = 17",    nb:"-3" },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(c.ans, c.wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-eq", difficulty: "hard",
      question: `${c.q} = 0 を解け`,
      questionHtml: `<strong>${c.q} = 0</strong> を解け`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `${c.stepD}、x = (${c.nb}±√${c.D})/${2 * c.a} = ${c.ans.split(" = ")[1]}`,
      keyPoint: "解の公式: x = (-b ± √(b²-4ac)) / (2a)",
      steps: [
        `a=${c.a}, b=${c.b}, c=${c.c} を確認`,
        c.stepD,
        `x = (${c.nb}±√${c.D}) / (2×${c.a}) = ${c.ans.split(" = ")[1]}`,
      ],
    };
  }

  // v === 2: Vieta's formulas
  type VCase = { r1: string; r2: string; sum: number; p: number; prodStep: string; q: number };
  const cases: VCase[] = [
    { r1:"3+√2", r2:"3-√2", sum:6, p:-6, prodStep:"3²-(√2)²=9-2", q:7  },
    { r1:"2+√3", r2:"2-√3", sum:4, p:-4, prodStep:"2²-(√3)²=4-3", q:1  },
    { r1:"4+√5", r2:"4-√5", sum:8, p:-8, prodStep:"4²-(√5)²=16-5", q:11 },
  ];
  const c = cases[rand(0, cases.length - 1)];
  const ans = `p = ${c.p}, q = ${c.q}`;
  const opts = buildOptions(ans, [`p = ${-c.p}, q = ${c.q}`, `p = ${c.p}, q = ${c.q + 1}`, `p = ${c.p}, q = ${c.q - 1}`]);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "quadratic-eq", difficulty: "hard",
    question: `x²+px+q=0 の2解が ${c.r1} と ${c.r2} のとき、p, q の値は？`,
    questionHtml: `x²+px+q=0 の2解が <strong>${c.r1}</strong> と <strong>${c.r2}</strong> のとき、<strong>p, q</strong> の値は？`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `2解の和=${c.sum}=-p→p=${c.p}、積=${c.prodStep}=${c.q}=q`,
    keyPoint: "解と係数の関係: 2解の和=-p, 2解の積=q",
    steps: [
      `2解の和 = (${c.r1})+(${c.r2}) = ${c.sum}（√の部分が消える）`,
      `和=-p より p = ${c.p}`,
      `2解の積 = (${c.r1})(${c.r2}) = ${c.prodStep} = ${c.q}`,
      `積=q より q = ${c.q}`,
    ],
  };
}

function genEliteQuadraticFn(variant: number): MathQuestion {
  const v = ((variant % 2) + 2) % 2;

  if (v === 0) {
    // y=x² tangent to y=mx+k → D=0 → k=-(m/2)²
    const m = rand(1, 3) * 2;  // 2, 4, 6
    const k = -(m * m) / 4;    // -1, -4, -9
    const ans = `k = ${k}`;
    const opts = buildOptions(ans, [`k = ${k + 1}`, `k = ${-k}`, `k = ${k - 1}`]);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "quadratic-fn", difficulty: "hard",
      question: `放物線 y=x² と直線 y=${m}x+k が接するとき、k の値は？`,
      questionHtml: `放物線 <strong>y=x²</strong> と直線 <strong>y=${m}x+k</strong> が接するとき、<strong>k</strong> の値は？`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `x²-${m}x-k=0、接するのでD=${m}²+4k=0→k=${k}`,
      keyPoint: "接する条件 = 判別式 D=0（重解条件）",
      steps: [
        `y=x² と y=${m}x+k を連立: x²=${m}x+k`,
        `整理: x²-${m}x-k = 0`,
        `接するとき（重解）→ D = 0`,
        `D = (-${m})²-4(1)(-k) = ${m * m}+4k = 0`,
        `4k = -${m * m} → k = ${k}`,
      ],
    };
  }

  // v === 1: completing the square
  type SqCase = { q: string; a: number; p: number; ymin: number; ap2: number; c: number };
  const cases: SqCase[] = [
    { q:"2x²-8x+5",   a:2, p:2, ymin:-3, ap2:8,  c:5  },
    { q:"3x²-6x+2",   a:3, p:1, ymin:-1, ap2:3,  c:2  },
    { q:"2x²-12x+14", a:2, p:3, ymin:-4, ap2:18, c:14 },
    { q:"3x²-12x+7",  a:3, p:2, ymin:-5, ap2:12, c:7  },
  ];
  const cp = cases[rand(0, cases.length - 1)];
  const ans = `x=${cp.p} で最小値 ${cp.ymin}`;
  const opts = buildOptions(ans, [
    `x=-${cp.p} で最小値 ${cp.ymin}`,
    `x=${cp.p} で最小値 ${cp.ymin + cp.a}`,
    `x=${cp.p + 1} で最小値 ${cp.ymin}`,
  ]);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "quadratic-fn", difficulty: "hard",
    question: `y = ${cp.q} の最小値と、そのときの x の値は？`,
    questionHtml: `<strong>y = ${cp.q}</strong> の最小値と、そのときの <strong>x</strong> の値は？`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `y=${cp.a}(x-${cp.p})²+${cp.ymin} と変形。a=${cp.a}>0なので下に凸、x=${cp.p}で最小値${cp.ymin}`,
    keyPoint: "平方完成: y=a(x-p)²+q の頂点は (p, q)",
    steps: [
      `${cp.q} を平方完成する`,
      `= ${cp.a}(x²-${2 * cp.p}x)+${cp.c}`,
      `x²-${2 * cp.p}x = (x-${cp.p})²-${cp.p * cp.p} を使う`,
      `= ${cp.a}((x-${cp.p})²-${cp.p * cp.p})+${cp.c}`,
      `= ${cp.a}(x-${cp.p})²-${cp.ap2}+${cp.c}`,
      `= ${cp.a}(x-${cp.p})²+${cp.ymin}`,
      `a=${cp.a}>0 → x=${cp.p} で最小値 ${cp.ymin}`,
    ],
  };
}

function genEliteTrigonometry(variant: number): MathQuestion {
  const v = ((variant % 3) + 3) % 3;

  if (v === 0) {
    // sinθ±cosθ=k, find sinθcosθ
    type TCase = { expr: string; k: string; kSq: string; ans: string; step1: string; step2: string; step3: string; wrongs: string[] };
    const cases: TCase[] = [
      { expr:"sinθ+cosθ", k:"1/2", kSq:"1/4", ans:"-3/8", step1:"1+2sinθcosθ=1/4", step2:"2sinθcosθ=-3/4", step3:"sinθcosθ=-3/8", wrongs:["3/8","-1/8","1/4"] },
      { expr:"sinθ+cosθ", k:"1/3", kSq:"1/9", ans:"-4/9", step1:"1+2sinθcosθ=1/9", step2:"2sinθcosθ=-8/9", step3:"sinθcosθ=-4/9", wrongs:["4/9","-1/9","1/3"] },
      { expr:"sinθ-cosθ", k:"1/2", kSq:"1/4", ans:"3/8",  step1:"1-2sinθcosθ=1/4", step2:"-2sinθcosθ=-3/4", step3:"sinθcosθ=3/8",  wrongs:["-3/8","1/8","1/4"] },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(c.ans, c.wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "trigonometry", difficulty: "hard",
      question: `${c.expr}=${c.k} のとき、sinθcosθ の値を求めよ`,
      questionHtml: `<strong>${c.expr}=${c.k}</strong> のとき、<strong>sinθcosθ</strong> の値を求めよ`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `両辺を2乗：${c.step1} → ${c.step3}`,
      keyPoint: "両辺を2乗して sin²θ+cos²θ=1 を利用",
      steps: [
        `${c.expr}=${c.k} の両辺を2乗`,
        `(${c.expr})² = ${c.kSq}`,
        `展開して sin²θ+cos²θ=1 を代入: ${c.step1}`,
        c.step2,
        c.step3,
      ],
    };
  }

  if (v === 1) {
    // Cosine rule
    type CCase = { a: number; b: number; c: number; cosA: string; num: number; den: number; wrongs: string[] };
    const cases: CCase[] = [
      { a:7, b:5, c:3, cosA:"-1/2", num:-15, den:30, wrongs:["1/2","√3/2","1/4"]  },
      { a:7, b:8, c:5, cosA:"1/2",  num:40,  den:80, wrongs:["-1/2","√3/2","1/4"] },
      { a:4, b:3, c:2, cosA:"-1/4", num:-3,  den:12, wrongs:["1/4","-1/2","1/3"]  },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const ans = `cos A = ${c.cosA}`;
    const opts = buildOptions(ans, c.wrongs.map(w => `cos A = ${w}`));
    return {
      id: Math.random().toString(36).slice(2),
      topic: "trigonometry", difficulty: "hard",
      question: `△ABCで a=${c.a}, b=${c.b}, c=${c.c} のとき、cos A を求めよ`,
      questionHtml: `△ABCで <strong>a=${c.a}, b=${c.b}, c=${c.c}</strong> のとき、<strong>cos A</strong> を求めよ`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `余弦定理: cosA=(b²+c²-a²)/(2bc)=(${c.b*c.b}+${c.c*c.c}-${c.a*c.a})/${2*c.b*c.c}=${c.num}/${c.den}=${c.cosA}`,
      keyPoint: "余弦定理: cos A = (b²+c²-a²) / (2bc)",
      steps: [
        `余弦定理: cos A = (b²+c²-a²)/(2bc)`,
        `a=${c.a}, b=${c.b}, c=${c.c} を代入`,
        `分子: ${c.b}²+${c.c}²-${c.a}² = ${c.b*c.b}+${c.c*c.c}-${c.a*c.a} = ${c.num}`,
        `分母: 2×${c.b}×${c.c} = ${c.den}`,
        `cos A = ${c.num}/${c.den} = ${c.cosA}`,
      ],
    };
  }

  // v === 2: trig equation
  type ECase = { eq: string; factored: string; sol1: string; sol2: string; ans: string; tVar: string; wrongs: string[] };
  const cases: ECase[] = [
    { eq:"2cos²θ+cosθ-1=0",  factored:"(2cosθ-1)(cosθ+1)=0", sol1:"cosθ=1/2 → θ=60°",    sol2:"cosθ=-1 → θ=180°",   ans:"θ=60°, 180°",  tVar:"cosθ", wrongs:["θ=60°","θ=120°, 180°","θ=0°, 60°"]   },
    { eq:"2cos²θ-cosθ-1=0",  factored:"(2cosθ+1)(cosθ-1)=0", sol1:"cosθ=-1/2 → θ=120°",  sol2:"cosθ=1 → θ=0°",      ans:"θ=0°, 120°",   tVar:"cosθ", wrongs:["θ=60°, 120°","θ=120°","θ=0°, 60°"]  },
    { eq:"2cos²θ+3cosθ+1=0", factored:"(2cosθ+1)(cosθ+1)=0", sol1:"cosθ=-1/2 → θ=120°",  sol2:"cosθ=-1 → θ=180°",   ans:"θ=120°, 180°", tVar:"cosθ", wrongs:["θ=60°, 180°","θ=120°","θ=60°, 120°"] },
    { eq:"2sin²θ+sinθ-1=0",  factored:"(2sinθ-1)(sinθ+1)=0", sol1:"sinθ=1/2 → θ=30°,150°", sol2:"sinθ=-1 → 範囲外",  ans:"θ=30°, 150°",  tVar:"sinθ", wrongs:["θ=30°","θ=30°, 90°, 150°","θ=150°"] },
  ];
  const c = cases[rand(0, cases.length - 1)];
  const opts = buildOptions(c.ans, c.wrongs);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "trigonometry", difficulty: "hard",
    question: `0°≤θ≤180° で ${c.eq} を解け`,
    questionHtml: `0°≤θ≤180° で <strong>${c.eq}</strong> を解け`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `t=${c.tVar} と置くと ${c.factored}、${c.sol1}、${c.sol2}`,
    keyPoint: `t=${c.tVar} と置いて二次方程式として因数分解`,
    steps: [
      `t = ${c.tVar} と置くと二次方程式になる`,
      `因数分解: ${c.factored}`,
      c.sol1,
      c.sol2,
    ],
  };
}

function genEliteProbability(variant: number): MathQuestion {
  const v = ((variant % 3) + 3) % 3;

  if (v === 0) {
    // Bayes' theorem: Bag A(rA red, wA white), Bag B(rB red, wB white)
    type BCase = { rA: number; wA: number; rB: number; wB: number; pRedA: string; pRedB: string; pRed: string; numStr: string; ans: string; wrongs: string[] };
    const cases: BCase[] = [
      { rA:2, wA:3, rB:4, wB:1, pRedA:"2/5", pRedB:"4/5", pRed:"3/5", numStr:"1/5",  ans:"1/3", wrongs:["2/5","1/2","2/3"] },
      { rA:1, wA:4, rB:3, wB:2, pRedA:"1/5", pRedB:"3/5", pRed:"2/5", numStr:"1/10", ans:"1/4", wrongs:["3/4","1/2","1/3"] },
      { rA:3, wA:2, rB:1, wB:4, pRedA:"3/5", pRedB:"1/5", pRed:"2/5", numStr:"3/10", ans:"3/4", wrongs:["1/4","1/2","2/3"] },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(c.ans, c.wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "probability", difficulty: "hard",
      question: `袋A(赤${c.rA}白${c.wA})・袋B(赤${c.rB}白${c.wB})。コインで袋を選び1個取り出すと赤だった。袋Aから取り出した確率は？`,
      questionHtml: `袋A（赤${c.rA}白${c.wA}）/ 袋B（赤${c.rB}白${c.wB}）。コインで袋を選び1個取り出すと<strong>赤</strong>だった。<strong>袋Aから</strong>取り出した確率は？`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `P(A|赤)=P(赤|A)P(A)/P(赤)=(${c.pRedA}×1/2)/${c.pRed}=${c.numStr}÷${c.pRed}=${c.ans}`,
      keyPoint: "ベイズの定理: P(A|赤) = P(赤|A)·P(A) / P(赤)",
      steps: [
        `P(A)=P(B)=1/2（コインで選ぶ）`,
        `P(赤|A)=${c.pRedA}, P(赤|B)=${c.pRedB}`,
        `P(赤) = ${c.pRedA}×1/2 + ${c.pRedB}×1/2 = ${c.pRed}`,
        `P(A|赤) = ${c.numStr} ÷ ${c.pRed} = ${c.ans}`,
      ],
    };
  }

  if (v === 1) {
    // Complement for even product
    type PCase = { n: number; odd: number; cTotal: number; cOdd: number; pOdd: string; ans: string; wrongs: string[]; oddNums: string };
    const cases: PCase[] = [
      { n:9,  odd:5, cTotal:84,  cOdd:10, pOdd:"5/42", ans:"37/42", wrongs:["5/42","1/2","7/9"],  oddNums:"1,3,5,7,9"   },
      { n:10, odd:5, cTotal:120, cOdd:10, pOdd:"1/12", ans:"11/12", wrongs:["1/12","1/2","5/6"],  oddNums:"1,3,5,7,9"   },
      { n:7,  odd:4, cTotal:35,  cOdd:4,  pOdd:"4/35", ans:"31/35", wrongs:["4/35","1/2","6/7"],  oddNums:"1,3,5,7"     },
    ];
    const c = cases[rand(0, cases.length - 1)];
    const opts = buildOptions(c.ans, c.wrongs);
    return {
      id: Math.random().toString(36).slice(2),
      topic: "probability", difficulty: "hard",
      question: `1〜${c.n}の整数から重複なく3つ選ぶ。積が偶数になる確率は？`,
      questionHtml: `1〜${c.n}の整数から重複なく3つ選ぶ。<strong>積が偶数</strong>になる確率は？`,
      options: opts.options, correctIndex: opts.correctIndex,
      explanation: `余事象：3つとも奇数の場合。₍${c.n}₎C₃=${c.cTotal}、奇数${c.odd}個からC₃=${c.cOdd}、P(奇数)=${c.pOdd}、P(偶数)=1-${c.pOdd}=${c.ans}`,
      keyPoint: "余事象「積が奇数」= すべて奇数を選ぶ場合",
      steps: [
        `全体: ₍${c.n}₎C₃ = ${c.cTotal} 通り`,
        `余事象「積が奇数」= 3つとも奇数を選ぶ`,
        `1〜${c.n}の奇数: ${c.oddNums} → ${c.odd}個`,
        `奇数3つ: ₍${c.odd}₎C₃ = ${c.cOdd} 通り`,
        `P(積が奇数) = ${c.cOdd}/${c.cTotal} = ${c.pOdd}`,
        `P(積が偶数) = 1-${c.pOdd} = ${c.ans}`,
      ],
    };
  }

  // v === 2: Consecutive coin tosses
  // No-HH sequences follow Fibonacci: f(1)=2,f(2)=3,f(3)=5,f(4)=8,f(5)=13,f(6)=21
  type CCase = { n: number; total: number; noHH: number; ans: string; wrongs: string[] };
  const cases: CCase[] = [
    { n:5, total:32, noHH:13, ans:"19/32", wrongs:["13/32","1/2","3/4"] },
    { n:6, total:64, noHH:21, ans:"43/64", wrongs:["21/64","1/2","3/4"] },
  ];
  const c = cases[rand(0, cases.length - 1)];
  const opts = buildOptions(c.ans, c.wrongs);
  return {
    id: Math.random().toString(36).slice(2),
    topic: "probability", difficulty: "hard",
    question: `コインを${c.n}回投げる。表が連続して2回以上出る確率は？`,
    questionHtml: `コインを<strong>${c.n}回</strong>投げる。<strong>表が連続して2回以上</strong>出る確率は？`,
    options: opts.options, correctIndex: opts.correctIndex,
    explanation: `余事象「HHなし」のパターンは${c.noHH}通り。P=1-${c.noHH}/${c.total}=${c.ans}`,
    keyPoint: "余事象「HHを含まない列」を系統的に数える",
    steps: [
      `全体: 2^${c.n} = ${c.total} 通り`,
      `余事象「表が連続2回以上出ない（HHなし）」を数える`,
      `長さ${c.n}でHHを含まない列を列挙すると ${c.noHH} 通り`,
      `P(連続なし) = ${c.noHH}/${c.total}`,
      `P(連続2回以上) = 1 - ${c.noHH}/${c.total} = ${c.ans}`,
    ],
  };
}

const ELITE_GENS: Array<(v: number) => MathQuestion> = [
  genEliteExpansion, genEliteFactoring, genEliteQuadraticEq,
  genEliteQuadraticFn, genEliteTrigonometry, genEliteProbability,
];
const ELITE_VARIANTS = [3, 3, 3, 2, 3, 3];

export function generateEliteQuestion(): MathQuestion {
  const i = rand(0, ELITE_GENS.length - 1);
  return ELITE_GENS[i](rand(0, ELITE_VARIANTS[i] - 1));
}

export function generateEliteChallengeSet(): MathQuestion[] {
  // Generate 2 questions per topic, always using different variants
  const all: MathQuestion[] = [];
  for (let i = 0; i < ELITE_GENS.length; i++) {
    const n = ELITE_VARIANTS[i];
    const v1 = rand(0, n - 1);
    const v2 = (v1 + rand(1, n - 1)) % n;
    all.push(ELITE_GENS[i](v1), ELITE_GENS[i](v2));
  }
  return shuffle(all);
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
