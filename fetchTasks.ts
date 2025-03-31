import axios from "axios";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

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

interface WrikeTask {
  id: string;
  title: string;
  responsibleIds: string[];
  status: string;
  parentIds: string[];
  createdDate: string;
  updatedDate: string;
  permalink: string;
}

interface WrikeResponse {
  data: WrikeTask[];
}

const writeTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    console.log("Tasks saved successfully.");
  } catch (error) {
    console.error("Error writing tasks file:", error);
  }
};

const mapWrikeTasks = (tasks: WrikeTask[]): Task[] =>
  tasks.map((task) => ({
    id: task.id,
    name: task.title,
    assignees: task.responsibleIds,
    status: task.status,
    collections: task.parentIds,
    created_at: task.createdDate,
    updated_at: task.updatedDate,
    ticket_url: task.permalink,
  }));

const fetchTasks = async (): Promise<void> => {
  try {
    const respone = await axios.get<WrikeResponse>(WRIKE_API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: {
        fields :'[responsibleIds, parentIds]'
      }
    });

    const mappedTasks = mapWrikeTasks(respone.data.data);
    await writeTasks(mappedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
  }
};

fetchTasks();
