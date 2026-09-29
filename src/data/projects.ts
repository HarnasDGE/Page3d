/** Sample portfolio projects shown on the screens inside service rooms. */
export type ProjectId = 'aurora' | 'voltage' | 'pulse';

export interface Project {
  id: ProjectId;
  title: string;
  category: string;
}

export const projects: Record<ProjectId, Project> = {
  aurora: { id: 'aurora', title: 'Aurora Coffee', category: 'Landing page' },
  voltage: { id: 'voltage', title: 'Voltage Store', category: 'E-commerce' },
  pulse: { id: 'pulse', title: 'Pulse Dashboard', category: 'Web app' },
};
