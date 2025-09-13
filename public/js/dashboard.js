async function loadQueue() {
  const res = await fetch('/api/queue/manual', {
    headers: { 'X-Token': localStorage.getItem('token') }
  });
  if (res.ok) {
    const data = await res.json();
    const countEl = document.getElementById('queue-count');
    const listEl = document.getElementById('queue-list');
    if (countEl) countEl.textContent = data.length;
    if (listEl) {
      listEl.innerHTML = '';
      data.forEach(q => {
        const li = document.createElement('li');
        li.textContent = `${q.remote_jid}: ${q.last_text}`;
        listEl.appendChild(li);
      });
    }
  }
}

loadQueue();
