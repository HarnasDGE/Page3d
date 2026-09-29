import { useEffect } from 'react';
import { input, resetInput } from './input';

type KeyAction = keyof typeof input.keys;

const KEY_MAP: Record<string, KeyAction> = {
  ArrowUp: 'forward',
  KeyW: 'forward',
  ArrowDown: 'backward',
  KeyS: 'backward',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
};

export function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

export function useKeyboardControls() {
  useEffect(() => {
    const handle = (pressed: boolean) => (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const action = KEY_MAP[event.code];
      if (!action) return;
      event.preventDefault();
      input.keys[action] = pressed;
    };

    const onKeyDown = handle(true);
    const onKeyUp = handle(false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetInput);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetInput);
    };
  }, []);
}
