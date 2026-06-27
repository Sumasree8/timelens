/**
 * Central icon registry — Phosphor icons (rendered DUOTONE app-wide via
 * IconContext in main.jsx) keyed by the product's semantic keys.
 */
import {
  Code, PencilSimple, BookOpen, GraduationCap, Users, Palette, Kanban, Sparkle, Circle,
  Target, Lightning, Minus, Moon, CloudRain, Shuffle,
  House, Buildings, Coffee, Books, Tree, MapPin,
  SpeakerSimpleX, Headphones, Waves, MusicNotes, SpeakerHigh,
  BatteryLow, BatteryMedium, BatteryFull,
  Hourglass, Plant, Crosshair, Leaf,
  Heartbeat, Clock, Planet, Flask, Note, Compass, Microscope, Lightbulb,
  Gauge, Lock,
} from '@phosphor-icons/react';
import TurtleIcon from '../components/icons/TurtleIcon';

export const ACTIVITY_ICON = {
  coding: Code, writing: PencilSimple, reading: BookOpen, studying: GraduationCap,
  meeting: Users, design: Palette, admin: Kanban, creative: Sparkle, other: Circle,
};

export const STATE_ICON = {
  focused: Target, energized: Lightning, neutral: Minus, tired: Moon, anxious: CloudRain, distracted: Shuffle,
};

export const ENV_ICON = {
  home: House, office: Buildings, cafe: Coffee, library: Books, outdoors: Tree, other: MapPin,
};

export const MUSIC_ICON = {
  silence: SpeakerSimpleX, lofi: Headphones, ambient: Waves, classical: MusicNotes, energetic: SpeakerHigh, other: MusicNotes,
};

export const ENERGY_ICON = { low: BatteryLow, medium: BatteryMedium, high: BatteryFull };

export const DIRECTION_ICON = { compressed: Waves, calibrated: Crosshair, expanded: Hourglass };

export const PHASE_ICON = { settling: Plant, focus: Crosshair, flow: Waves, recovery: Leaf };

export const DISCOVERY_ICON = {
  activity: Target, environment: MapPin, music: Headphones, mood: Heartbeat,
  energy: BatteryFull, 'time of day': Clock, sleep: Moon, 'time warp': Planet,
};

export const COACH_ICON = {
  target: Target, pattern: Microscope, note: Note, compass: Compass, flask: Flask,
};

/** Resolve a Flow Type archetype (by its key) to an icon. */
export function archetypeIcon(key = '') {
  if (key.includes('melter')) return Waves;
  if (key.includes('clockwork')) return Gauge;
  if (key.includes('marathoner')) return TurtleIcon;
  if (key.includes('drifter')) return Moon;
  if (key.includes('unranked')) return Lock;
  return Sparkle;
}

export { Lightbulb };
