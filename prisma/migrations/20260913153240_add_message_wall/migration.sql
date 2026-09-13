-- CreateTable
CREATE TABLE `wall_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `body` VARCHAR(280) NOT NULL,
    `nickname` VARCHAR(20) NOT NULL,
    `color` VARCHAR(12) NOT NULL,
    `userId` CHAR(36) NULL,
    `guestHash` CHAR(64) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `wall_notes_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wall_notes` ADD CONSTRAINT `wall_notes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
