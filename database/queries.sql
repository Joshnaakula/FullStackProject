-- Stats queries used by the /stats endpoint
SELECT status, COUNT(*) AS count FROM tickets GROUP BY status;
SELECT category, COUNT(*) AS count FROM tickets GROUP BY category;
SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority;
SELECT COUNT(*) AS total FROM tickets;
