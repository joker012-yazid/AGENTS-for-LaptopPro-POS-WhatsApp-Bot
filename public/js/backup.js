async function downloadWithToken(url, filename) {
  const token = localStorage.getItem('token');
  const headers = token ? { 'X-Token': token } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Gagal memuat turun (${res.status})`);
  }
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

document.getElementById('export-customers').addEventListener('click', async evt => {
  evt.preventDefault();
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  const url = query ? `/api/backup/customers.xlsx?${query}` : '/api/backup/customers.xlsx';
  try {
    await downloadWithToken(url, 'customers.xlsx');
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('export-issues').addEventListener('click', async evt => {
  evt.preventDefault();
  const form = document.getElementById('issues-form');
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  const url = query ? `/api/backup/issues.zip?${query}` : '/api/backup/issues.zip';
  try {
    await downloadWithToken(url, 'issues.zip');
  } catch (err) {
    alert(err.message);
  }
});
