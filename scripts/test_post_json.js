(async () => {
  try {
    const res = await fetch('http://localhost:8080/api/reports/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test from assistant', description: 'Automated test description', location: 'Somewhere' })
    });

    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
