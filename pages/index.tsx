import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { TransitionsType } from "../shared/types/types";

const PageWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
`;

const SequencerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: var(--colour-black);
  color: var(--colour-white);
  font-family: "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
`;

const Cell = styled.div<{ $isCurrentStep: boolean; $isInputTarget: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 3.75rem;
  width: 2.75rem;
  background-color: ${({ $isCurrentStep }) =>
    $isCurrentStep ? "var(--colour-white)" : "grey"};
  color: ${({ $isCurrentStep }) =>
    $isCurrentStep ? "var(--colour-black)" : "var(--colour-white)"};
  box-shadow: ${({ $isCurrentStep, $isInputTarget }) =>
    $isCurrentStep || $isInputTarget
      ? "0 0 0.75rem rgba(255, 255, 255, 0.18)"
      : "none"};
`;

const blink = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const CellCharacter = styled.div`
  width: 100%;
  text-align: center;
  font-size: 50px;
  font-weight: 400;
  font-family: var(--font-default);
`;

const BeatLine = styled.div<{ $isActive: boolean; $isCursor: boolean }>`
  width: 100%;
  height: 0.25rem;
  margin-top: 0.35rem;
  background-color: ${({ $isActive, $isCursor }) =>
    $isActive || $isCursor ? "var(--colour-white)" : "transparent"};
  opacity: ${({ $isActive, $isCursor }) =>
    $isActive ? 1 : $isCursor ? 0.7 : 0.3};
  animation: ${({ $isCursor, $isActive }) =>
    $isCursor && !$isActive
      ? css`
          ${blink} 0.8s step-start infinite;
        `
      : "none"};
  box-shadow: ${({ $isActive, $isCursor }) =>
    $isActive || $isCursor ? "0 0 0.75rem rgba(255, 255, 255, 0.7)" : "none"};
`;

type Props = {
  pageTransitionVariants: TransitionsType;
};

const ROWS = 2;
const COLS = 12;
const TOTAL_STEPS = ROWS * COLS;
const BPM = 160;

const SUPPORTED_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789.!?";
const SAMPLE_KEYS = ["hihat", "kick", "snare", "perc1", "perc2"] as const;

type SampleKey = (typeof SAMPLE_KEYS)[number];

const getSampleKeyForChar = (char: string): SampleKey | undefined => {
  const index = SUPPORTED_CHARS.indexOf(char);
  if (index === -1) return undefined;

  const mappedIndex = index % SAMPLE_KEYS.length;
  return SAMPLE_KEYS[mappedIndex];
};

const Page = (props: Props) => {
  const { pageTransitionVariants } = props;

  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [hasAudioStarted, setHasAudioStarted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const playersRef = useRef<Partial<Record<SampleKey, Tone.Player>>>({});
  const ambientPlayerRef = useRef<Tone.Player | null>(null);
  const currentStepRef = useRef<number>(-1);
  const typedCharsRef = useRef<string[]>([]);
  const hasAudioStartedRef = useRef<boolean>(false);

  // keep ref in sync with state
  useEffect(() => {
    typedCharsRef.current = typedChars;
  }, [typedChars]);

  // initialise players once on client
  useEffect(() => {
    const players: Record<SampleKey, Tone.Player> = {
      hihat: new Tone.Player("/audio/hat-1.wav").toDestination(),
      kick: new Tone.Player("/audio/kick-2.wav").toDestination(),
      snare: new Tone.Player("/audio/snare-1.wav").toDestination(),
      perc1: new Tone.Player("/audio/snare-2.wav").toDestination(),
      perc2: new Tone.Player("/audio/snare-3.wav").toDestination(),
    };

    // turn drums/percs down a bit
    Object.values(players).forEach((player) => {
      player.volume.value = -9;
    });

    playersRef.current = players;

    ambientPlayerRef.current = new Tone.Player({
      url: "/audio/ambient-1.mp3",
      loop: true,
    }).toDestination();

    // turn ambient up a little relative to the drums
    if (ambientPlayerRef.current) {
      ambientPlayerRef.current.volume.value = 0;
    }

    return () => {
      Object.values(playersRef.current).forEach((player) => {
        player.dispose();
      });

      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.dispose();
      }
    };
  }, []);

  const ensureAudioStarted = useCallback(async () => {
    if (!hasAudioStarted) {
      await Tone.start();
      Tone.getTransport().bpm.value = BPM;
      // Ensure all buffers (drums + ambient) are loaded before we start playback
      await Tone.loaded();
      setHasAudioStarted(true);
      hasAudioStartedRef.current = true;
    }
  }, [hasAudioStarted]);
  // visual + audio loop: always running for the playhead, audio only once Tone has started
  useEffect(() => {
    const intervalMs = 60_000 / BPM / 4; // 16th-note subdivision

    const id = window.setInterval(() => {
      currentStepRef.current =
        (currentStepRef.current + 1 + TOTAL_STEPS) % TOTAL_STEPS;
      const step = currentStepRef.current;
      setCurrentStep(step);

      const chars = typedCharsRef.current;
      if (!chars.length) {
        return;
      }

      const charForStep = chars[step];
      if (!charForStep) {
        return;
      }

      const sampleKey = getSampleKeyForChar(charForStep);
      const player = sampleKey ? playersRef.current[sampleKey] : undefined;

      if (player && hasAudioStartedRef.current) {
        player.start();
      }
    }, intervalMs);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;

      // allow escape to clear everything
      if (key === "Escape") {
        event.preventDefault();
        setTypedChars([]);
        typedCharsRef.current = [];
        return;
      }

      if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        setTypedChars((prev) => {
          const next = prev.slice(0, Math.max(0, prev.length - 1));
          typedCharsRef.current = next;
          return next;
        });
        return;
      }

      // only handle printable single characters
      if (
        key.length === 1 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();

        setTypedChars((prev) => {
          if (prev.length >= TOTAL_STEPS) {
            return prev;
          }

          const nextChar = key.toLowerCase();
          const next = [...prev, nextChar];
          typedCharsRef.current = next;
          return next;
        });

        // on first keypress, start audio + ambient
        if (!hasAudioStartedRef.current) {
          await ensureAudioStarted();

          if (
            ambientPlayerRef.current &&
            ambientPlayerRef.current.state !== "started"
          ) {
            ambientPlayerRef.current.start();
          }
        }
      }
    },
    [ensureAudioStarted]
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const cells = Array.from({ length: TOTAL_STEPS }, (_, index) => {
    const char = typedChars[index] || "";

    return {
      index,
      char,
    };
  });

  return (
    <PageWrapper
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <SequencerWrapper
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Typing music sequencer"
      >
        <Inner>
          <Grid>
            {cells.map((cell) => {
              const isCurrentStep = cell.index === currentStep;
              const inputTargetIndex =
                typedChars.length === 0
                  ? 0
                  : Math.min(typedChars.length, TOTAL_STEPS - 1);
              const isInputTarget = cell.index === inputTargetIndex;

              return (
                <Cell
                  key={cell.index}
                  $isCurrentStep={isCurrentStep}
                  $isInputTarget={isInputTarget}
                >
                  <CellCharacter className="type-p">{cell.char}</CellCharacter>
                  <BeatLine
                    $isActive={isCurrentStep}
                    $isCursor={isInputTarget}
                  />
                </Cell>
              );
            })}
          </Grid>
        </Inner>
      </SequencerWrapper>
    </PageWrapper>
  );
};

export default Page;
