/** AIタスク ダッシュボードの部品。React 不要。各関数は props を受け取り HTMLElement を返す（window.AIDash）。 */
export type Status = 'wait' | 'stop' | 'run' | 'done';
export type AgentKey = 'claude' | 'codex' | 'glm';

export interface Question { text: string; context?: string; options?: { id: string; label: string; hint?: string }[] }
export interface TaskError { message: string; code: string; detail?: string; hint?: string }
export interface Task {
  id: string; title: string; agent: AgentKey; status: Status;
  /** 確認待ち・停止が始まった時刻（ms） */ since?: number;
  updatedAt: number; createdAt?: number;
  question?: Question; error?: TaskError;
  progress?: { done: number; total: number; current: string };
  result?: { summary: string; files: string[] };
}

export interface StatusBadgeProps { status: Status; /** 4語以外に変えない */ label?: string }
export declare function StatusBadge(props: StatusBadgeProps): HTMLElement;
export interface StatusMarkProps { status: Status | 'todo'; large?: boolean }
export declare function StatusMark(props: StatusMarkProps): HTMLElement;

export interface ButtonProps {
  label: string;
  /** primary は「あなたの番」の操作だけ。既定 secondary */
  variant?: 'primary' | 'secondary' | 'quiet';
  type?: 'button' | 'submit';
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean; busy?: boolean; busyLabel?: string; block?: boolean;
  expanded?: boolean; controls?: string;
}
export declare function Button(props: ButtonProps): HTMLButtonElement;

export interface AgentTagProps { agent: AgentKey }
export declare function AgentTag(props: AgentTagProps): HTMLElement;

export interface SummaryTileProps { status: Status; count: number; pressed?: boolean; note?: string; onClick?: () => void }
export declare function SummaryTile(props: SummaryTileProps): HTMLButtonElement;

export interface FilterChipProps { label: string; count?: number; pressed?: boolean; onClick?: () => void }
export declare function FilterChip(props: FilterChipProps): HTMLButtonElement;

export interface ProgressProps { done: number; total: number }
export declare function Progress(props: ProgressProps): HTMLElement;

export interface TaskRowProps { task: Task; now?: number; expanded?: boolean; onToggle?: (id: string, via: 'title' | 'action') => void; detail?: HTMLElement | null }
export declare function TaskRow(props: TaskRowProps): HTMLLIElement;

export interface AnswerFormProps {
  id: string; agent: AgentKey; question: Question;
  draft?: { option?: string; note?: string }; error?: string | null; busy?: boolean;
  onChange?: (patch: { option?: string; note?: string }) => void; onSubmit?: () => void; onLater?: () => void;
}
export declare function AnswerForm(props: AnswerFormProps): HTMLFormElement;

export interface NoticeProps { tone?: 'error' | 'success' | 'info'; title?: string; body?: string; actions?: ButtonProps[]; focusable?: boolean; role?: string }
export declare function Notice(props: NoticeProps): HTMLElement;

export interface EmptyStateProps { title: string; body?: string; action?: ButtonProps }
export declare function EmptyState(props: EmptyStateProps): HTMLElement;

declare global {
  interface Window {
    AIDash: {
      STATUS: Record<Status, { key: Status; label: string; long: string; group: string; note: string; moving: boolean }>;
      ORDER: Status[];
      AGENTS: Record<AgentKey, { key: AgentKey; name: string }>;
      h: (tag: string, props?: Record<string, unknown> | null, ...children: unknown[]) => HTMLElement;
      formatAgo(ms: number, now?: number): string;
      formatDuration(ms: number, now?: number): string;
      formatClock(ms: number): string;
      StatusBadge: typeof StatusBadge; StatusMark: typeof StatusMark; Button: typeof Button; AgentTag: typeof AgentTag;
      SummaryTile: typeof SummaryTile; FilterChip: typeof FilterChip; Progress: typeof Progress; TaskRow: typeof TaskRow;
      AnswerForm: typeof AnswerForm; Notice: typeof Notice; EmptyState: typeof EmptyState;
    };
  }
}
