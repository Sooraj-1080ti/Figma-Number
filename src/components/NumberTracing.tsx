import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  RotateCcw,
  CheckCircle,
  Sparkles,
  Heart,
  Star,
  Zap,
  Flower,
  Music,
  Smile,
  Sun,
} from "lucide-react";
import { motion } from "motion/react";

interface NumberTracingProps {
  number: string;
  onComplete: (number: string) => void;
  isCompleted: boolean;
}

const SAMPLE_SIZE = 100; // performance: sample to 100x100 grid
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// Number-specific configurations
const NUMBER_CONFIG = {
  '0': { baseFreq: 440, color: "#ef4444", icon: Star, waveType: "triangle" as OscillatorType },
  '1': { baseFreq: 466, color: "#f97316", icon: Heart, waveType: "sine" as OscillatorType },
  '2': { baseFreq: 494, color: "#eab308", icon: Sun, waveType: "square" as OscillatorType },
  '3': { baseFreq: 523, color: "#22c55e", icon: Flower, waveType: "triangle" as OscillatorType },
  '4': { baseFreq: 554, color: "#06b6d4", icon: Sparkles, waveType: "sine" as OscillatorType },
  '5': { baseFreq: 587, color: "#3b82f6", icon: Music, waveType: "square" as OscillatorType },
  '6': { baseFreq: 622, color: "#8b5cf6", icon: Smile, waveType: "triangle" as OscillatorType },
  '7': { baseFreq: 659, color: "#ec4899", icon: Zap, waveType: "sine" as OscillatorType },
  '8': { baseFreq: 698, color: "#f43f5e", icon: Star, waveType: "square" as OscillatorType },
  '9': { baseFreq: 740, color: "#84cc16", icon: Heart, waveType: "triangle" as OscillatorType },
  '10': { baseFreq: 784, color: "#10b981", icon: Sun, waveType: "sine" as OscillatorType }
};

export function NumberTracing({
  number,
  onComplete,
  isCompleted,
}: NumberTracingProps) {
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(
    null,
  ); // Offscreen canvas for user strokes only
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingCtxRef = useRef<CanvasRenderingContext2D | null>(
    null,
  );
  const drawingRef = useRef(false);

  const [showCelebration, setShowCelebration] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canFinish, setCanFinish] = useState(false);
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      icon: React.ComponentType;
    }>
  >([]);
  const sparkleIdRef = useRef(0);

  // Create audio context for drawing sounds
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get letter-specific configuration
  const numberConfig =
    NUMBER_CONFIG[number as keyof typeof NUMBER_CONFIG] ||
    NUMBER_CONFIG['0'];

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  const playDrawingSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Use letter-specific frequency and wave type (higher pitched, soothing sounds)
    const variation = (Math.random() - 0.5) * 30; // Smaller variation for consistency
    oscillator.frequency.setValueAtTime(
      numberConfig.baseFreq + variation,
      ctx.currentTime,
    );
    oscillator.type = numberConfig.waveType;

    // Very gentle, soothing sound with soft attack and release
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.03,
      ctx.currentTime + 0.02,
    ); // Soft attack
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.2,
    ); // Gentle release

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }, [numberConfig]);

  const playSuccessSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Number-specific success melody - soothing and celebratory
    const baseFreq = numberConfig.baseFreq;
    const melody = [
      baseFreq * 0.8, // Lower start for gentleness
      baseFreq,
      baseFreq * 1.25,
      baseFreq * 1.5,
    ]; // Ascending melody for success

    melody.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(
        freq,
        ctx.currentTime + index * 0.2,
      );
      oscillator.type = "sine"; // Use sine wave for smoother, more soothing success sound

      // Gentle volume envelope for soothing effect
      gainNode.gain.setValueAtTime(
        0,
        ctx.currentTime + index * 0.2,
      );
      gainNode.gain.linearRampToValueAtTime(
        0.06,
        ctx.currentTime + index * 0.2 + 0.05,
      ); // Soft attack
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + index * 0.2 + 0.5,
      ); // Gentle decay

      oscillator.start(ctx.currentTime + index * 0.2);
      oscillator.stop(ctx.currentTime + index * 0.2 + 0.5);
    });
  }, [numberConfig]);

  const createNumberSpecificSparkle = useCallback(
    (x: number, y: number) => {
      const canvas = userCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const sparkle = {
        id: sparkleIdRef.current++,
        x: x + rect.left,
        y: y + rect.top,
        color: numberConfig.color,
        icon: numberConfig.icon,
      };

      setSparkles((prev: typeof sparkles) => [...prev, sparkle]);

      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles((prev: typeof sparkles) =>
          prev.filter((s) => s.id !== sparkle.id),
        );
      }, 1500);
    },
    [numberConfig],
  );

  // Draw the mask shape for the letter
  const drawMaskShape = useCallback(
    (maskCtx: CanvasRenderingContext2D, number: string) => {
      maskCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      maskCtx.fillStyle = "black";
      maskCtx.font = "bold 280px Arial";
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.fillText(
        number,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
      );
    },
    [],
  );

  const drawNumberTemplate = useCallback(
    (ctx: CanvasRenderingContext2D, number: string) => {
      ctx.save();

      // Draw dotted letter outline with letter-specific color
      ctx.strokeStyle = numberConfig.color + "80"; // Semi-transparent
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.font = "bold 280px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(
        number,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
      );

      // Draw guidelines
      ctx.setLineDash([]);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;

      // Horizontal guidelines
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.lineTo(550, 100);
      ctx.moveTo(50, 200);
      ctx.lineTo(550, 200);
      ctx.moveTo(50, 300);
      ctx.lineTo(550, 300);
      ctx.stroke();

      ctx.restore();
    },
    [numberConfig],
  );

  // Setup canvases with DPR support
  const setupCanvases = useCallback(() => {
    const user = userCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!user || !mask) return;

    // Create offscreen drawing canvas if it doesn't exist
    if (!drawingCanvasRef.current) {
      drawingCanvasRef.current =
        document.createElement("canvas");
    }
    const drawing = drawingCanvasRef.current;

    const dpr = window.devicePixelRatio || 1;

    user.width = Math.round(CANVAS_WIDTH * dpr);
    user.height = Math.round(CANVAS_HEIGHT * dpr);
    user.style.width = `${CANVAS_WIDTH}px`;
    user.style.height = `${CANVAS_HEIGHT}px`;

    mask.width = Math.round(CANVAS_WIDTH * dpr);
    mask.height = Math.round(CANVAS_HEIGHT * dpr);
    mask.style.width = `${CANVAS_WIDTH}px`;
    mask.style.height = `${CANVAS_HEIGHT}px`;

    drawing.width = Math.round(CANVAS_WIDTH * dpr);
    drawing.height = Math.round(CANVAS_HEIGHT * dpr);

    const userCtx = user.getContext("2d");
    const maskCtx = mask.getContext("2d");
    const drawingCtx = drawing.getContext("2d");
    if (!userCtx || !maskCtx || !drawingCtx) return;

    userCtx.scale(dpr, dpr);
    userCtx.lineCap = "round";
    userCtx.lineJoin = "round";
    userCtx.strokeStyle = numberConfig.color;
    userCtx.lineWidth = 30;

    drawingCtx.scale(dpr, dpr);
    drawingCtx.lineCap = "round";
    drawingCtx.lineJoin = "round";
    drawingCtx.strokeStyle = numberConfig.color;
    drawingCtx.lineWidth = 30;

    maskCtx.scale(dpr, dpr);

    ctxRef.current = userCtx;
    drawingCtxRef.current = drawingCtx;

    // Clear and set background
    userCtx.fillStyle = "#f8fafc";
    userCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw letter template on user canvas
    drawNumberTemplate(userCtx, number);

    // Draw mask shape on mask canvas
    drawMaskShape(maskCtx, number);
  }, [number, numberConfig, drawNumberTemplate, drawMaskShape]);

  useEffect(() => {
    setupCanvases();
    window.addEventListener("resize", setupCanvases);
    return () =>
      window.removeEventListener("resize", setupCanvases);
  }, [setupCanvases]);

  // Compute overlap percent between mask and user drawings
  const computeProgress = useCallback(() => {
    const mask = maskCanvasRef.current;
    const user = userCanvasRef.current;
    const drawing = drawingCanvasRef.current;
    if (!mask || !user || !drawing) return;

    const w = SAMPLE_SIZE;
    const h = SAMPLE_SIZE;
    const tmpMask = document.createElement("canvas");
    const tmpUser = document.createElement("canvas");
    tmpMask.width = w;
    tmpMask.height = h;
    tmpUser.width = w;
    tmpUser.height = h;

    const mctx = tmpMask.getContext("2d")!;
    const uctx = tmpUser.getContext("2d")!;

    mctx.drawImage(mask, 0, 0, w, h);
    uctx.drawImage(drawing, 0, 0, w, h);

    const maskData = mctx.getImageData(0, 0, w, h).data;
    const userData = uctx.getImageData(0, 0, w, h).data;

    let totalMaskPixels = 0;
    let overlappedPixels = 0;

    for (let i = 0; i < w * h; i++) {
      const maskAlpha = maskData[i * 4 + 3];

      if (maskAlpha !== undefined && maskAlpha > 40) {
        totalMaskPixels++;
        const userAlpha = userData[i * 4 + 3];
        if (userAlpha !== undefined && userAlpha > 30) overlappedPixels++;
      }
    }

    const percent =
      totalMaskPixels === 0
        ? 0
        : (overlappedPixels / totalMaskPixels) * 100;
    const roundedPercent = Math.min(100, Math.round(percent));

    setProgress(roundedPercent);

    if (roundedPercent >= 70 && !canFinish) {
      setCanFinish(true);
    }
  }, [canFinish]);

  // Pointer helpers
  const getPos = useCallback((evt: PointerEvent) => {
    const canvas = userCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const canvas = userCanvasRef.current;
    const ctx = ctxRef.current;
    const drawingCtx = drawingCtxRef.current;
    if (!canvas || !ctx || !drawingCtx) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      drawingCtx.beginPath();
      drawingCtx.moveTo(p.x, p.y);

      // Enable audio context on user interaction
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }

      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      drawingCtx.lineTo(p.x, p.y);
      drawingCtx.stroke();

      // Play drawing sound and create sparkles
      playDrawingSound();
      if (Math.random() > 0.85) {
        createNumberSpecificSparkle(p.x, p.y);
      }

      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}

      // Compute progress after finishing a stroke
      computeProgress();
      e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    getPos,
    playDrawingSound,
    createNumberSpecificSparkle,
    computeProgress,
  ]);

  const handleFinish = () => {
    setShowCelebration(true);
    playSuccessSound();
    onComplete(number);
  };

  const clearCanvas = () => {
    const user = userCanvasRef.current;
    const ctx = ctxRef.current;
    const drawingCtx = drawingCtxRef.current;
    if (!user || !ctx || !drawingCtx) return;

    // Clear user canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawingCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Redraw background and template
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawNumberTemplate(ctx, number);

    // Reset progress tracking
    setProgress(0);
    setCanFinish(false);
    setShowCelebration(false);
    setSparkles([]);
  };

  const NumberIcon = numberConfig.icon;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-4 border-white/50 shadow-xl">
        <div className="text-center mb-6">
          <motion.div
            className="flex items-center justify-center gap-3 mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <NumberIcon
                className="w-8 h-8"
                style={{ color: numberConfig.color }}
              />
            </motion.div>
            <h2
              className="text-4xl font-bold"
              style={{ color: numberConfig.color }}
            >
              Trace the Number "{number}"
            </h2>
            <motion.div
              animate={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            >
              <NumberIcon
                className="w-8 h-8"
                style={{ color: numberConfig.color }}
              />
            </motion.div>
          </motion.div>
          <p className="text-lg text-purple-600">
            Follow the dotted lines with your finger or mouse!
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 font-medium">
              Progress:
            </span>
            <span className="text-purple-700 font-medium">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-4">
            <motion.div
              className="h-4 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${numberConfig.color}, ${numberConfig.color}dd)`,
              }}
              animate={{
                boxShadow:
                  progress > 0
                    ? `0 0 15px ${numberConfig.color}80`
                    : "none",
              }}
            />
          </div>
        </div>

        <div className="relative flex justify-center mb-6">
          {/* Hidden mask canvas */}
          <canvas
            ref={maskCanvasRef}
            style={{ display: "none" }}
          />

          {/* Visible user canvas */}
          <motion.canvas
            ref={userCanvasRef}
            className="border-4 rounded-lg shadow-lg bg-slate-50 touch-none"
            style={{
              borderColor: numberConfig.color,
              touchAction: "none",
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          {/* Number-specific sparkle effects */}
          {sparkles.map((sparkle) => {
            const SparkleIcon = sparkle.icon;
            return (
              <motion.div
                key={sparkle.id}
                className="absolute pointer-events-none"
                style={{
                  left: sparkle.x - 12,
                  top: sparkle.y - 12,
                }}
                initial={{ scale: 0, rotate: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  rotate: 360,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.5 }}
              >
                <div
                  className="w-6 h-6 flex justify-center items-center"
                  style={{ color: sparkle.color }}
                >
                  <SparkleIcon />
                </div>
              </motion.div>
            );
          })}

          {showCelebration && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <motion.h3
                  className="text-3xl font-bold text-green-600 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉 Amazing Work! 🎉
                </motion.h3>
                <p className="text-lg text-green-600">
                  You completed the number "{number}"!
                </p>
                <motion.div
                  className="flex justify-center mt-4 gap-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {[...Array(5)].map((_, i) => (
                    <NumberIcon
                      key={i}
                      className="w-6 h-6"
                      style={{ color: numberConfig.color }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={clearCanvas}
            variant="outline"
            className="bg-white hover:bg-purple-50 border-2 border-purple-300 text-purple-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          {canFinish && !showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                onClick={handleFinish}
                className="text-white border-0 shadow-lg"
                style={{
                  background: `linear-gradient(to right, ${numberConfig.color}, ${numberConfig.color}dd)`,
                }}
              >
                <NumberIcon className="w-4 h-4 mr-2" />
                I'm Done! ✨
              </Button>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center">
          <motion.p
            className="text-purple-600"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💡 Tip: Take your time and follow the dotted lines
            carefully!
          </motion.p>
          {canFinish && !showCelebration && (
            <motion.p
              className="text-green-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              🌟 Great job! You can finish now or keep
              practicing!
            </motion.p>
          )}
        </div>
      </Card>
    </div>
  );
}