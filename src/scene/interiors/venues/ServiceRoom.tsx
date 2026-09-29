import type { Service } from '@/data/services';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { useGameStore } from '@/scene/store/gameStore';
import { HoloPanel, PanelText } from '../components/HoloPanel';
import { Pedestal } from '../components/Pedestal';
import { ServiceHologram } from '../components/ServiceHologram';
import { EXHIBIT, WALLS } from '../roomLayout';

const LINE = 0.55;

export function ServiceRoom({ service }: { service: Service }) {
  const openPanel = useGameStore((state) => state.openPanel);
  const { accent } = service;

  useInteractable({
    id: 'exhibit',
    label: `Ask about ${service.sign}`,
    spot: { x: EXHIBIT.x, z: EXHIBIT.z + EXHIBIT.halfSize + 1.1 },
    radius: 1.4,
    activate: () => openPanel({ kind: 'contact', topic: service.title }),
  });

  return (
    <group>
      <Pedestal accent={accent}>
        <ServiceHologram icon={service.icon} accent={accent} />
      </Pedestal>

      <HoloPanel
        position={[WALLS.back.x, 3.4, WALLS.back.z]}
        width={12}
        height={4}
        accent={accent}
        title={service.title.toUpperCase()}
      >
        <PanelText size={0.38} maxWidth={11}>
          {service.summary}
        </PanelText>
        {/* Body font: Orbitron has no middle-dot glyph. */}
        <PanelText y={-1.5} size={0.42} color={accent} glow={2.2}>
          {`From ${service.priceFrom}   ·   ${service.timeline}`}
        </PanelText>
      </HoloPanel>

      <HoloPanel
        position={[WALLS.left.x, 3, WALLS.left.z]}
        rotationY={WALLS.left.rotationY}
        width={8.5}
        height={3.6}
        accent={accent}
        title="WHAT YOU GET"
      >
        {service.deliverables.map((item, i) => (
          <PanelText key={item} y={-i * LINE} size={0.36}>
            {`•  ${item}`}
          </PanelText>
        ))}
      </HoloPanel>

      <HoloPanel
        position={[WALLS.right.x, 3, WALLS.right.z]}
        rotationY={WALLS.right.rotationY}
        width={8.5}
        height={3.6}
        accent={accent}
        title="HOW IT WORKS"
      >
        {service.process.map((step, i) => (
          <group key={step} position-y={-i * LINE}>
            <PanelText font="display" size={0.3} color={accent} glow={2}>
              {String(i + 1).padStart(2, '0')}
            </PanelText>
            <PanelText x={0.8} size={0.36}>
              {step}
            </PanelText>
          </group>
        ))}
      </HoloPanel>
    </group>
  );
}
