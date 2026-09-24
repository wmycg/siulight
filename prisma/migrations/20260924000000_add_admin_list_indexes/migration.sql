-- Add indexes used by paginated administrator lists.
CREATE INDEX `application_status_created` ON `applications`(`status`, `createdAt`);
CREATE INDEX `audit_created` ON `audit_logs`(`createdAt`);
CREATE INDEX `user_created` ON `users`(`createdAt`);
