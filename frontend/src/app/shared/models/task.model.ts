export type TaskIcon =
  | 'endpoint'
  | 'lock'
  | 'layers'
  | 'api'
  | 'test'
  | 'pipeline'
  | 'coverage'
  | 'docs'
  | 'decision'
  | 'rocket';
export type TaskTone = 'blue' | 'green' | 'amber' | 'rose' | 'slate';
export type TaskCategory =
  | 'architecture'
  | 'testing'
  | 'security'
  | 'documentation'
  | 'delivery'
  | 'integration';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  icon: TaskIcon;
  tone: TaskTone;
  category: TaskCategory;
  isRequired: boolean;
  checklistReference: string;
  points: number;
  isCompleted: boolean;
}
