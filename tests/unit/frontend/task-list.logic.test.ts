import {
  calculateQuestProgressPercentage,
  findWaterTask,
  getVisibleQuestTasks,
  WATER_TASK_TITLE,
} from "../../../frontend/src/app/pages/dashboard/components/task-list/task-list.component";
import { TaskItem } from "../../../frontend/src/app/shared/models/task.model";

describe("task-list logic", () => {
  it("findet die Wasser-Quest über den sichtbaren Titel", () => {
    const tasks = [
      createTask("study", "30 Minuten lernen"),
      createTask("water", WATER_TASK_TITLE),
    ];

    expect(findWaterTask(tasks)?.id).toBe("water");
  });

  it("rendert die Wasser-Quest nicht zusätzlich als normale Quest-Karte", () => {
    const tasks = [
      createTask("water", WATER_TASK_TITLE),
      createTask("study", "30 Minuten lernen"),
      createTask("sport", "Sport"),
    ];

    expect(getVisibleQuestTasks(tasks).map((task) => task.id)).toEqual([
      "study",
      "sport",
    ]);
  });

  it("lässt die Questliste unverändert, wenn kein Wasser-Task vorhanden ist", () => {
    const tasks = [
      createTask("study", "30 Minuten lernen"),
      createTask("sport", "Sport"),
    ];

    expect(getVisibleQuestTasks(tasks)).toEqual(tasks);
  });

  it.each([
    [[], null, 0],
    [[createTask("study", "30 Minuten lernen")], null, 0],
    [[createTask("study", "30 Minuten lernen", true)], null, 100],
    [
      [
        createTask("study", "30 Minuten lernen", true),
        createTask("sport", "Sport", false),
      ],
      null,
      50,
    ],
    [
      [],
      {
        completed: 2,
        total: 3,
        pending: 1,
        completedRequired: 2,
        totalRequired: 3,
        percentage: 67,
      },
      67,
    ],
    [
      [],
      {
        completed: 5,
        total: 5,
        pending: 0,
        completedRequired: 5,
        totalRequired: 5,
        percentage: 140,
      },
      100,
    ],
    [
      [],
      {
        completed: 0,
        total: 5,
        pending: 5,
        completedRequired: 0,
        totalRequired: 5,
        percentage: -10,
      },
      0,
    ],
  ])("berechnet Quest-Fortschritt stabil", (tasks, progress, expected) => {
    expect(calculateQuestProgressPercentage(tasks, progress)).toBe(expected);
  });
});

function createTask(id: string, title: string, isCompleted = false): TaskItem {
  return {
    id,
    title,
    description: `${title} Beschreibung`,
    icon: "docs",
    tone: "green",
    category: "delivery",
    isRequired: true,
    checklistReference: `Quest #${id}`,
    points: 10,
    isCompleted,
  };
}
