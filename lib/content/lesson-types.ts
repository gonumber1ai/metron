export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  /** the day this lesson becomes available */
  unlockDay: number;
  /** true when the content contains market-specific food or products */
  regional?: boolean;
  body: string[];
};
