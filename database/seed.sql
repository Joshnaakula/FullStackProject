-- Passwords: admin123 (admin), emp123 (employees)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@office.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin'),
('Ravi Kumar', 'ravi@office.com', 'e03d3ec8d5035f8721f5dc64546e59ed790dbcb3b7b598fe57057ccd7b683b00', 'employee'),
('Sneha Reddy', 'sneha@office.com', 'e03d3ec8d5035f8721f5dc64546e59ed790dbcb3b7b598fe57057ccd7b683b00', 'employee');

INSERT INTO tickets (title, description, category, priority, status, created_by, assigned_to) VALUES
('Laptop not starting', 'Black screen after update', 'IT', 'High', 'In Progress', 2, 1),
('Need VPN access', 'Working from home next week', 'IT', 'Medium', 'Open', 3, NULL),
('AC not working in room 4', 'Very hot since Monday', 'Facilities', 'Medium', 'Open', 2, NULL),
('Payslip correction', 'Wrong tax deduction', 'HR', 'High', 'Resolved', 3, 1),
('Request new monitor', 'Screen flickering', 'IT', 'Low', 'Resolved', 2, 1),
('Parking pass', 'Need a visitor parking pass', 'Facilities', 'Low', 'Open', 3, NULL);

INSERT INTO comments (ticket_id, user_id, text) VALUES
(1, 1, 'Looking into it, please keep the laptop plugged in.'),
(4, 1, 'Corrected and re-issued the payslip.');
