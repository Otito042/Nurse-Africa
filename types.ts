export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
}

export type TutorMode =
  | 'Tutor'
  | 'Exam'
  | 'OSCE'
  | 'NCLEX'
  | 'OET'
  | 'IELTS'
  | 'NMC_CBT'
  | 'Jobs'
  | 'Career';

export const OSCESubModes = ['Adult', 'Mental', 'Midwife', 'Pediatrics', 'Learning Disability'] as const;
export type OSCESubMode = (typeof OSCESubModes)[number];

export const NMCCBTSubModes = ['Adult', 'Mental', 'Midwife', 'Pediatrics', 'Learning Disability'] as const;
export type NMCCBTSubMode = (typeof NMCCBTSubModes)[number];
