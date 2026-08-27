'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { puzzles, type Puzzle } from './puzzles';

type GameId = 'whack' | 'twentyfour' | 'reaction' | 'memory' | 'order' | 'color' | 'maze' | 'timing' | 'shooter';

const games: Array<{
  id: GameId;
  icon: string;
  title: string;
  description: string;
  tag: string;
  color: string;
}> = [
  { id: 'whack', icon: '🐹', title: '打地鼠', description: '眼疾手快，20 秒能打中几只？', tag: '手速', color: 'orange' },
  { id: 'twentyfour', icon: '24', title: '24 点', description: '用四个数字和运算符凑出 24。', tag: '算力', color: 'violet' },
  { id: 'reaction', icon: '⚡', title: '闪电反应', description: '等待随机信号，看到提示后立刻点击。', tag: '反应', color: 'green' },
  { id: 'memory', icon: '🧠', title: '记忆翻牌', description: '翻开卡片，找出所有相同图案。', tag: '记忆', color: 'pink' },
  { id: 'order', icon: '↗', title: '数字追踪', description: '从小到大，按顺序点完数字。', tag: '专注', color: 'blue' },
  { id: 'color', icon: '🌈', title: '颜色迷阵', description: '别读文字，只判断它真正的颜色。', tag: '脑力', color: 'yellow' },
  { id: 'maze', icon: '🧩', title: '迷宫探险', description: '多条路线自由选择，少走弯路冲向终点。', tag: '空间', color: 'coral' },
  { id: 'timing', icon: '⏱', title: '时间感应', description: '选择 3—7 秒，凭感觉在指定时刻按停。', tag: '感觉', color: 'mint' },
  { id: 'shooter', icon: '🎯', title: '神枪手', description: '瞄准 9 个旋转靶，每命中一个就会更快。', tag: '瞄准', color: 'steel' },
];

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function StarRating({ value, label = '本局评分' }: { value: number; label?: string }) {
  const rating = Math.max(1, Math.min(5, value));
  return (
    <div className="star-rating" role="img" aria-label={`${label}：${rating} 星`}>
      <span>{label}</span>
      <strong aria-hidden="true">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</strong>
    </div>
  );
}

type WhackLevel = 'easy' | 'normal' | 'hard';

const whackLevels: Record<WhackLevel, { label: string; interval: number; ratings: [number, number, number, number] }> = {
  easy: { label: '轻松', interval: 1150, ratings: [4, 7, 10, 13] },
  normal: { label: '标准', interval: 850, ratings: [6, 10, 14, 18] },
  hard: { label: '闪电', interval: 520, ratings: [10, 16, 22, 28] },
};

const whackLevelKeys: WhackLevel[] = ['easy', 'normal', 'hard'];

function WhackGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [mole, setMole] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState<WhackLevel>('normal');
  const [playedLevel, setPlayedLevel] = useState<WhackLevel>('normal');
  const levelConfig = whackLevels[level];
  const playedLevelConfig = whackLevels[playedLevel];

  useEffect(() => {
    if (!playing) return;
    const moveMole = window.setInterval(() => {
      setMole((previous) => {
        let next = Math.floor(Math.random() * 9);
        if (next === previous) next = (next + 1) % 9;
        return next;
      });
    }, levelConfig.interval);
    const countdown = window.setInterval(() => {
      setTimeLeft((seconds) => {
        if (seconds <= 1) {
          setPlaying(false);
          setMole(-1);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(moveMole);
      window.clearInterval(countdown);
    };
  }, [levelConfig.interval, playing]);

  function start() {
    setScore(0);
    setTimeLeft(20);
    setMole(Math.floor(Math.random() * 9));
    setPlayedLevel(level);
    setPlaying(true);
  }

  function hit(index: number) {
    if (!playing || index !== mole) return;
    setScore((value) => value + 1);
    setMole(-1);
  }

  return (
    <div className="whack-game">
      <div className="game-stats">
        <span>得分 <strong>{score}</strong></span>
        <span>难度 <strong>{levelConfig.label}</strong></span>
        <span>剩余 <strong>{timeLeft}s</strong></span>
      </div>
      <div className="mole-board" aria-label="打地鼠游戏区">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            type="button"
            className={`mole-hole ${mole === index ? 'mole-up' : ''}`}
            key={index}
            onPointerDown={() => hit(index)}
            aria-label={mole === index ? '地鼠出现，快打它' : '空洞'}
          >
            <span>{mole === index ? '🐹' : ''}</span>
          </button>
        ))}
      </div>
      {!playing && (
        <div className="game-callout">
          <strong>{timeLeft === 0 ? `本局得分：${score}` : '准备好了吗？'}</strong>
          <span>{timeLeft === 0 ? '可以更换难度，再刷新纪录！' : '选择难度，然后开始挑战。'}</span>
          {timeLeft === 0 && <StarRating label={`${playedLevelConfig.label}评分`} value={score >= playedLevelConfig.ratings[3] ? 5 : score >= playedLevelConfig.ratings[2] ? 4 : score >= playedLevelConfig.ratings[1] ? 3 : score >= playedLevelConfig.ratings[0] ? 2 : 1} />}
          <div className="difficulty-picker" role="group" aria-label="选择打地鼠难度">
            {whackLevelKeys.map((levelKey) => (
              <button type="button" key={levelKey} aria-pressed={level === levelKey} onClick={() => setLevel(levelKey)}>{whackLevels[levelKey].label}</button>
            ))}
          </div>
          <button type="button" onClick={start}>{timeLeft === 0 ? '再玩一局' : '开始游戏'}</button>
        </div>
      )}
    </div>
  );
}

const expressionKeys = [
  { value: '+', label: '加' },
  { value: '−', label: '减' },
  { value: '×', label: '乘' },
  { value: '÷', label: '除' },
  { value: '(', label: '左括号' },
  { value: ')', label: '右括号' },
];

type PuzzleLevel = 'easy' | 'normal' | 'hard';

const puzzleLevels: Record<PuzzleLevel, { label: string }> = {
  easy: { label: '简单' },
  normal: { label: '标准' },
  hard: { label: '困难' },
};

const puzzleLevelKeys: PuzzleLevel[] = ['easy', 'normal', 'hard'];

function puzzleComplexity(puzzle: Puzzle) {
  const divisions = puzzle.solution.match(/÷/g)?.length ?? 0;
  const subtractions = puzzle.solution.match(/−/g)?.length ?? 0;
  let depth = 0;
  let maxDepth = 0;
  for (const character of puzzle.solution) {
    if (character === '(') {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    } else if (character === ')') {
      depth -= 1;
    }
  }
  return divisions * 8 + subtractions * 2 + maxDepth;
}

const rankedPuzzles = [...puzzles].sort((left, right) => puzzleComplexity(left) - puzzleComplexity(right));
const firstPuzzleCut = Math.floor(rankedPuzzles.length / 3);
const secondPuzzleCut = Math.floor((rankedPuzzles.length * 2) / 3);
const puzzlePools: Record<PuzzleLevel, Puzzle[]> = {
  easy: rankedPuzzles.slice(0, firstPuzzleCut),
  normal: rankedPuzzles.slice(firstPuzzleCut, secondPuzzleCut),
  hard: rankedPuzzles.slice(secondPuzzleCut),
};

function puzzleHint(level: PuzzleLevel) {
  return `${puzzleLevels[level].label}难度 · ${puzzlePools[level].length} 题 · 四个数字每个只能使用一次。`;
}

function TwentyFourGame() {
  const [level, setLevel] = useState<PuzzleLevel>('normal');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState(() => puzzleHint('normal'));
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const puzzlePool = puzzlePools[level];
  const puzzle = puzzlePool[puzzleIndex];

  function resetPuzzle(nextLevel: PuzzleLevel) {
    setAnswer('');
    setStatus('idle');
    setAttempts(0);
    setRating(null);
    setMessage(puzzleHint(nextLevel));
  }

  function selectLevel(nextLevel: PuzzleLevel) {
    if (nextLevel === level) return;
    setLevel(nextLevel);
    setPuzzleIndex(Math.floor(Math.random() * puzzlePools[nextLevel].length));
    resetPuzzle(nextLevel);
  }

  function newPuzzle() {
    setPuzzleIndex((current) => (current + 1 + Math.floor(Math.random() * (puzzlePool.length - 1))) % puzzlePool.length);
    resetPuzzle(level);
  }

  function checkAnswer() {
    if (status === 'correct') return;
    const attemptNumber = attempts + 1;
    setAttempts(attemptNumber);
    setRating(null);
    const normalized = answer.replace(/[×xX]/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!normalized || !/^[\d+\-*/().\s]+$/.test(normalized)) {
      setStatus('wrong');
      setMessage('请输入数字、括号和 + − × ÷。');
      return;
    }
    const usedNumbers = (normalized.match(/\d+(?:\.\d+)?/g) ?? []).map(Number).sort((a, b) => a - b);
    const expected = [...puzzle.numbers].sort((a, b) => a - b);
    if (usedNumbers.length !== 4 || usedNumbers.some((number, index) => number !== expected[index])) {
      setStatus('wrong');
      setMessage('四个数字都要用，而且每个只能用一次。');
      return;
    }
    try {
      const value = Function(`"use strict"; return (${normalized})`)() as number;
      if (Number.isFinite(value) && Math.abs(value - 24) < 0.000001) {
        setStatus('correct');
        setRating(Math.max(1, 6 - attemptNumber));
        setMessage('正好 24，漂亮！');
      } else {
        setStatus('wrong');
        setMessage(`结果是 ${Number.isFinite(value) ? Number(value.toFixed(3)) : '无效'}，再试试。`);
      }
    } catch {
      setStatus('wrong');
      setMessage('这个算式还不完整，再检查一下括号。');
    }
  }

  function appendExpression(value: string) {
    setAnswer((current) => `${current}${value}`);
    setStatus('idle');
    setRating(null);
  }

  return (
    <div className="twentyfour-game">
      <div className="puzzle-level-row">
        <span>题目难度</span>
        <div className="difficulty-picker puzzle-level-picker" role="group" aria-label="选择 24 点难度">
          {puzzleLevelKeys.map((levelKey) => (
            <button type="button" key={levelKey} aria-pressed={level === levelKey} onClick={() => selectLevel(levelKey)}>{puzzleLevels[levelKey].label}</button>
          ))}
        </div>
        <small>{puzzlePool.length} 题</small>
      </div>
      <div className="number-row" aria-label={`数字 ${puzzle.numbers.join('、')}`}>
        {puzzle.numbers.map((number, index) => (
          <button type="button" key={`${number}-${index}`} onClick={() => appendExpression(String(number))} aria-label={`使用数字 ${number}`}>{number}</button>
        ))}
      </div>
      <label className="expression-label" htmlFor="expression">1000 题分级题库 · 点击数字牌和运算符拼出算式</label>
      <input
        id="expression"
        className="expression-input"
        value={answer}
        onChange={(event) => { setAnswer(event.target.value); setStatus('idle'); setRating(null); }}
        onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer(); }}
        placeholder="点上面的数字开始"
        autoComplete="off"
        inputMode="text"
      />
      <div className="operator-pad" aria-label="可点击的运算符">
        {expressionKeys.map((key) => (
          <button type="button" key={key.value} onClick={() => appendExpression(key.value)} aria-label={key.label}>{key.value}</button>
        ))}
        <button type="button" className="operator-delete" onClick={() => { setAnswer((current) => current.slice(0, -1)); setStatus('idle'); setRating(null); }} aria-label="删除最后一个字符">⌫</button>
        <button type="button" className="operator-clear" onClick={() => { setAnswer(''); setStatus('idle'); setRating(null); }}>清空</button>
      </div>
      <p className={`answer-message is-${status}`} aria-live="polite">{message}</p>
      {rating !== null && <StarRating value={rating} label={`${puzzleLevels[level].label}评分`} />}
      {status === 'wrong' && <button className="text-button" type="button" onClick={() => setMessage(`参考答案：${puzzle.solution}`)}>查看答案</button>}
      <div className="game-actions">
        <button className="secondary-action" type="button" onClick={newPuzzle}>换一题</button>
        <button className="primary-action" type="button" onClick={checkAnswer}>检查答案</button>
      </div>
    </div>
  );
}

type ReactionPhase = 'idle' | 'waiting' | 'go' | 'racing' | 'won' | 'early';
const hurdleRaceLength = 31;
const hurdleSteps = new Set([5, 8, 11, 14, 17, 20, 23, 26, 29]);
const waterSteps = new Set([9, 18, 27]);
const raceObstacleCount = hurdleSteps.size + waterSteps.size;
const hurdleStepDuration = 560;
const hurdleJumpDuration = 760;
const hurdleJumpPeak = 122;

function hurdleJumpHeight(startedAt: number) {
  const progress = (performance.now() - startedAt) / hurdleJumpDuration;
  if (progress <= 0 || progress >= 1) return 0;
  return 4 * hurdleJumpPeak * progress * (1 - progress);
}

function ReactionGame() {
  const [phase, setPhase] = useState<ReactionPhase>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [bestStep, setBestStep] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [opponentStep, setOpponentStep] = useState(0);
  const [opponentJumping, setOpponentJumping] = useState(false);
  const [opponentSlowTicks, setOpponentSlowTicks] = useState(0);
  const [opponentSlowReason, setOpponentSlowReason] = useState<'hurdle' | 'water' | null>(null);
  const [opponentMistakes, setOpponentMistakes] = useState(0);
  const [hurdleHits, setHurdleHits] = useState(0);
  const [waterHits, setWaterHits] = useState(0);
  const [slowTicks, setSlowTicks] = useState(0);
  const [slowReason, setSlowReason] = useState<'hurdle' | 'water' | null>(null);
  const signalTimer = useRef<number | null>(null);
  const jumpTimer = useRef<number | null>(null);
  const opponentJumpTimer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const stepRef = useRef(0);
  const opponentStepRef = useRef(0);
  const opponentTurnRef = useRef(0);
  const slowTicksRef = useRef(0);
  const opponentSlowTicksRef = useRef(0);
  const jumpActive = useRef(false);
  const jumpStartedAt = useRef(0);

  useEffect(() => {
    if (phase !== 'racing') return;
    const raceTimer = window.setInterval(() => {
      const currentStep = stepRef.current;
      const hitsHurdle = hurdleSteps.has(currentStep);
      const hitsWater = waterSteps.has(currentStep);
      const needsJump = hitsHurdle || hitsWater;
      const requiredHeight = hitsWater ? 32 : 46;
      const actualHeight = jumpActive.current ? hurdleJumpHeight(jumpStartedAt.current) : 0;
      const currentOpponentStep = opponentStepRef.current;
      if (currentOpponentStep < hurdleRaceLength) {
        const currentOpponentTurn = opponentTurnRef.current;
        opponentTurnRef.current += 1;
        if (opponentSlowTicksRef.current > 0) {
          const nextOpponentSlowTicks = opponentSlowTicksRef.current - 1;
          opponentSlowTicksRef.current = nextOpponentSlowTicks;
          setOpponentSlowTicks(nextOpponentSlowTicks);
          if (nextOpponentSlowTicks === 0) setOpponentSlowReason(null);
        } else {
          const opponentStride = currentOpponentTurn % 8 === 3 ? 2 : currentOpponentTurn % 8 === 6 ? 0 : 1;
          const nextOpponentStep = Math.min(hurdleRaceLength, currentOpponentStep + opponentStride);
          const crossedSteps = Array.from(
            { length: Math.max(0, nextOpponentStep - currentOpponentStep) },
            (_, index) => currentOpponentStep + index + 1,
          );
          const crossesWater = crossedSteps.some((raceStep) => waterSteps.has(raceStep));
          const crossesHurdle = crossedSteps.some((raceStep) => hurdleSteps.has(raceStep));
          const mistakeReason = crossesWater && Math.random() < .3
            ? 'water'
            : crossesHurdle && Math.random() < .22
              ? 'hurdle'
              : null;

          if (mistakeReason) {
            const penalty = mistakeReason === 'water' ? 3 : 2;
            opponentSlowTicksRef.current = penalty;
            setOpponentSlowTicks(penalty);
            setOpponentSlowReason(mistakeReason);
            setOpponentMistakes((value) => value + 1);
            setOpponentJumping(false);
            if (opponentJumpTimer.current !== null) {
              window.clearTimeout(opponentJumpTimer.current);
              opponentJumpTimer.current = null;
            }
          } else if (crossesHurdle || crossesWater) {
            setOpponentJumping(true);
            if (opponentJumpTimer.current !== null) window.clearTimeout(opponentJumpTimer.current);
            opponentJumpTimer.current = window.setTimeout(() => {
              setOpponentJumping(false);
              opponentJumpTimer.current = null;
            }, hurdleJumpDuration);
          }
          opponentStepRef.current = nextOpponentStep;
          setOpponentStep(nextOpponentStep);
        }
      }

      if (slowTicksRef.current > 0) {
        const nextSlowTicks = slowTicksRef.current - 1;
        slowTicksRef.current = nextSlowTicks;
        setSlowTicks(nextSlowTicks);
        if (nextSlowTicks === 0) setSlowReason(null);
        return;
      }

      if (hitsWater && actualHeight < requiredHeight) {
        slowTicksRef.current = 3;
        setSlowTicks(3);
        setSlowReason('water');
        setWaterHits((value) => value + 1);
      } else if (hitsHurdle && actualHeight < requiredHeight) {
        slowTicksRef.current = 2;
        setSlowTicks(2);
        setSlowReason('hurdle');
        setHurdleHits((value) => value + 1);
      } else if (needsJump) {
        setCleared((value) => value + 1);
      }
      if (currentStep >= hurdleRaceLength) {
        setBestStep(hurdleRaceLength);
        setPhase('won');
        return;
      }

      const next = currentStep + 1;
      stepRef.current = next;
      setStep(next);
    }, hurdleStepDuration);
    return () => window.clearInterval(raceTimer);
  }, [phase]);

  useEffect(() => () => {
    if (signalTimer.current !== null) window.clearTimeout(signalTimer.current);
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    if (opponentJumpTimer.current !== null) window.clearTimeout(opponentJumpTimer.current);
  }, []);

  function start() {
    if (signalTimer.current !== null) window.clearTimeout(signalTimer.current);
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    if (opponentJumpTimer.current !== null) window.clearTimeout(opponentJumpTimer.current);
    signalTimer.current = null;
    jumpTimer.current = null;
    opponentJumpTimer.current = null;
    stepRef.current = 0;
    opponentStepRef.current = 0;
    opponentTurnRef.current = 0;
    slowTicksRef.current = 0;
    opponentSlowTicksRef.current = 0;
    jumpActive.current = false;
    jumpStartedAt.current = 0;
    setPhase('waiting');
    setResult(null);
    setStep(0);
    setCleared(0);
    setJumping(false);
    setOpponentStep(0);
    setOpponentJumping(false);
    setOpponentSlowTicks(0);
    setOpponentSlowReason(null);
    setOpponentMistakes(0);
    setHurdleHits(0);
    setWaterHits(0);
    setSlowTicks(0);
    setSlowReason(null);
    signalTimer.current = window.setTimeout(() => {
      setPhase('go');
      startedAt.current = performance.now();
      signalTimer.current = null;
    }, 1400 + Math.random() * 2800);
  }

  function jump() {
    if (jumpActive.current) return;
    jumpActive.current = true;
    jumpStartedAt.current = performance.now();
    setJumping(true);
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    jumpTimer.current = window.setTimeout(() => {
      jumpActive.current = false;
      setJumping(false);
      jumpTimer.current = null;
    }, hurdleJumpDuration);
  }

  function press() {
    if (phase === 'waiting') {
      if (signalTimer.current !== null) window.clearTimeout(signalTimer.current);
      signalTimer.current = null;
      setPhase('early');
      return;
    }
    if (phase === 'go') {
      const milliseconds = Math.round(performance.now() - startedAt.current);
      if (milliseconds < 100) {
        setPhase('early');
        return;
      }
      setResult(milliseconds);
      setBest((current) => current === null ? milliseconds : Math.min(current, milliseconds));
      stepRef.current = 0;
      opponentStepRef.current = 0;
      opponentTurnRef.current = 0;
      slowTicksRef.current = 0;
      opponentSlowTicksRef.current = 0;
      setStep(0);
      setOpponentStep(0);
      setOpponentSlowTicks(0);
      setOpponentSlowReason(null);
      setOpponentMistakes(0);
      setSlowTicks(0);
      setSlowReason(null);
      setPhase('racing');
      return;
    }
    if (phase === 'racing') {
      jump();
      return;
    }
    start();
  }

  const copy = phase === 'racing' ? null : {
    idle: ['🏁', '准备起跑', '点击进入起跑器'],
    waiting: ['🏃', '各就位…', '等待发令，现在点击就是抢跑'],
    go: ['🔫', '起跑！', '点击冲出去'],
    won: ['🏆', opponentStep >= hurdleRaceLength ? '对手先到，你也完成！' : '领先冲线！', `${result} ms 起跑 · 越过 ${raceObstacleCount} 个障碍 · 点击再跑`],
    early: ['✋', '抢跑了', '等发令后再点击 · 点此重来'],
  }[phase];

  const progress = step / hurdleRaceLength;
  const opponentLead = Math.max(-1.25, Math.min(1.25, opponentStep - step));
  const opponentLeft = 120 + opponentLead * 58;
  const raceHint = slowTicks > 0
    ? `${slowReason === 'water' ? '入水' : '撞栏'}减速 ${slowTicks} 拍`
    : opponentSlowTicks > 0
      ? `对手${opponentSlowReason === 'water' ? '入水' : '撞栏'}减速 ${opponentSlowTicks} 拍`
      : '点击 · 跳过障碍';
  const finishRating = result !== null && result <= 220 ? 5 : result !== null && result <= 300 ? 4 : 3;
  const rating = phase === 'won'
    ? Math.max(1, finishRating - Math.min(2, hurdleHits + waterHits))
    : progress >= .75 ? 4 : progress >= .5 ? 3 : progress >= .25 ? 2 : 1;

  return (
    <div className="reaction-game">
      <div className="reaction-meta">
        <span>最佳起跑 <strong>{best === null ? '—' : `${best} ms`}</strong></span>
        <span>障碍 <strong>{cleared}/{raceObstacleCount}</strong></span>
        <span>撞栏 <strong>{hurdleHits}</strong></span>
        <span>入水 <strong>{waterHits}</strong></span>
        <span>对手 <strong>{opponentStep}/{hurdleRaceLength}</strong></span>
        <span>对手失误 <strong>{opponentMistakes}</strong></span>
        <span>最远 <strong>{bestStep}/{hurdleRaceLength}</strong></span>
      </div>
      <button
        type="button"
        className={`reaction-pad phase-${phase}`}
        onPointerDown={press}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            press();
          }
        }}
        aria-label={phase === 'racing' ? '点击跳过栏架' : '点击进行起跑挑战'}
      >
        <span className="race-scenery" aria-hidden="true">
          <span className="race-sun" />
          <span className="race-cloud cloud-one" />
          <span className="race-cloud cloud-two" />
          <span className="race-grandstand" />
          <span className="race-track" />
          <span className="hurdle-course" style={{ transform: `translateX(${112 - step * 92}px)` }}>
            <span className="race-start-line" />
            {Array.from({ length: hurdleRaceLength + 1 }).flatMap((_, index) => hurdleSteps.has(index) ? [
              <span className="race-hurdle race-hurdle-opponent" style={{ left: `${index * 92}px` }} key={`opponent-${index}`} />,
              <span className="race-hurdle" style={{ left: `${index * 92}px` }} key={`player-${index}`} />,
            ] : [])}
            {Array.from({ length: hurdleRaceLength + 1 }).flatMap((_, index) => waterSteps.has(index) ? [
              <span className="race-water race-water-opponent" style={{ left: `${index * 92}px` }} key={`opponent-water-${index}`} />,
              <span className="race-water" style={{ left: `${index * 92}px` }} key={`player-water-${index}`} />,
            ] : [])}
            <span className="race-finish-line" style={{ left: `${hurdleRaceLength * 92}px` }}>FINISH</span>
          </span>
          <span
            className={`race-opponent ${phase === 'racing' && opponentStep < hurdleRaceLength ? 'is-running' : ''} ${opponentJumping ? 'is-jumping' : ''} ${opponentSlowTicks > 0 ? 'is-slowed' : ''} ${opponentStep >= hurdleRaceLength ? 'is-finished' : ''}`}
            style={{ left: `${opponentLeft}px` }}
          ><i>对手</i>🏃‍♀️</span>
          <span className={`race-opponent-splash ${opponentSlowReason === 'water' ? 'is-visible' : ''}`} style={{ left: `${opponentLeft}px` }}>💦</span>
          <span className={`race-runner ${jumping ? 'is-jumping' : ''} ${slowTicks > 0 ? 'is-slowed' : ''}`}>🏃</span>
          <span className={`race-splash ${slowReason === 'water' ? 'is-visible' : ''}`}>💦</span>
        </span>
        {phase === 'racing' ? (
          <span className={`race-hud ${slowTicks > 0 ? 'is-slowed' : ''} ${slowReason === 'water' ? 'is-water' : ''}`}><strong>{result} ms · 你 {step} / 对手 {opponentStep}</strong><small>{raceHint}</small><i style={{ width: `${Math.min(100, progress * 100)}%` }} /></span>
        ) : copy ? (
          <span className="reaction-copy">
            <span className="reaction-icon">{copy[0]}</span>
            <strong>{copy[1]}</strong>
            <small>{copy[2]}</small>
          </span>
        ) : null}
      </button>
      <p className="reaction-instruction">你和对手都会失误；撞栏减速两拍，入水减速三拍，冲线后停下。</p>
      {phase === 'won' && <StarRating value={rating} label="跨栏评分" />}
    </div>
  );
}

type FlashReactionPhase = 'idle' | 'waiting' | 'go' | 'result' | 'early';

function FlashReactionGame() {
  const [phase, setPhase] = useState<FlashReactionPhase>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const signalAt = useRef(0);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function start() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setPhase('waiting');
    setResult(null);
    timer.current = window.setTimeout(() => {
      setPhase('go');
      signalAt.current = performance.now();
      timer.current = null;
    }, 1400 + Math.random() * 2800);
  }

  function press() {
    if (phase === 'waiting') {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
      setPhase('early');
      return;
    }

    if (phase === 'go') {
      const milliseconds = Math.round(performance.now() - signalAt.current);
      if (milliseconds < 100) {
        setPhase('early');
        return;
      }
      setResult(milliseconds);
      setBest((current) => current === null ? milliseconds : Math.min(current, milliseconds));
      setPhase('result');
      return;
    }

    start();
  }

  const copy = {
    idle: ['⚡', '准备反应', '点击开始，等待闪电信号'],
    waiting: ['👀', '集中注意…', '等“现在点击”出现，提前点击算抢跑'],
    go: ['⚡', '现在点击！', '快！'],
    result: ['🏁', `${result} 毫秒`, '点击再挑战一次'],
    early: ['✋', '抢跑了', '等信号出现后再点击 · 点此重来'],
  }[phase];

  const rating = result === null ? 1 : result <= 180 ? 5 : result <= 220 ? 4 : result <= 280 ? 3 : result <= 350 ? 2 : 1;

  return (
    <div className="reaction-game">
      <div className="reaction-meta">
        <span>最佳反应 <strong>{best === null ? '—' : `${best} ms`}</strong></span>
        <span>100 ms 以下按抢跑处理</span>
      </div>
      <button
        type="button"
        className={`reaction-pad phase-${phase}`}
        onPointerDown={press}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            press();
          }
        }}
        aria-label={phase === 'waiting' ? '等待闪电信号' : phase === 'go' ? '信号已出现，立即点击' : '开始闪电反应挑战'}
      >
        <span className="race-scenery" aria-hidden="true">
          <span className="race-sun" />
          <span className="race-cloud cloud-one" />
          <span className="race-cloud cloud-two" />
          <span className="race-grandstand" />
          <span className="race-track"><span className="race-start-line" /></span>
          <span className="race-runner">🏃</span>
        </span>
        <span className="reaction-copy">
          <span className="reaction-icon">{copy[0]}</span>
          <strong>{copy[1]}</strong>
          <small>{copy[2]}</small>
        </span>
      </button>
      <p className="reaction-instruction">等待信号出现后立刻点击；提前点击会判定抢跑。</p>
      {phase === 'result' && result !== null && <StarRating value={rating} label="反应评分" />}
    </div>
  );
}

type MemoryCard = { id: number; symbol: string; matched: boolean };
const memorySymbols = ['🍓', '🚀', '🎧', '🌙', '🎯', '🦊', '🌈', '🐳', '⚽️', '🍉', '🐸', '🎸'];
const memoryPairOptions = [4, 6, 8, 12] as const;
type MemoryPairCount = (typeof memoryPairOptions)[number];

function MemoryGame() {
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [selectedPairs, setSelectedPairs] = useState<MemoryPairCount>(12);
  const [playedPairs, setPlayedPairs] = useState<MemoryPairCount>(12);

  function start() {
    const cards = memorySymbols.slice(0, selectedPairs).flatMap((symbol, pair) => [
      { id: pair * 2, symbol, matched: false },
      { id: pair * 2 + 1, symbol, matched: false },
    ]);
    setPlayedPairs(selectedPairs);
    setDeck(shuffle(cards));
    setFlipped([]);
    setMoves(0);
  }

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped;
    const timeout = window.setTimeout(() => {
      if (deck[first]?.symbol === deck[second]?.symbol) {
        setDeck((cards) => cards.map((card, index) => index === first || index === second ? { ...card, matched: true } : card));
      }
      setFlipped([]);
    }, 620);
    return () => window.clearTimeout(timeout);
  }, [deck, flipped]);

  function flip(index: number) {
    if (flipped.length >= 2 || flipped.includes(index) || deck[index]?.matched) return;
    setFlipped((cards) => [...cards, index]);
    if (flipped.length === 1) setMoves((value) => value + 1);
  }

  const complete = deck.length > 0 && deck.every((card) => card.matched);
  const visiblePairCount = deck.length > 0 ? playedPairs : selectedPairs;
  const memoryRating = moves <= playedPairs ? 5 : moves <= Math.ceil(playedPairs * 1.35) ? 4 : moves <= Math.ceil(playedPairs * 1.85) ? 3 : moves <= Math.ceil(playedPairs * 2.5) ? 2 : 1;

  return (
    <div className="memory-game">
      <div className="game-stats"><span>牌数 <strong>{visiblePairCount * 2}</strong></span><span>步数 <strong>{moves}</strong></span><span>配对 <strong>{deck.filter((card) => card.matched).length / 2}/{visiblePairCount}</strong></span></div>
      <div className={`memory-board cards-${playedPairs * 2}`}>
        {deck.map((card, index) => {
          const visible = card.matched || flipped.includes(index);
          return (
            <button type="button" className={`memory-card ${visible ? 'is-visible' : ''}`} key={card.id} onClick={() => flip(index)} aria-label={visible ? card.symbol : '未翻开的卡片'}>
              <span className="card-back">P</span><span className="card-face">{card.symbol}</span>
            </button>
          );
        })}
      </div>
      {(deck.length === 0 || complete) && (
        <div className="game-callout">
          <strong>{complete ? `${moves} 步完成！` : '考考你的记忆'}</strong>
          <span>{complete ? `${playedPairs * 2} 张卡片全部配对成功。` : `选择牌数：${selectedPairs * 2} 张。`}</span>
          {complete && <StarRating value={memoryRating} />}
          <div className="difficulty-picker card-count-picker" role="group" aria-label="选择记忆翻牌数量">
            {memoryPairOptions.map((pairCount) => (
              <button type="button" key={pairCount} aria-pressed={selectedPairs === pairCount} onClick={() => setSelectedPairs(pairCount)}>{pairCount * 2} 张</button>
            ))}
          </div>
          <button type="button" onClick={start}>{complete ? '再玩一局' : '开始游戏'}</button>
        </div>
      )}
    </div>
  );
}

type OrderSize = 4 | 5 | 6;
const orderSizes: OrderSize[] = [4, 5, 6];
const orderRatings: Record<OrderSize, [number, number, number, number]> = {
  4: [6, 9, 13, 18],
  5: [10, 15, 21, 28],
  6: [16, 23, 32, 42],
};

function OrderGame() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [bestBySize, setBestBySize] = useState<Record<OrderSize, number | null>>({ 4: null, 5: null, 6: null });
  const [wrong, setWrong] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<OrderSize>(4);
  const [playedSize, setPlayedSize] = useState<OrderSize>(4);
  const startedAt = useRef(0);
  const totalNumbers = playedSize * playedSize;
  const ratingLevels = orderRatings[playedSize];
  const currentBest = bestBySize[playedSize];

  function start() {
    const count = selectedSize * selectedSize;
    setPlayedSize(selectedSize);
    setNumbers(shuffle(Array.from({ length: count }, (_, index) => index + 1)));
    setNext(1);
    setResult(null);
    setWrong(null);
    setPlaying(true);
    startedAt.current = performance.now();
  }

  function choose(number: number) {
    if (!playing) return;
    if (number !== next) {
      setWrong(number);
      window.setTimeout(() => setWrong(null), 260);
      return;
    }
    if (number === totalNumbers) {
      const seconds = Number(((performance.now() - startedAt.current) / 1000).toFixed(2));
      setResult(seconds);
      setBestBySize((current) => {
        const previous = current[playedSize];
        return { ...current, [playedSize]: previous === null ? seconds : Math.min(previous, seconds) };
      });
      setNext(totalNumbers + 1);
      setPlaying(false);
      return;
    }
    setNext((value) => value + 1);
  }

  return (
    <div className="order-game">
      <div className="game-stats"><span>规格 <strong>{playedSize}×{playedSize}</strong></span><span>下一个 <strong>{playing ? next : '—'}</strong></span><span>最佳 <strong>{currentBest === null ? '—' : `${currentBest}s`}</strong></span></div>
      <div className={`order-board size-${playedSize}`}>
        {numbers.map((number) => (
          <button type="button" className={`number-tone-${(number - 1) % 8} ${number < next ? 'is-done' : ''} ${wrong === number ? 'is-wrong' : ''}`} key={number} onClick={() => choose(number)}>{number}</button>
        ))}
      </div>
      {!playing && (
        <div className="game-callout">
          <strong>{result === null ? `从 1 点到 ${selectedSize * selectedSize}` : `用时 ${result} 秒`}</strong>
          <span>{result === null ? '选择网格，按数字顺序快速点击。' : `${playedSize}×${playedSize} 顺序全部正确！`}</span>
          {result !== null && <StarRating label={`${playedSize}×${playedSize} 评分`} value={result <= ratingLevels[0] ? 5 : result <= ratingLevels[1] ? 4 : result <= ratingLevels[2] ? 3 : result <= ratingLevels[3] ? 2 : 1} />}
          <div className="difficulty-picker" role="group" aria-label="选择数字追踪网格">
            {orderSizes.map((size) => (
              <button type="button" key={size} aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)}>{size}×{size}</button>
            ))}
          </div>
          <button type="button" onClick={start}>{result === null ? '开始游戏' : '再玩一局'}</button>
        </div>
      )}
    </div>
  );
}

const colors = [
  { key: 'red', name: '红色', hex: '#e94e4e' },
  { key: 'blue', name: '蓝色', hex: '#3575df' },
  { key: 'green', name: '绿色', hex: '#1a9b62' },
  { key: 'purple', name: '紫色', hex: '#8251c9' },
  { key: 'black', name: '黑色', hex: '#171b18' },
  { key: 'white', name: '白色', hex: '#ffffff' },
  { key: 'orange', name: '橙色', hex: '#e87827' },
  { key: 'pink', name: '粉色', hex: '#e85591' },
];

const colorCountOptions = [4, 6, 8] as const;
type ColorCount = (typeof colorCountOptions)[number];

function makeColorQuestion(colorCount: ColorCount) {
  const palette = colors.slice(0, colorCount);
  const wordIndex = Math.floor(Math.random() * palette.length);
  let inkIndex = Math.floor(Math.random() * palette.length);
  if (inkIndex === wordIndex) inkIndex = (inkIndex + 1) % palette.length;
  return { word: palette[wordIndex], ink: palette[inkIndex] };
}

function ColorGame() {
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => makeColorQuestion(6));
  const [feedback, setFeedback] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [selectedColorCount, setSelectedColorCount] = useState<ColorCount>(6);
  const [playedColorCount, setPlayedColorCount] = useState<ColorCount>(6);
  const colorStartedAt = useRef(0);
  const activeColors = colors.slice(0, playedColorCount);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed(Number(((performance.now() - colorStartedAt.current) / 1000).toFixed(1)));
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  function start() {
    setRound(1);
    setScore(0);
    setPlayedColorCount(selectedColorCount);
    setQuestion(makeColorQuestion(selectedColorCount));
    setFeedback('idle');
    setElapsed(0);
    colorStartedAt.current = performance.now();
    setPlaying(true);
  }

  function answer(key: string) {
    if (!playing || feedback !== 'idle') return;
    const correct = key === question.ink.key;
    setFeedback(correct ? 'right' : 'wrong');
    if (correct) setScore((value) => value + 1);
    if (round >= 10) {
      setElapsed(Number(((performance.now() - colorStartedAt.current) / 1000).toFixed(1)));
      setPlaying(false);
      return;
    }
    window.setTimeout(() => {
      setRound((value) => value + 1);
      setQuestion(makeColorQuestion(playedColorCount));
      setFeedback('idle');
    }, 360);
  }

  return (
    <div className="color-game">
      <div className="game-stats"><span>色数 <strong>{playedColorCount}</strong></span><span>题目 <strong>{playing ? `${round}/10` : '—'}</strong></span><span>答对 <strong>{score}</strong></span><span>用时 <strong>{elapsed.toFixed(1)}s</strong></span></div>
      <p className="color-instruction">请选择下面文字<strong>真正显示的颜色</strong>，不要被文字内容骗到。</p>
      <div className={`color-word feedback-${feedback} ${question.ink.key === 'white' ? 'is-white-ink' : ''}`} style={{ color: question.ink.hex }}>{question.word.name}</div>
      <div className={`color-choices choices-${playedColorCount}`}>
        {activeColors.map((color) => <button type="button" className={`choice-${color.key}`} key={color.key} onClick={() => answer(color.key)}>{color.name}</button>)}
      </div>
      {!playing && (
        <div className="game-callout">
          <strong>{round >= 10 ? `答对 ${score} / 10` : '文字会骗人'}</strong>
          <span>{round >= 10 ? `${playedColorCount} 色模式 · 用时 ${elapsed.toFixed(1)} 秒` : `选择颜色数量：${selectedColorCount} 色。`}</span>
          {round >= 10 && <StarRating value={score === 10 ? 5 : score >= 8 ? 4 : score >= 6 ? 3 : score >= 4 ? 2 : 1} />}
          <div className="difficulty-picker" role="group" aria-label="选择颜色迷阵颜色数量">
            {colorCountOptions.map((colorCount) => (
              <button type="button" key={colorCount} aria-pressed={selectedColorCount === colorCount} onClick={() => setSelectedColorCount(colorCount)}>{colorCount} 色</button>
            ))}
          </div>
          <button type="button" onClick={start}>{round >= 10 ? '再玩一局' : '开始游戏'}</button>
        </div>
      )}
    </div>
  );
}

type TimingTarget = 3 | 4 | 5 | 6 | 7;
type TimingPhase = 'idle' | 'running' | 'result';
const timingTargets: TimingTarget[] = [3, 4, 5, 6, 7];

function TimingGame() {
  const [selectedTarget, setSelectedTarget] = useState<TimingTarget>(5);
  const [playedTarget, setPlayedTarget] = useState<TimingTarget>(5);
  const [phase, setPhase] = useState<TimingPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<number | null>(null);
  const [bestByTarget, setBestByTarget] = useState<Record<TimingTarget, number | null>>({ 3: null, 4: null, 5: null, 6: null, 7: null });
  const startedAt = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => {
      setElapsed((performance.now() - startedAt.current) / 1000);
    }, 30);
    return () => window.clearInterval(timer);
  }, [phase]);

  function selectTarget(target: TimingTarget) {
    if (phase === 'running') return;
    setSelectedTarget(target);
    setPlayedTarget(target);
    setElapsed(0);
    setError(null);
    setPhase('idle');
  }

  function start() {
    setPlayedTarget(selectedTarget);
    setElapsed(0);
    setError(null);
    startedAt.current = performance.now();
    setPhase('running');
  }

  function stop() {
    const result = (performance.now() - startedAt.current) / 1000;
    const nextError = Math.abs(result - playedTarget);
    setElapsed(result);
    setError(nextError);
    setBestByTarget((current) => ({
      ...current,
      [playedTarget]: current[playedTarget] === null ? nextError : Math.min(current[playedTarget] ?? nextError, nextError),
    }));
    setPhase('result');
  }

  const best = bestByTarget[playedTarget];
  const rating = error === null ? 1 : error <= .1 ? 5 : error <= .25 ? 4 : error <= .5 ? 3 : error <= .8 ? 2 : 1;
  const resultDirection = elapsed < playedTarget ? '早了' : elapsed > playedTarget ? '晚了' : '正好';
  const display = phase === 'idle'
    ? `${selectedTarget}.00`
    : phase === 'running'
      ? elapsed < 1 ? elapsed.toFixed(2) : '•••'
      : elapsed.toFixed(3);

  return (
    <div className="timing-game">
      <div className="game-stats">
        <span>目标 <strong>{playedTarget}s</strong></span>
        <span>按停 <strong>{phase === 'result' ? `${elapsed.toFixed(3)}s` : '—'}</strong></span>
        <span>误差 <strong>{error === null ? '—' : `${error.toFixed(3)}s`}</strong></span>
        <span>最佳 <strong>{best === null ? '—' : `${best.toFixed(3)}s`}</strong></span>
      </div>
      <div className="timing-target-row">
        <span>指定秒数</span>
        <div className="difficulty-picker timing-target-picker" role="group" aria-label="选择时间感应目标秒数">
          {timingTargets.map((target) => (
            <button type="button" key={target} disabled={phase === 'running'} aria-pressed={selectedTarget === target} onClick={() => selectTarget(target)}>{target} 秒</button>
          ))}
        </div>
      </div>
      <button type="button" className={`timing-stage phase-${phase}`} onClick={phase === 'running' ? stop : start} aria-label={phase === 'running' ? '按停计时' : `开始 ${selectedTarget} 秒时间感应挑战`}>
        <span>目标 {playedTarget}.00 秒</span>
        <strong>{display}</strong>
        <small>{phase === 'idle' ? '点击开始' : phase === 'running' ? elapsed < 1 ? '记住节奏，数字马上隐藏' : '凭感觉，再点击按停' : `${resultDirection} ${error?.toFixed(3)} 秒 · 点击再来`}</small>
      </button>
      <p className="timing-instruction">开始后只显示第 1 秒，之后隐藏计时，背景也不会提示节奏；感觉到达目标秒数时立即按停。</p>
      {phase === 'result' && <StarRating value={rating} label={`${playedTarget} 秒评分`} />}
    </div>
  );
}

type ShooterPhase = 'idle' | 'running' | 'finished';
const shooterTargets = Array.from({ length: 9 }, (_, index) => index);

function ShooterGame() {
  const [phase, setPhase] = useState<ShooterPhase>('idle');
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [remainingTargets, setRemainingTargets] = useState<Set<number>>(() => new Set(shooterTargets));
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const muzzleTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (muzzleTimer.current !== null) window.clearTimeout(muzzleTimer.current);
  }, []);

  function flashGun() {
    setMuzzleFlash(true);
    if (muzzleTimer.current !== null) window.clearTimeout(muzzleTimer.current);
    muzzleTimer.current = window.setTimeout(() => setMuzzleFlash(false), 90);
  }

  function start() {
    setHits(0);
    setShots(0);
    setCombo(0);
    setBestCombo(0);
    setRemainingTargets(new Set(shooterTargets));
    setPhase('running');
  }

  function hitTarget(target: number) {
    if (phase !== 'running' || !remainingTargets.has(target)) return;
    const isLastTarget = remainingTargets.size === 1;
    flashGun();
    setShots((value) => value + 1);
    setHits((value) => {
      const next = value + 1;
      setBestScore((best) => Math.max(best, next));
      return next;
    });
    setCombo((value) => {
      const next = value + 1;
      setBestCombo((best) => Math.max(best, next));
      return next;
    });
    setRemainingTargets((current) => {
      const next = new Set(current);
      next.delete(target);
      return next;
    });
    if (isLastTarget) setPhase('finished');
  }

  function miss() {
    if (phase !== 'running') return;
    flashGun();
    setShots((value) => value + 1);
    setCombo(0);
  }

  const accuracy = shots === 0 ? 0 : Math.round((hits / shots) * 100);
  const targetDuration = Math.max(.82, 4 - hits * .35);
  const speedMultiplier = 4 / targetDuration;
  const completed = phase === 'finished' && remainingTargets.size === 0;
  const rating = completed ? accuracy >= 90 ? 5 : accuracy >= 70 ? 4 : 3 : hits >= 7 ? 3 : hits >= 4 ? 2 : 1;
  const rangeStyle = { '--target-speed': `${targetDuration}s` } as CSSProperties;

  return (
    <div className="shooter-game">
      <div className="game-stats shooter-stats">
        <span>剩余 <strong>{remainingTargets.size}</strong></span>
        <span>命中 <strong>{hits}</strong></span>
        <span>命中率 <strong>{accuracy}%</strong></span>
        <span>连击 <strong>{combo}</strong></span>
        <span>速度 <strong>×{speedMultiplier.toFixed(1)}</strong></span>
      </div>
      <div className={`shooter-range is-${phase}`} style={rangeStyle} onClick={miss} role="group" aria-label="九个旋转靶射击区">
        <div className="shooter-grid">
          {shooterTargets.filter((target) => remainingTargets.has(target)).map((target) => (
            <div className="shooter-cell" style={{ '--target-angle': `${target * 40}deg` } as CSSProperties} key={target}>
              <button
                type="button"
                className="shooter-target"
                disabled={phase !== 'running'}
                onClick={(event) => { event.stopPropagation(); hitTarget(target); }}
                aria-label={`射击第 ${target + 1} 个靶子`}
              >
                <span className="shooter-target-disc"><i>{target + 1}</i></span>
              </button>
            </div>
          ))}
        </div>
        <span className={`shooter-gun ${muzzleFlash ? 'is-firing' : ''}`} aria-hidden="true">🔫</span>
        {phase !== 'running' && (
          <div className="shooter-callout">
            <strong>{phase === 'finished' ? completed ? '全部命中！' : `击中 ${hits} / 9` : '圆环九靶'}</strong>
            <small>{phase === 'finished' ? `命中率 ${accuracy}% · 最高连击 ${bestCombo} · 最佳 ${bestScore}/9` : '不限时间：9 个靶子在同一个圆环中旋转；打中一个少一个，并且转得更快。'}</small>
            {phase === 'finished' && <StarRating value={rating} label="神枪手评分" />}
            <button type="button" onClick={(event) => { event.stopPropagation(); start(); }}>{phase === 'finished' ? '再来一局' : '开始射击'}</button>
          </div>
        )}
      </div>
      <p className="shooter-instruction">点击靶子开枪，击中的靶子会消失；点击空白算脱靶。</p>
    </div>
  );
}

type MazeSize = 11 | 13 | 19;
type MazeWall = 'top' | 'right' | 'bottom' | 'left';
type MazeDirectionKey = 'up' | 'right' | 'down' | 'left';
type MazeCell = Record<MazeWall, boolean>;

const mazeSizes: Array<{ size: MazeSize; label: string }> = [
  { size: 11, label: '轻松' },
  { size: 13, label: '标准' },
  { size: 19, label: '挑战' },
];

const mazeDirections: Array<{
  key: MazeDirectionKey;
  dx: number;
  dy: number;
  wall: MazeWall;
  opposite: MazeWall;
}> = [
  { key: 'up', dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
  { key: 'right', dx: 1, dy: 0, wall: 'right', opposite: 'left' },
  { key: 'down', dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
  { key: 'left', dx: -1, dy: 0, wall: 'left', opposite: 'right' },
];

function createMaze(size: MazeSize, seed: number) {
  let randomState = seed >>> 0;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  };
  const cells: MazeCell[] = Array.from({ length: size * size }, () => ({ top: true, right: true, bottom: true, left: true }));
  const visited = new Set([0]);
  const stack = [0];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const x = current % size;
    const y = Math.floor(current / size);
    const available = mazeDirections.filter((direction) => {
      const nextX = x + direction.dx;
      const nextY = y + direction.dy;
      return nextX >= 0 && nextX < size && nextY >= 0 && nextY < size && !visited.has(nextY * size + nextX);
    });

    if (available.length === 0) {
      stack.pop();
      continue;
    }

    const direction = available[Math.floor(random() * available.length)];
    const next = (y + direction.dy) * size + x + direction.dx;
    cells[current][direction.wall] = false;
    cells[next][direction.opposite] = false;
    visited.add(next);
    stack.push(next);
  }

  const closedPassages: Array<{ current: number; next: number; wall: MazeWall; opposite: MazeWall }> = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const current = y * size + x;
      if (x < size - 1 && cells[current].right) closedPassages.push({ current, next: current + 1, wall: 'right', opposite: 'left' });
      if (y < size - 1 && cells[current].bottom) closedPassages.push({ current, next: current + size, wall: 'bottom', opposite: 'top' });
    }
  }

  for (let index = closedPassages.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [closedPassages[index], closedPassages[swapIndex]] = [closedPassages[swapIndex], closedPassages[index]];
  }

  const loopCount = Math.max(10, Math.floor(size * size * .12));
  closedPassages.slice(0, loopCount).forEach((passage) => {
    cells[passage.current][passage.wall] = false;
    cells[passage.next][passage.opposite] = false;
  });

  const openPassage = (current: number, next: number, wall: MazeWall, opposite: MazeWall) => {
    cells[current][wall] = false;
    cells[next][opposite] = false;
  };
  const goal = cells.length - 1;
  openPassage(0, 1, 'right', 'left');
  openPassage(0, size, 'bottom', 'top');
  openPassage(1, size + 1, 'bottom', 'top');
  openPassage(size, size + 1, 'right', 'left');
  openPassage(goal, goal - 1, 'left', 'right');
  openPassage(goal, goal - size, 'top', 'bottom');
  openPassage(goal - 1, goal - size - 1, 'top', 'bottom');
  openPassage(goal - size, goal - size - 1, 'left', 'right');

  return cells;
}

function mazeShortestPath(cells: MazeCell[], size: MazeSize) {
  const target = cells.length - 1;
  const queue: Array<{ index: number; distance: number }> = [{ index: 0, distance: 0 }];
  const visited = new Set([0]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    if (current.index === target) return current.distance;
    const x = current.index % size;
    const y = Math.floor(current.index / size);
    mazeDirections.forEach((direction) => {
      if (cells[current.index][direction.wall]) return;
      const next = (y + direction.dy) * size + x + direction.dx;
      if (next < 0 || next >= cells.length || visited.has(next)) return;
      visited.add(next);
      queue.push({ index: next, distance: current.distance + 1 });
    });
  }

  return target;
}

const firstMaze = createMaze(11, 11121);

function MazeGame() {
  const [selectedSize, setSelectedSize] = useState<MazeSize>(11);
  const [playedSize, setPlayedSize] = useState<MazeSize>(11);
  const [maze, setMaze] = useState<MazeCell[]>(firstMaze);
  const [player, setPlayer] = useState(0);
  const [steps, setSteps] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [optimalSteps, setOptimalSteps] = useState(() => mazeShortestPath(firstMaze, 11));
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [bestBySize, setBestBySize] = useState<Record<MazeSize, number | null>>({ 11: null, 13: null, 19: null });
  const startedAt = useRef(0);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const blockedTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed(Number(((performance.now() - startedAt.current) / 1000).toFixed(1)));
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => () => {
    if (blockedTimer.current !== null) window.clearTimeout(blockedTimer.current);
  }, []);

  function showBlocked() {
    setBlocked(true);
    if (blockedTimer.current !== null) window.clearTimeout(blockedTimer.current);
    blockedTimer.current = window.setTimeout(() => {
      setBlocked(false);
      blockedTimer.current = null;
    }, 180);
  }

  function selectMazeSize(size: MazeSize) {
    setSelectedSize(size);
    setPlayedSize(size);
    const preview = createMaze(size, size * 1001);
    setMaze(preview);
    setPlayer(0);
    setSteps(0);
    setVisited([0]);
    setOptimalSteps(mazeShortestPath(preview, size));
    setElapsed(0);
    setFinished(false);
  }

  function start() {
    const nextMaze = createMaze(selectedSize, Date.now() ^ Math.floor(Math.random() * 100000));
    setPlayedSize(selectedSize);
    setMaze(nextMaze);
    setPlayer(0);
    setSteps(0);
    setVisited([0]);
    setOptimalSteps(mazeShortestPath(nextMaze, selectedSize));
    setElapsed(0);
    setFinished(false);
    setBlocked(false);
    startedAt.current = performance.now();
    setPlaying(true);
    window.requestAnimationFrame(() => boardRef.current?.focus());
  }

  function move(directionKey: MazeDirectionKey) {
    if (!playing) return;
    const direction = mazeDirections.find((item) => item.key === directionKey);
    if (!direction || maze[player][direction.wall]) {
      showBlocked();
      return;
    }
    const x = player % playedSize;
    const y = Math.floor(player / playedSize);
    const next = (y + direction.dy) * playedSize + x + direction.dx;
    const nextSteps = steps + 1;
    setPlayer(next);
    setSteps(nextSteps);
    setVisited((current) => current.includes(next) ? current : [...current, next]);

    if (next === maze.length - 1) {
      const result = Number(((performance.now() - startedAt.current) / 1000).toFixed(1));
      setElapsed(result);
      setPlaying(false);
      setFinished(true);
      setBestBySize((current) => ({
        ...current,
        [playedSize]: current[playedSize] === null ? result : Math.min(current[playedSize] ?? result, result),
      }));
    }
  }

  function handleMazeKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const keyMap: Record<string, MazeDirectionKey | undefined> = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowLeft: 'left', a: 'left', A: 'left',
    };
    const direction = keyMap[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  }

  const efficiency = steps / Math.max(1, optimalSteps);
  const rating = efficiency <= 1.05 ? 5 : efficiency <= 1.25 ? 4 : efficiency <= 1.6 ? 3 : efficiency <= 2.1 ? 2 : 1;
  const best = bestBySize[playedSize];

  return (
    <div className="maze-game">
      <div className="game-stats">
        <span>规格 <strong>{playedSize * playedSize} 格</strong></span>
        <span>路线 <strong>多条</strong></span>
        <span>步数 <strong>{steps}</strong></span>
        <span>最短 <strong>{optimalSteps}</strong></span>
        <span>用时 <strong>{elapsed.toFixed(1)}s</strong></span>
        <span>最佳 <strong>{best === null ? '—' : `${best.toFixed(1)}s`}</strong></span>
      </div>
      <div className="maze-frame">
        <div
          ref={boardRef}
          className={`maze-board size-${playedSize} ${blocked ? 'is-blocked' : ''}`}
          style={{ gridTemplateColumns: `repeat(${playedSize}, 1fr)` }}
          tabIndex={0}
          onKeyDown={handleMazeKey}
          aria-label={`${playedSize}乘${playedSize}迷宫，使用方向键移动小马到终点`}
        >
          {maze.map((cell, index) => {
            const x = index % playedSize;
            const y = Math.floor(index / playedSize);
            const wallClasses = [
              cell.top ? 'wall-top' : '',
              cell.left ? 'wall-left' : '',
              x === playedSize - 1 && cell.right ? 'wall-right' : '',
              y === playedSize - 1 && cell.bottom ? 'wall-bottom' : '',
            ].filter(Boolean).join(' ');
            return (
              <span className={`maze-cell ${wallClasses} ${visited.includes(index) ? 'is-visited' : ''} ${index === 0 ? 'is-start' : ''} ${index === maze.length - 1 ? 'is-goal' : ''}`} key={index}>
                {index === player ? <b aria-label="小马当前位置">🐴</b> : index === maze.length - 1 ? <i aria-label="终点">🏁</i> : null}
              </span>
            );
          })}
        </div>
      </div>
      <div className="maze-controls" role="group" aria-label="迷宫移动方向">
        <button type="button" className="maze-up" onClick={() => move('up')} aria-label="向上移动">↑</button>
        <button type="button" className="maze-left" onClick={() => move('left')} aria-label="向左移动">←</button>
        <span aria-hidden="true">🧭</span>
        <button type="button" className="maze-right" onClick={() => move('right')} aria-label="向右移动">→</button>
        <button type="button" className="maze-down" onClick={() => move('down')} aria-label="向下移动">↓</button>
      </div>
      <p className="maze-instruction">迷宫中有多条路线和环路；使用方向键、WASD 或屏幕按钮，把小马带到右下角。</p>
      {!playing && (
        <div className="game-callout maze-callout">
          <strong>{finished ? '找到出口！' : '准备探路'}</strong>
          <span>{finished ? `${steps} 步 · 最短路线 ${optimalSteps} 步 · 用时 ${elapsed.toFixed(1)} 秒` : `选择迷宫大小：${selectedSize * selectedSize} 格（${selectedSize}×${selectedSize}），每张都有多条路线`}</span>
          {finished && <StarRating value={rating} label="迷宫评分" />}
          <div className="difficulty-picker" role="group" aria-label="选择迷宫大小">
            {mazeSizes.map((option) => (
              <button type="button" key={option.size} aria-pressed={selectedSize === option.size} onClick={() => selectMazeSize(option.size)}>{option.label} {option.size * option.size} 格</button>
            ))}
          </div>
          <button type="button" onClick={start}>{finished ? '换一张迷宫' : '开始游戏'}</button>
        </div>
      )}
    </div>
  );
}

type RhythmMapId = 'night' | 'sunset' | 'space';
type RhythmMap = {
  id: RhythmMapId;
  name: string;
  length: number;
  obstacleSteps: Set<number>;
  pillarHeights: Map<number, number>;
};

const rhythmMaps: RhythmMap[] = [
  {
    id: 'night',
    name: '夜城',
    length: 40,
    obstacleSteps: new Set([4, 7, 11, 15, 19, 23, 28, 32, 36, 39]),
    pillarHeights: new Map([[9, 66], [13, 84], [17, 70], [21, 92], [26, 76], [30, 88], [34, 72], [38, 96]]),
  },
  {
    id: 'sunset',
    name: '落日',
    length: 44,
    obstacleSteps: new Set([5, 8, 12, 16, 20, 24, 29, 33, 37, 41, 43]),
    pillarHeights: new Map([[10, 74], [14, 92], [18, 68], [22, 86], [27, 98], [31, 72], [35, 90], [39, 78]]),
  },
  {
    id: 'space',
    name: '太空',
    length: 48,
    obstacleSteps: new Set([5, 9, 13, 17, 21, 25, 30, 34, 38, 42, 46]),
    pillarHeights: new Map([[7, 70], [11, 88], [15, 76], [19, 96], [23, 72], [28, 90], [32, 68], [36, 98], [40, 80], [44, 92], [47, 74]]),
  },
];
type RhythmStatus = 'idle' | 'playing' | 'lost' | 'won';
const rhythmBeatDuration = 560;
const rhythmJumpDuration = 720;
const rhythmJumpPeak = 160;

function rhythmJumpHeight(startedAt: number) {
  const progress = (performance.now() - startedAt) / rhythmJumpDuration;
  if (progress <= 0 || progress >= 1) return 0;
  return 4 * rhythmJumpPeak * progress * (1 - progress);
}

function playRhythmTone(context: AudioContext | null, frequency: number) {
  if (!context || context.state === 'closed') return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  gain.gain.setValueAtTime(0.055, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.1);
}

function RhythmJumpGame() {
  const [mapId, setMapId] = useState<RhythmMapId>('night');
  const [status, setStatus] = useState<RhythmStatus>('idle');
  const [step, setStep] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [bestByMap, setBestByMap] = useState<Record<RhythmMapId, number>>({ night: 0, sunset: 0, space: 0 });
  const [jumping, setJumping] = useState(false);
  const stepRef = useRef(0);
  const jumpActive = useRef(false);
  const jumpStartedAt = useRef(0);
  const jumpTimer = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const currentMap = rhythmMaps.find((map) => map.id === mapId) ?? rhythmMaps[0];
  const challengeCount = currentMap.obstacleSteps.size + currentMap.pillarHeights.size;
  const best = bestByMap[mapId];

  useEffect(() => {
    if (status !== 'playing') return;
    const beatTimer = window.setInterval(() => {
      const currentStep = stepRef.current;
      const obstacle = currentMap.obstacleSteps.has(currentStep);
      const pillarHeight = currentMap.pillarHeights.get(currentStep);
      const requiredHeight = obstacle ? 38 : pillarHeight ? pillarHeight - 29 + 14 : 0;
      const actualHeight = jumpActive.current ? rhythmJumpHeight(jumpStartedAt.current) : 0;

      if (requiredHeight > 0 && actualHeight < requiredHeight) {
        setBestByMap((current) => ({ ...current, [mapId]: Math.max(current[mapId], stepRef.current) }));
        setStatus('lost');
        return;
      }

      if (requiredHeight > 0) setCleared((value) => value + 1);
      if (currentStep >= currentMap.length) {
        setBestByMap((current) => ({ ...current, [mapId]: currentMap.length }));
        setStatus('won');
        return;
      }

      const next = currentStep + 1;
      const nextObstacle = currentMap.obstacleSteps.has(next);
      const nextPillar = currentMap.pillarHeights.has(next);
      playRhythmTone(audioContext.current, nextObstacle ? 420 : nextPillar ? 350 : 220);
      stepRef.current = next;
      setStep(next);
    }, rhythmBeatDuration);
    return () => window.clearInterval(beatTimer);
  }, [currentMap, mapId, status]);

  useEffect(() => () => {
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    const context = audioContext.current;
    audioContext.current = null;
    if (context && context.state !== 'closed') void context.close();
  }, []);

  function start() {
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    if (!audioContext.current || audioContext.current.state === 'closed') audioContext.current = new AudioContext();
    if (audioContext.current.state === 'suspended') void audioContext.current.resume();
    playRhythmTone(audioContext.current, 330);
    stepRef.current = 0;
    jumpActive.current = false;
    jumpStartedAt.current = 0;
    setStep(0);
    setCleared(0);
    setJumping(false);
    setStatus('playing');
  }

  function selectMap(nextMapId: RhythmMapId) {
    if (status === 'playing' || nextMapId === mapId) return;
    setMapId(nextMapId);
    stepRef.current = 0;
    setStep(0);
    setCleared(0);
    setJumping(false);
    setStatus('idle');
  }

  function jump() {
    if (status !== 'playing') {
      start();
      return;
    }
    if (jumpActive.current) return;
    jumpActive.current = true;
    jumpStartedAt.current = performance.now();
    setJumping(true);
    playRhythmTone(audioContext.current, 520);
    jumpTimer.current = window.setTimeout(() => {
      jumpActive.current = false;
      setJumping(false);
      jumpTimer.current = null;
    }, rhythmJumpDuration);
  }

  const progress = step / currentMap.length;
  const rating = status === 'won' ? 5 : progress >= .75 ? 4 : progress >= .5 ? 3 : progress >= .25 ? 2 : 1;
  const resultTitle = status === 'won' ? `${currentMap.name}地图通关！` : status === 'lost' ? '撞到障碍了' : '跟上节拍';
  const resultHint = status === 'won' ? '漂亮！点击再挑战一次' : status === 'lost' ? `走到第 ${step} / ${currentMap.length} 拍 · 点击重来` : '点一下，跳过尖刺或跳上柱子';

  return (
    <div className="rhythm-game">
      <div className="game-stats">
        <span>地图 <strong>{currentMap.name}</strong></span>
        <span>进度 <strong>{step}/{currentMap.length}</strong></span>
        <span>通过 <strong>{cleared}/{challengeCount}</strong></span>
        <span>最佳 <strong>{best}/{currentMap.length}</strong></span>
      </div>
      <div className="rhythm-map-row">
        <span>选择地图</span>
        <div className="difficulty-picker rhythm-map-picker" role="group" aria-label="选择节拍跳跳地图">
          {rhythmMaps.map((map) => (
            <button type="button" key={map.id} disabled={status === 'playing'} aria-pressed={mapId === map.id} onClick={() => selectMap(map.id)}>{map.name}</button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={`rhythm-stage map-${mapId} status-${status}`}
        onPointerDown={jump}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            jump();
          }
        }}
        aria-label={status === 'playing' ? '点击跳跃' : '点击开始节拍跳跳'}
      >
        <span className="rhythm-moon" aria-hidden="true" />
        <span className="rhythm-city" aria-hidden="true" />
        <span className="rhythm-track" aria-hidden="true" style={{ transform: `translateX(${92 - step * 54}px)` }}>
          {Array.from({ length: currentMap.length + 3 }, (_, index) => {
            const pillarHeight = currentMap.pillarHeights.get(index);
            return (
              <span className={`rhythm-platform platform-tone-${index % 4} ${pillarHeight ? 'is-pillar' : ''}`} style={{ left: `${index * 54}px`, height: pillarHeight ? `${pillarHeight}px` : undefined }} key={index}>
                {currentMap.obstacleSteps.has(index) && <span className="rhythm-spike">▲</span>}
              </span>
            );
          })}
        </span>
        <span className={`rhythm-blob ${jumping ? 'is-jumping' : ''} ${status === 'lost' ? 'is-crashed' : ''}`} aria-hidden="true" />
        {status !== 'playing' && (
          <span className="rhythm-callout">
            <strong>{resultTitle}</strong>
            <small>{resultHint}</small>
            <span>{status === 'idle' ? '点击开始' : '再玩一局'}</span>
          </span>
        )}
      </button>
      <p className="rhythm-instruction">♪ 每拍自动前进，点一下即可跳过尖刺或跳上柱子。</p>
      {(status === 'lost' || status === 'won') && <StarRating value={rating} label="节拍评分" />}
    </div>
  );
}

function ActiveGame({ id }: { id: GameId }) {
  if (id === 'whack') return <WhackGame />;
  if (id === 'twentyfour') return <TwentyFourGame />;
  if (id === 'reaction') return <FlashReactionGame />;
  if (id === 'memory') return <MemoryGame />;
  if (id === 'order') return <OrderGame />;
  if (id === 'color') return <ColorGame />;
  if (id === 'maze') return <MazeGame />;
  if (id === 'timing') return <TimingGame />;
  return <ShooterGame />;
}

export default function Home() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveGame(null);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const active = games.find((game) => game.id === activeGame);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="主导航">
        <button className="brand" type="button" onClick={() => setActiveGame(null)} aria-label="返回游戏大厅">
          <span className="brand-mark">P</span><span>Pony 游戏厅</span>
        </button>
        <span className="nav-note">每天玩一会，脑力更灵活</span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">MINI GAME CLUB</span>
          <h1>今天想挑战<br /><em>哪一种能力？</em></h1>
          <p>九款轻量小游戏，练手速、算力、记忆、专注、空间、时间感、反应与瞄准。无需登录，点开就玩。</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit-center">PLAY</span><span className="orbit-dot dot-one">24</span><span className="orbit-dot dot-two">🏁</span><span className="orbit-dot dot-three">🐹</span>
        </div>
      </section>

      <section className="game-section" aria-labelledby="game-list-title">
        <div className="section-heading">
          <div><span className="eyebrow">9 GAMES</span><h2 id="game-list-title">选择一个游戏</h2></div>
          <p>每局不到一分钟，随时刷新你的最好成绩。</p>
        </div>
        <div className="game-grid">
          {games.map((game, index) => (
            <button type="button" className={`game-card tone-${game.color}`} key={game.id} onClick={() => setActiveGame(game.id)}>
              <span className="card-number">0{index + 1}</span><span className="game-icon">{game.icon}</span>
              <span className="game-copy"><span className="game-tag">{game.tag}</span><strong>{game.title}</strong><small>{game.description}</small></span>
              <span className="play-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>

      <footer><span>Pony 游戏厅</span><span>保持好奇，继续挑战。</span></footer>

      {activeGame !== null && active && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveGame(null); }}>
          <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header className="modal-header">
              <div><span className="eyebrow">NOW PLAYING</span><h2 id="modal-title">{active.title}</h2></div>
              <button className="close-button" type="button" onClick={() => setActiveGame(null)} aria-label="关闭游戏">×</button>
            </header>
            <ActiveGame id={activeGame} />
          </section>
        </div>
      )}
    </main>
  );
}
