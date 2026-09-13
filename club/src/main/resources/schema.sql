CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visitor_token VARCHAR(64) NOT NULL,
    content VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL,
    semester VARCHAR(20) NOT NULL,
    UNIQUE KEY uk_milestones_visitor_semester (visitor_token, semester),
    KEY idx_milestones_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO milestones (visitor_token, content, created_at, semester)
SELECT 'signal-0001',
       '欢迎来到微光漫摄的里程碑。愿每一份热爱，都能在时间里留下清晰的坐标。',
       '2025-02-16 10:00:00',
       '2025-春季'
WHERE NOT EXISTS (
    SELECT 1 FROM milestones
    WHERE visitor_token = 'signal-0001' AND semester = '2025-春季'
);
