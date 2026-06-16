import {
  calculateQualityProgressPercent,
  getMissingRequiredTasks,
  getRequiredTasks,
} from "../../../frontend/src/app/pages/dashboard/components/quality-gate-card/quality-gate-card.component";
import { TaskItem } from "../../../frontend/src/app/shared/models/task.model";

describe("quality-gate-card logic", () => {
  it.each([
    [0, 80, 0],
    [40, 80, 50],
    [80, 80, 100],
    [120, 80, 100],
    [5, 0, 100],
    [-10, 80, 0],
  ])(
    "berechnet den Tagesziel-Fortschritt begrenzt",
    (score, target, expected) => {
      expect(calculateQualityProgressPercent(score, target)).toBe(expected);
    },
  );

  it("filtert nur Pflichtquests für das Tagesziel", () => {
    const tasks = [
      createTask("water", true, false),
      createTask("bonus", false, false),
      createTask("study", true, true),
    ];

    expect(getRequiredTasks(tasks).map((task) => task.id)).toEqual([
      "water",
      "study",
    ]);
  });

  it("liefert maximal drei offene Pflichtquests", () => {
    const tasks = [
      createTask("water", true, false),
      createTask("study", true, true),
      createTask("sport", true, false),
      createTask("clean", true, false),
      createTask("read", true, false),
    ];

    expect(getMissingRequiredTasks(tasks).map((task) => task.id)).toEqual([
      "water",
      "sport",
      "clean",
    ]);
  });
});

function createTask(
  id: string,
  isRequired: boolean,
  isCompleted: boolean,
): TaskItem {
  return {
    id,
    title: `Quest ${id}`,
    description: `Beschreibung ${id}`,
    icon: "docs",
    tone: "green",
    category: "delivery",
    isRequired,
    checklistReference: `Quest #${id}`,
    points: 10,
    isCompleted,
  };
}
