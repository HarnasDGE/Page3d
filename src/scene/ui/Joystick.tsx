import { useRef, useState, type PointerEvent } from 'react';
import { clearMoveTarget, input } from '@/scene/controls/input';

const RADIUS = 56;

/** Virtual joystick for touch devices (bottom-right corner). */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);

  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = base.current?.getBoundingClientRect();
    if (!rect) return;
    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > RADIUS) {
      dx = (dx / distance) * RADIUS;
      dy = (dy / distance) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    input.joystick.x = dx / RADIUS;
    input.joystick.y = -dy / RADIUS;
  };

  const release = () => {
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    input.joystick.x = 0;
    input.joystick.y = 0;
  };

  return (
    <div
      ref={base}
      role="presentation"
      className="pointer-events-auto fixed right-6 bottom-6 hidden size-36 touch-none rounded-full border border-neon-cyan/40 bg-night/40 shadow-[0_0_24px_rgba(0,240,255,0.25)] backdrop-blur-sm select-none pointer-coarse:block"
      onPointerDown={(event) => {
        if (pointerId.current !== null) return;
        pointerId.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        clearMoveTarget();
        update(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerId === pointerId.current) update(event);
      }}
      onPointerUp={(event) => {
        if (event.pointerId === pointerId.current) release();
      }}
      onPointerCancel={release}
    >
      <div
        className="absolute top-1/2 left-1/2 size-14 rounded-full border border-neon-cyan bg-neon-cyan/25 shadow-[0_0_16px_rgba(0,240,255,0.6)]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
