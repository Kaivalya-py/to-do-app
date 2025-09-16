// Simple Todo App
// Responsibilities:
// - load/save tasks from localStorage
// - add, toggle complete, delete tasks
// - update counts and keep UI in sync

(() => {
  const STORAGE_KEY = 'todo.tasks.v1';

  // DOM refs
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const taskCount = document.getElementById('taskCount');
  const clearCompletedBtn = document.getElementById('clearCompleted');

  // In-memory model
  let tasks = [];

  // Utilities
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  };

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  // Rendering
  function render() {
    taskList.innerHTML = '';
    if (!tasks.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No tasks yet. Add one above.';
      empty.style.opacity = '0.7';
      empty.style.fontStyle = 'italic';
      taskList.appendChild(empty);
    } else {
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id;

        const left = document.createElement('div');
        left.className = 'task-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.setAttribute('aria-label', `Mark ${task.text} as completed`);

        const span = document.createElement('span');
        span.className = 'task-text' + (task.completed ? ' completed' : '');
        span.textContent = task.text;

        left.appendChild(checkbox);
        left.appendChild(span);

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn delete';
        delBtn.setAttribute('aria-label', `Delete ${task.text}`);
        delBtn.textContent = 'Delete';

        actions.appendChild(delBtn);

        li.appendChild(left);
        li.appendChild(actions);
        taskList.appendChild(li);
      });
    }

    const remaining = tasks.filter(t => !t.completed).length;
    taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
  }

  // Actions
  function addTask(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;
    tasks.unshift({ id: uid(), text: trimmed, completed: false });
    save();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    save();
    render();
  }

  // Event delegation for task list (handles checkbox and delete)
  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.matches('.icon-btn.delete')) {
      deleteTask(id);
    }
  });

  taskList.addEventListener('change', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    if (e.target.type === 'checkbox') {
      toggleTask(id);
    }
  });

  // Form submit
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  clearCompletedBtn.addEventListener('click', () => {
    clearCompleted();
  });

  // Initialize
  function init() {
    tasks = load();
    render();
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
