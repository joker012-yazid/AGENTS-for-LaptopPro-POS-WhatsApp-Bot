async function loadFormSettings() {
  const res = await fetch('/api/form-settings', { headers: { 'X-Token': localStorage.getItem('token') } });
  if (res.ok) {
    const data = await res.json();
    document.getElementById('form-settings-data').value = JSON.stringify(data, null, 2);
  }
}

async function saveFormSettings(evt) {
  evt.preventDefault();
  const value = document.getElementById('form-settings-data').value;
  const data = JSON.parse(value || '{}');
  await fetch('/api/form-settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Token': localStorage.getItem('token')
    },
    body: JSON.stringify(data)
  });
}

document.getElementById('form-settings-form').addEventListener('submit', saveFormSettings);
loadFormSettings();
