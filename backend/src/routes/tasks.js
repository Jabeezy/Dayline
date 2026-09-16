import { Router } from 'express';
import { listTasks, createTask, toggleTask, deleteTask } from '../services/tasks.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (req, res) => {
  try {
    res.json({ tasks: await listTasks() });
  } catch (err) {
    console.error('Failed to list tasks:', err);
    res.status(500).json({ error: 'Could not load tasks' });
  }
});

tasksRouter.post('/', async (req, res) => {
  const { text, dueLabel } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });
  try {
    const task = await createTask({ text: text.trim(), dueLabel });
    res.status(201).json({ task });
  } catch (err) {
    console.error('Failed to create task:', err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

tasksRouter.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await toggleTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    console.error('Failed to toggle task:', err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

tasksRouter.delete('/:id', async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete task:', err);
    res.status(500).json({ error: 'Could not delete task' });
  }
});
