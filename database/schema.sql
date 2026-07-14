CREATE DATABASE IF NOT EXISTS llp_local
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE llp_local;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  scope ENUM('COURSE', 'LECTURE', 'BOTH') NOT NULL DEFAULT 'BOTH',
  status ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_unique (slug)
);

CREATE TABLE IF NOT EXISTS category_outline_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY category_outline_items_category_id_index (category_id),
  KEY category_outline_items_parent_id_index (parent_id),
  CONSTRAINT category_outline_items_category_id_fk
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE,
  CONSTRAINT category_outline_items_parent_id_fk
    FOREIGN KEY (parent_id) REFERENCES category_outline_items(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lectures (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  content JSON NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  reading_time VARCHAR(50) NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY lectures_slug_unique (slug),
  KEY lectures_category_id_index (category_id),
  CONSTRAINT lectures_category_id_fk
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lecture_outline_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lecture_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY lecture_outline_items_lecture_id_index (lecture_id),
  KEY lecture_outline_items_parent_id_index (parent_id),
  CONSTRAINT lecture_outline_items_lecture_id_fk
    FOREIGN KEY (lecture_id) REFERENCES lectures(id)
    ON DELETE CASCADE,
  CONSTRAINT lecture_outline_items_parent_id_fk
    FOREIGN KEY (parent_id) REFERENCES lecture_outline_items(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lecture_contents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lecture_id BIGINT UNSIGNED NOT NULL,
  outline_item_id BIGINT UNSIGNED NOT NULL,
  content JSON NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY lecture_contents_outline_unique (outline_item_id),

  CONSTRAINT lecture_contents_lecture_fk
    FOREIGN KEY (lecture_id) REFERENCES lectures(id)
    ON DELETE CASCADE,

  CONSTRAINT lecture_contents_outline_item_fk
    FOREIGN KEY (outline_item_id) REFERENCES lecture_outline_items(id)
    ON DELETE CASCADE
);