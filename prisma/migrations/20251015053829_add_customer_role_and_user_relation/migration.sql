-- AlterEnum: Add CUSTOMER to Role enum
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER') NOT NULL DEFAULT 'AGENT';

-- AlterTable: Add unique constraint on customers.email and userId column
ALTER TABLE `customers` ADD COLUMN `userId` VARCHAR(191) NULL;
ALTER TABLE `customers` ADD UNIQUE INDEX `customers_email_key`(`email`);
ALTER TABLE `customers` ADD UNIQUE INDEX `customers_userId_key`(`userId`);

-- AddForeignKey: Add foreign key from customers to users
ALTER TABLE `customers` ADD CONSTRAINT `customers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

