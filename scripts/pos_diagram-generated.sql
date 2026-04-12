CREATE TABLE `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `email_verified_at` TIMESTAMP,
  `password` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `two_factor_secret` TEXT,
  `two_factor_recovery_codes` TEXT,
  `two_factor_confirmed_at` TIMESTAMP,
  `remember_token` VARCHAR(100),
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) PRIMARY KEY NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP
);

CREATE TABLE `sessions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `user_id` BIGINT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL
);

CREATE TABLE `roles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `permissions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `model_has_roles` (
  `role_id` BIGINT NOT NULL,
  `model_type` VARCHAR(255) NOT NULL,
  `model_id` BIGINT NOT NULL,
  PRIMARY KEY (`role_id`, `model_id`, `model_type`)
);

CREATE TABLE `model_has_permissions` (
  `permission_id` BIGINT NOT NULL,
  `model_type` VARCHAR(255) NOT NULL,
  `model_id` BIGINT NOT NULL,
  PRIMARY KEY (`permission_id`, `model_id`, `model_type`)
);

CREATE TABLE `role_has_permissions` (
  `permission_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`permission_id`, `role_id`)
);

CREATE TABLE `categories` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `units` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `short_name` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `products` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `product_code` VARCHAR(20) UNIQUE NOT NULL,
  `barcode` VARCHAR(50) UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `buy_price` DECIMAL(12,2) NOT NULL,
  `sell_price` DECIMAL(12,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(255),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `category_id` BIGINT,
  `unit_id` BIGINT,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `expense_categories` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `transactions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `receipt_number` VARCHAR(50) UNIQUE NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_price` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM ('cash', 'qris', 'midtrans') NOT NULL DEFAULT 'cash',
  `payment_status` ENUM ('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_reference` VARCHAR(255),
  `amount_paid` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `change_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `note` TEXT,
  `transaction_date` TIMESTAMP NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `transaction_items` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `transaction_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price_buy_snapshot` DECIMAL(12,2) NOT NULL,
  `price_sell` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `subtotal` DECIMAL(12,2) NOT NULL
);

CREATE TABLE `stock_movements` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `movement_type` ENUM ('in', 'out', 'adjustment', 'sale', 'return') NOT NULL,
  `qty` INT NOT NULL,
  `stock_before` INT NOT NULL,
  `stock_after` INT NOT NULL,
  `reason` VARCHAR(255),
  `product_id` BIGINT NOT NULL,
  `user_id` BIGINT,
  `reference_id` BIGINT,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `expenses` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `expense_category_id` BIGINT,
  `name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `date` DATE NOT NULL,
  `note` TEXT,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `shop_settings` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `shop_name` VARCHAR(255) NOT NULL DEFAULT 'Toko ATK',
  `address` TEXT,
  `email` VARCHAR(255),
  `phone` VARCHAR(50),
  `npwp` VARCHAR(50),
  `logo_path` VARCHAR(255),
  `qris_image_path` VARCHAR(255),
  `midtrans_merchant_id` VARCHAR(255),
  `midtrans_client_key` VARCHAR(255),
  `midtrans_server_key` VARCHAR(255),
  `midtrans_is_production` TINYINT(1) NOT NULL DEFAULT 0,
  `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 11,
  `receipt_footer` TEXT,
  `paper_size` VARCHAR(20) NOT NULL DEFAULT 'mm_80',
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `chat_conversations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(255),
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `chat_messages` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `conversation_id` BIGINT NOT NULL,
  `role` ENUM ('user', 'assistant', 'system') NOT NULL,
  `content` TEXT NOT NULL,
  `metadata` JSON,
  `used_tool` TINYINT(1) NOT NULL DEFAULT 0,
  `tool_used` VARCHAR(100),
  `ip_address` VARCHAR(45),
  `tokens_used` BIGINT,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `cache` (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL
);

CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL
);

CREATE TABLE `jobs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT NOT NULL,
  `reserved_at` INT,
  `available_at` INT NOT NULL,
  `created_at` INT NOT NULL
);

CREATE TABLE `job_batches` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` MEDIUMTEXT,
  `cancelled_at` INT,
  `created_at` INT NOT NULL,
  `finished_at` INT
);

CREATE TABLE `failed_jobs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `uuid` VARCHAR(255) UNIQUE NOT NULL,
  `connection` TEXT NOT NULL,
  `queue` TEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX `idx_users_name` ON `users` (`name`);

CREATE INDEX `idx_users_email` ON `users` (`email`);

CREATE INDEX `sessions_user_id_index` ON `sessions` (`user_id`);

CREATE INDEX `sessions_last_activity_index` ON `sessions` (`last_activity`);

CREATE UNIQUE INDEX `role_name_guard` ON `roles` (`name`, `guard_name`);

CREATE UNIQUE INDEX `permission_name_guard` ON `permissions` (`name`, `guard_name`);

CREATE INDEX `model_has_roles_model_index` ON `model_has_roles` (`model_id`, `model_type`);

CREATE INDEX `model_has_permissions_model_index` ON `model_has_permissions` (`model_id`, `model_type`);

CREATE INDEX `idx_categories_name` ON `categories` (`name`);

CREATE INDEX `idx_units_name` ON `units` (`name`);

CREATE INDEX `idx_units_short_name` ON `units` (`short_name`);

CREATE INDEX `idx_products_barcode` ON `products` (`barcode`);

CREATE INDEX `idx_products_category` ON `products` (`category_id`);

CREATE INDEX `idx_products_active` ON `products` (`is_active`);

CREATE INDEX `idx_products_name` ON `products` (`name`);

CREATE INDEX `idx_products_code` ON `products` (`product_code`);

CREATE INDEX `idx_expense_categories_name` ON `expense_categories` (`name`);

CREATE INDEX `idx_transactions_receipt` ON `transactions` (`receipt_number`);

CREATE INDEX `idx_transactions_date` ON `transactions` (`transaction_date`);

CREATE INDEX `idx_transactions_status` ON `transactions` (`payment_status`);

CREATE INDEX `idx_transactions_user` ON `transactions` (`user_id`);

CREATE INDEX `idx_items_transaction` ON `transaction_items` (`transaction_id`);

CREATE INDEX `idx_items_product` ON `transaction_items` (`product_id`);

CREATE INDEX `idx_movements_product` ON `stock_movements` (`product_id`);

CREATE INDEX `idx_movements_type` ON `stock_movements` (`movement_type`);

CREATE INDEX `idx_movements_created` ON `stock_movements` (`created_at`);

CREATE INDEX `idx_movements_user` ON `stock_movements` (`user_id`);

CREATE INDEX `idx_expenses_user` ON `expenses` (`user_id`);

CREATE INDEX `idx_expenses_category` ON `expenses` (`expense_category_id`);

CREATE INDEX `idx_expenses_date` ON `expenses` (`date`);

CREATE INDEX `idx_chat_conv_user` ON `chat_conversations` (`user_id`);

CREATE INDEX `idx_chat_msg_conversation` ON `chat_messages` (`conversation_id`);

CREATE INDEX `idx_chat_msg_role` ON `chat_messages` (`role`);

CREATE INDEX `jobs_queue_index` ON `jobs` (`queue`);

CREATE UNIQUE INDEX `failed_jobs_uuid_unique` ON `failed_jobs` (`uuid`);

ALTER TABLE `sessions` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `model_has_roles` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `model_has_permissions` ADD FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `role_has_permissions` ADD FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `role_has_permissions` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

ALTER TABLE `products` ADD FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

ALTER TABLE `transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `transaction_items` ADD FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

ALTER TABLE `transaction_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `stock_movements` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `stock_movements` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `stock_movements` ADD FOREIGN KEY (`reference_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL;

ALTER TABLE `expenses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `expenses` ADD FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL;

ALTER TABLE `chat_conversations` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `chat_messages` ADD FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE;
