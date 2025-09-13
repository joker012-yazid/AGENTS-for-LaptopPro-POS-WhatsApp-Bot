document.getElementById('export-customers').addEventListener('click', () => {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const params = new URLSearchParams({ from, to });
  window.location.href = `/api/backup/customers.xlsx?${params.toString()}`;
});

document.getElementById('export-issues').addEventListener('click', () => {
  const form = document.getElementById('issues-form');
  const params = new URLSearchParams(new FormData(form));
  window.location.href = `/api/backup/issues.zip?${params.toString()}`;
});
