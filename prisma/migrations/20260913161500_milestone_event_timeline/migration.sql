-- AlterTable
ALTER TABLE `milestones` ADD COLUMN `eventId` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `milestone_event_date` ON `milestones`(`eventId`, `date`);

-- AddForeignKey
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
