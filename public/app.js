const apiUrl = 'http://localhost:3000';

const taskNameInput = document.getElementById('taskName');
const createTaskButton = document.getElementById('createTask');
const taskList = document.getElementById('taskList');

let taskIntervals = {}; // Keep track of intervals for running tasks

// Fetch all tasks and render them
async function fetchTasks() {
    const response = await fetch(`${apiUrl}/tasks`);
    const data = await response.json();

    taskList.innerHTML = ''; // Clear the task list

    Object.entries(data.tasks).forEach(([id, task]) => {
        renderTask(id, task);
    });
}

// Render a single task
function renderTask(id, task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.id = `task-${id}`;

    const duration = calculateCurrentDuration(task);

    taskElement.innerHTML = `
      <span>${task.name} - <span id="duration-${id}">${duration}s</span></span>
      <div>
        <button onclick="startTask('${id}')">Start</button>
        <button onclick="stopTask('${id}')">Stop</button>
        <button onclick="deleteTask('${id}')">Delete</button>
      </div>
    `;

    taskList.appendChild(taskElement);

    // If the task is running, start real-time updates
    if (task.startTime) {
        startRealTimeUpdate(id, task);
    }
}

// Calculate the current duration of a task
function calculateCurrentDuration(task) {
    let duration = task.duration;

    if (task.startTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - task.startTime) / 1000); // Elapsed time in seconds
        duration += elapsed;
    }

    return duration;
}

// Start real-time updates for a running task
function startRealTimeUpdate(id, task) {
    // Clear any existing interval for this task
    clearInterval(taskIntervals[id]);

    taskIntervals[id] = setInterval(() => {
        const durationElement = document.getElementById(`duration-${id}`);
        if (durationElement) {
            const duration = calculateCurrentDuration(task);
            durationElement.textContent = `${duration}s`;
        }
    }, 1000);
}

// Stop real-time updates for a task
function stopRealTimeUpdate(id) {
    clearInterval(taskIntervals[id]);
    delete taskIntervals[id];
}

// Create a new task
createTaskButton.addEventListener('click', async () => {
    const taskName = taskNameInput.value.trim();

    if (!taskName) {
        alert('Task name cannot be empty');
        return;
    }

    const response = await fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Date.now().toString(), name: taskName }),
    });

    if (response.ok) {
        taskNameInput.value = '';
        fetchTasks();
    } else {
        alert('Failed to create task');
    }
});

// Start a task
async function startTask(id) {
    try {
        const response = await fetch(`${apiUrl}/tasks/${id}/start`, { method: 'POST' });

        if (response.ok) {
            const task = (await response.json()).task;
            startRealTimeUpdate(id, task);
            fetchTasks(); // Refresh tasks
        } else {
            const errorData = await response.json();
            alert(`Failed to start task: ${errorData.message}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

// Stop a task
async function stopTask(id) {
    try {
        const response = await fetch(`${apiUrl}/tasks/${id}/stop`, { method: 'POST' });

        if (response.ok) {
            stopRealTimeUpdate(id); // Stop real-time updates
            fetchTasks(); // Refresh tasks
        } else {
            const errorData = await response.json();
            alert(`Failed to stop task: ${errorData.message}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        const response = await fetch(`${apiUrl}/tasks/${id}`, { method: 'DELETE' });

        if (response.ok) {
            stopRealTimeUpdate(id); // Stop real-time updates
            fetchTasks();
        } else {
            alert('Failed to delete task');
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

// Initialize the app
fetchTasks();
