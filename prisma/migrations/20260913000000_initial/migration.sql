-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL,
    `nickname` VARCHAR(20) NOT NULL,
    `realName` VARCHAR(30) NOT NULL,
    `studentId` VARCHAR(25) NOT NULL,
    `qq` VARCHAR(15) NOT NULL,
    `department` VARCHAR(30) NOT NULL,
    `note` VARCHAR(500) NOT NULL DEFAULT '',
    `status` ENUM('pending', 'contacted', 'accepted') NOT NULL DEFAULT 'pending',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `studentId`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actor` VARCHAR(40) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_attendees` (
    `eventId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`eventId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(80) NOT NULL,
    `date` DATE NOT NULL,
    `place` VARCHAR(100) NOT NULL,
    `brief` VARCHAR(160) NOT NULL,
    `body` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL DEFAULT '',
    `category` VARCHAR(20) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 30,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `event_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `milestoneId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`milestoneId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milestone_participants` (
    `milestoneId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`milestoneId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milestones` (
    `id` CHAR(36) NOT NULL,
    `authorId` CHAR(36) NOT NULL,
    `title` VARCHAR(80) NOT NULL,
    `body` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `kind` ENUM('personal', 'club') NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `image` VARCHAR(255) NOT NULL DEFAULT '',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `milestone_author`(`authorId`, `date`),
    INDEX `milestone_date`(`date`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `tokenHash` CHAR(64) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `expiresAt` DATETIME(0) NOT NULL,

    INDEX `session_expiry`(`expiresAt`),
    INDEX `userId`(`userId`),
    PRIMARY KEY (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('member', 'admin', 'superadmin') NOT NULL DEFAULT 'member',
    `color` VARCHAR(20) NOT NULL DEFAULT '#c16b51',
    `bio` VARCHAR(300) NOT NULL DEFAULT '',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `milestone_participants` ADD CONSTRAINT `milestone_participants_ibfk_1` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `milestone_participants` ADD CONSTRAINT `milestone_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
