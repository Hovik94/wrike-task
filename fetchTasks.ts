import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const TOKEN = process.env.WRIKE_API_TOKEN as string;
const WRIKE_API_URL = "https://www.wrike.com/api/v4/tasks";
const TASKS_FILE = "tasks.json";

interface Task {
  id: string;
  name: string;
  assignees: string[];
  status: string;
  collections: string[];
  created_at: string;
  updated_at: string;
  ticket_url: string;
}

app.listen(PORT, () => {
  ensureFileExists();
  console.log(`Running at http://localhost:${PORT}`);
});

const ensureFileExists = (): void => {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, "[]");
  }
};

const readTasks = (): Task[] => {
  ensureFileExists();
  return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8") || "[]");
};

const writeTasks = (tasks: Task[]): void => {
  ensureFileExists();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

const mapWrikeTasks = (tasks: any[]): Task[] =>
  tasks.map((task) => ({
    id: task.id,
    name: task.title,
    assignees: task.responsibles || [],
    status: task.status,
    collections: task.parentIds || [],
    created_at: task.createdDate,
    updated_at: task.updatedDate,
    ticket_url: task.permalink,
  }));

app.get("/tasks", async (_, res: Response): Promise<void> => {
  try {
    const { data } = await axios.get(WRIKE_API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!data.data || data.data.length === 0) {
      res.status(400).json({ error: "No tasks found in Wrike" });
      return;
    }

    const mappedTasks = mapWrikeTasks(data.data);
    writeTasks(mappedTasks);
    res.json(mappedTasks);
  } catch (err: any) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
  }
});

app.delete("/tasks/:id", (req: Request, res: Response): void => {
  const tasks = readTasks().filter((t) => t.id !== req.params.id);
  writeTasks(tasks);
  res.json({ message: "Task deleted" });
});

app.put("/tasks/:id", (req: Request, res: Response): void => {
  const tasks = readTasks().map((t) =>
    t.id === req.params.id ? { ...t, ...req.body } : t
  );
  writeTasks(tasks);
  res.json({
    message: "Task updated",
    task: tasks.find((t) => t.id === req.params.id),
  });
});
