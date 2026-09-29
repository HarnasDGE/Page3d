import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { MathUtils, type Group, type MeshBasicMaterial } from 'three';
import { Sparks } from '@/scene/effects/Sparks';
import { FONTS } from '@/scene/fonts';
import { requestInteraction } from '@/scene/interaction/interactables';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { createRound, isCorrect } from '@/scene/minigames/wiring/puzzle';
import { SymbolShape } from '@/scene/minigames/wiring/SymbolShape';
import { WiringPanel } from '@/scene/minigames/wiring/WiringPanel';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { onTap } from '@/scene/world/events';
import { ELECTRICAL_BOX } from '../propLayout';
import { usePropsStore } from '../propsStore';

const BOX_ID = 'power-box';
const WIDTH = 1;
const HEIGHT = 1.3;
const DEPTH = 0.3;
const DOOR_OPEN_ANGLE = -1.9;
const CLOSE_AFTER_SUCCESS_MS = 1400;

/** Broken power box: sparks until the player fixes it in the wiring minigame. */
export function ElectricalBox() {
  const isFixed = usePropsStore((state) => state.isPowerFixed);
  const isPlaying = usePropsStore((state) => state.minigame === 'wiring');
  const [round, setRound] = useState(createRound);
  const [isSolved, setSolved] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const door = useRef<Group>(null);
  const led = useRef<MeshBasicMaterial>(null);

  useInteractable({
    id: BOX_ID,
    label: 'Fix the power box',
    spot: ELECTRICAL_BOX.spot,
    radius: 1.5,
    activate: () => {
      const props = usePropsStore.getState();
      props.dropHeld();
      setRound(createRound());
      props.setMinigame('wiring');
    },
    isEnabled: () => {
      const { isPowerFixed, minigame } = usePropsStore.getState();
      return !isPowerFixed && minigame === null;
    },
  });

  const pick = useCallback(
    (index: number) => {
      const props = usePropsStore.getState();
      if (props.minigame !== 'wiring' || isSolved) return;
      const toasts = useToastStore.getState();

      if (isCorrect(round, index)) {
        setSolved(true);
        props.setPowerFixed();
        toasts.push('Power restored. About Street lights up again.');
        toasts.unlock('electrician');
        window.setTimeout(() => usePropsStore.getState().setMinigame(null), CLOSE_AFTER_SUCCESS_MS);
        return;
      }
      props.shock();
      setBurstKey((key) => key + 1);
      toasts.push('Zap! Wrong wire.', 'danger');
      setRound(createRound());
    },
    [round, isSolved],
  );

  // Number keys pick a cable while the box is open.
  useEffect(() => {
    if (!isPlaying) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const index = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(event.code);
      if (index >= 0) pick(index);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, pick]);

  useFrame(({ clock }, delta) => {
    if (door.current) {
      const target = isPlaying ? DOOR_OPEN_ANGLE : 0;
      door.current.rotation.y = MathUtils.damp(door.current.rotation.y, target, 8, delta);
    }
    if (led.current) {
      const blink = isFixed || Math.sin(clock.elapsedTime * 8) > 0;
      led.current.color.copy(neon(isFixed ? '#1cff9e' : '#ff2b4a', blink ? 3 : 0.2));
    }
  });

  return (
    <group
      position={[ELECTRICAL_BOX.x, ELECTRICAL_BOX.y, ELECTRICAL_BOX.z]}
      rotation-y={ELECTRICAL_BOX.rotationY}
    >
      {/* Housing */}
      <mesh position-z={-DEPTH / 2}>
        <boxGeometry args={[WIDTH, HEIGHT, 0.04]} />
        <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * WIDTH) / 2, 0, -0.02]}>
          <boxGeometry args={[0.04, HEIGHT, DEPTH]} />
          <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, (side * HEIGHT) / 2, -0.02]}>
          <boxGeometry args={[WIDTH, 0.04, DEPTH]} />
          <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
      <mesh position-z={-DEPTH / 2 + 0.03}>
        <planeGeometry args={[WIDTH - 0.08, HEIGHT - 0.08]} />
        <meshStandardMaterial color="#1a1f28" />
      </mesh>

      <group position-z={-DEPTH / 2 + 0.05}>
        <WiringPanel round={round} isSolved={isSolved} onPick={pick} />
      </group>

      {/* Door hinged on the left edge */}
      <group ref={door} position={[-WIDTH / 2, 0, DEPTH / 2 - 0.02]}>
        <group
          position-x={WIDTH / 2}
          onClick={onTap(() => requestInteraction(BOX_ID, useGameStore.getState().nearbyId))}
        >
          <mesh>
            <boxGeometry args={[WIDTH, HEIGHT, 0.03]} />
            <meshStandardMaterial color="#4a5363" metalness={0.7} roughness={0.45} />
          </mesh>
          <group position={[0, 0.25, 0.02]}>
            <SymbolShape symbol="triangle" size={0.42} color="#ffd400" />
          </group>
          <Text font={FONTS.display} position={[0, -0.15, 0.02]} fontSize={0.09} anchorX="center" anchorY="middle">
            DANGER
            <meshBasicMaterial color="#ffd400" />
          </Text>
          <Text font={FONTS.display} position={[0, -0.3, 0.02]} fontSize={0.055} anchorX="center" anchorY="middle">
            HIGH VOLTAGE
            <meshBasicMaterial color="#ffd400" />
          </Text>
          <mesh position={[0.36, 0.5, 0.02]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial ref={led} toneMapped={false} />
          </mesh>
        </group>
      </group>

      <group position={[0.3, -HEIGHT / 2 + 0.1, DEPTH / 2]}>
        <Sparks active={!isFixed} burstKey={burstKey} />
      </group>
      {!isFixed && <pointLight position={[0, 0, 0.8]} color="#9ff7ff" intensity={4} distance={4} />}
    </group>
  );
}
