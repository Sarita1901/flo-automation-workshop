// Simple Task Manager - vanilla JS, in-memory state only (no storage/backend)

(function () {
  let tasks = [];
  let nextId = 1;

  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const errorMessage = document.getElementById('errorMessage');
  const taskList = document.getElementById('taskList');
  const taskCounter = document.getElementById('taskCounter');

  function addTask(rawText) {
    const text = rawText.trim();

    if (!text) {
      errorMessage.hidden = false;
      return;
    }

    errorMessage.hidden = true;

    tasks.push({ id: nextId++, text: text, completed: false });
    render();
  }

  function toggleComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    render();
  }

  function updateCounter() {
    const incompleteCount = tasks.filter((t) => !t.completed).length;
    taskCounter.textContent =
      incompleteCount + ' incomplete task' + (incompleteCount === 1 ? '' : 's');
  }

  function render() {
    taskList.innerHTML = '';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = String(task.id);
      li.id = 'task-' + task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'complete-checkbox';
      checkbox.id = 'complete-' + task.id;
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as completed');
      checkbox.addEventListener('change', () => toggleComplete(task.id));

      const span = document.createElement('span');
      span.className = 'task-text';
      span.id = 'task-text-' + task.id;
      span.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-btn';
      deleteBtn.id = 'delete-' + task.id;
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete "' + task.text + '"');
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    updateCounter();
  }

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  // Hide the error message as soon as the user starts typing again.
  taskInput.addEventListener('input', () => {
    if (!errorMessage.hidden) {
      errorMessage.hidden = true;
    }
  });

  render();
})();
