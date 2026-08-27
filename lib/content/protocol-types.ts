export type TaskKind =
  | "foundation"
  | "session"
  | "measure"
  | "lesson"
  | "rest"
  | "medical"
  | "partner";

export type Task = {
  id: string;
  label: string;
  detail?: string;
  kind: TaskKind;
};

export type SessionSpec = {
  title: string;
  duration: string;
  ceiling: string;
  cycles: string;
  steps: string[];
  ending: string;
  guard?: string;
};

export type DayKind = "reset" | "baseline" | "training" | "rest" | "retest" | "review";

export type ProtocolDay = {
  day: number;
  kind: DayKind;
  title: string;
  focus: string;
  /** the written lesson for the day — paragraphs */
  brief: string[];
  session?: SessionSpec;
  tasks: Task[];
  /** slug from lessons.ts */
  lesson?: string;
  /** phase label, used in the 30-day view */
  phase?: string;
};

export type Rule = {
  id: string;
  label: string;
  detail: string;
  /** regional content is swapped per market — see regions.ts */
  regional?: boolean;
};

export type Protocol = {
  rules: Rule[];
  rulesIntro: string[];
  days: ProtocolDay[];
};
