export type TaskIcon = 'drop' | 'study' | 'pulse' | 'spark' | 'book';
export type TaskTone = 'rose' | 'peach' | 'taupe' | 'sage';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  icon: TaskIcon;
  tone: TaskTone;
  points: number;
  isCompleted: boolean;
}
