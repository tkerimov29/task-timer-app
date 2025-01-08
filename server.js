const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" folder

// In-memory database
const tasks = {};

// Helper function to calculate task duration
const calculateDuration = (startTime, endTime) => {
    return Math.floor((endTime - startTime) / 1000); // Duration in seconds
};

// API to create a new task
app.post('/tasks', (req, res) => {
    const { id, name } = req.body;

    if (tasks[id]) {
        return res.status(400).json({ message: 'Task ID already exists.' });
    }

    tasks[id] = {
        name,
        startTime: null,
        endTime: null,
        duration: 0,
    };

    res.status(201).json({ message: 'Task created successfully.', task: tasks[id] });
});

// API to start a task
app.post('/tasks/:id/start', (req, res) => {
    const { id } = req.params;
    console.log(`Starting task with ID: ${id}`); // Debug log

    if (!tasks[id]) {
        console.log(`Task with ID ${id} not found`); // Log error
        return res.status(404).json({ message: 'Task not found.' });
    }

    if (tasks[id].startTime) {
        console.log(`Task with ID ${id} is already running`); // Log error
        return res.status(400).json({ message: 'Task is already running.' });
    }

    tasks[id].startTime = Date.now();
    console.log(`Task with ID ${id} started at ${tasks[id].startTime}`); // Log success
    res.status(200).json({ message: 'Task started.', task: tasks[id] });
});


// API to stop a task
app.post('/tasks/:id/stop', (req, res) => {
    const { id } = req.params;

    if (!tasks[id]) {
        return res.status(404).json({ message: 'Task not found.' });
    }

    if (!tasks[id].startTime) {
        return res.status(400).json({ message: 'Task has not started yet.' });
    }

    tasks[id].endTime = Date.now();
    tasks[id].duration += calculateDuration(tasks[id].startTime, tasks[id].endTime);
    tasks[id].startTime = null; // Reset start time after stopping

    res.status(200).json({ message: 'Task stopped.', task: tasks[id] });
});

// API to get the details of a task
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;

    if (!tasks[id]) {
        return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ task: tasks[id] });
});

// API to get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json({ tasks });
});

// API to delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    if (!tasks[id]) {
        return res.status(404).json({ message: 'Task not found.' });
    }

    delete tasks[id];
    res.status(200).json({ message: 'Task deleted successfully.' });
});

// Start the server
app.listen(port, () => {
    console.log(`Task Timer app is running at http://localhost:${port}`);
});
