/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP DATABASE IF EXISTS `aplikacija`;
CREATE DATABASE IF NOT EXISTS `aplikacija` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `aplikacija`;

DROP TABLE IF EXISTS `administrator`;
CREATE TABLE IF NOT EXISTS `administrator` (
  `administrator_id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(32) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `password_hash` varchar(128) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`administrator_id`),
  UNIQUE KEY `uq_administrator_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `administrator`;
INSERT INTO `administrator` (`administrator_id`, `username`, `password_hash`) VALUES
	(1, 'lazar_davidovic', '9224E3B738ECCAE481FE2546945A24B18AECE23F6CCCE92E1FCD6D7CDE6A9BCEB7D0E33FF82D33DC6CC78EAEB26003972C3A3118640053BAAD77B307998BB7D9'),
	(2, 'lazar_test_user', '9085ufdjg98tyuhgehg34'),
	(3, 'Laza', '6A4C0DC4FCC43BDEA28963DF73E4F8351BCDAE08FDA1516234E8D764AF8178A610BCCA2813D204DFF92A43F0511EB0016C7682CCF7B343D99E01739FC26EF104'),
	(8, 'David', '5BEB126A7F66A441D3713B15878C4A4298E3E8681FF0A7D4C491CDABBDF63CC2394D98EAE51A18B2DC111B7C8E4AF07C5057368E7DD9FD0D78D453C8D81DE04D'),
	(10, 'admin', 'admin123456789'),
	(11, 'Zola', '0'),
	(16, 'Ikas', '926A386BB4F157C90620FCF3815046DC664367661855DDAF0DED89873ACB02CE281EB8EFB40958BBCB1F500C430AE66AE43F5E206DBE2A857359A5AD794D8643'),
	(19, 'marko', '4BE9D9F5874159BC525029D42E8F21007B642FD80992C3D7C57DDCCD8DA5E7F7D44BCD8C00F6242907E401F2AFD1494176003A11928174F1E84A244A16E67B48');

DROP TABLE IF EXISTS `article`;
CREATE TABLE IF NOT EXISTS `article` (
  `article_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `category_id` int unsigned NOT NULL DEFAULT (0),
  `excerpt` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` enum('available','visible','hidden') COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'available',
  `is_promoted` tinyint unsigned NOT NULL DEFAULT (0),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`article_id`),
  KEY `fk_article_category_id` (`category_id`),
  CONSTRAINT `fk_article_category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `article`;
INSERT INTO `article` (`article_id`, `name`, `category_id`, `excerpt`, `description`, `status`, `is_promoted`, `created_at`) VALUES
	(1, 'ACME HDD 512GB', 5, 'Kratak opis', 'Detaljan opis', 'available', 0, '2025-02-17 01:44:30'),
	(2, 'ACME HD11 1024GB', 5, 'Neki kratak tekst 2', 'Neki kratak tekst 2', 'visible', 1, '2025-02-17 17:20:30'),
	(3, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst ...', 'available', 0, '2025-02-17 17:37:29'),
	(4, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst ...', 'available', 0, '2025-02-17 17:50:28'),
	(5, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst o proizvodu...', 'available', 0, '2025-02-19 02:09:11'),
	(6, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst o proizvodu...', 'available', 0, '2025-02-20 02:17:52'),
	(7, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst o proizvodu...', 'available', 0, '2025-02-21 20:35:12'),
	(8, 'ACME HD11 1TB', 5, 'Kratak tekst ...', 'Neki malo duzi tekst o proizvodu...', 'available', 0, '2025-02-22 00:56:36');

DROP TABLE IF EXISTS `article_feature`;
CREATE TABLE IF NOT EXISTS `article_feature` (
  `article_feature_id` int unsigned NOT NULL AUTO_INCREMENT,
  `article_id` int unsigned NOT NULL,
  `feature_id` int unsigned NOT NULL,
  `value` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`article_feature_id`),
  UNIQUE KEY `uq_article_feature_article_id_feature_id` (`article_id`,`feature_id`),
  KEY `fk_article_feature_feature_id` (`feature_id`),
  CONSTRAINT `fk_article_feature_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_article_feature_feature_id` FOREIGN KEY (`feature_id`) REFERENCES `feature` (`feature_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `article_feature`;
INSERT INTO `article_feature` (`article_feature_id`, `article_id`, `feature_id`, `value`) VALUES
	(1, 1, 1, '512GB'),
	(2, 1, 2, 'SATA3'),
	(3, 1, 3, 'SSD'),
	(6, 3, 1, '1TB'),
	(7, 3, 3, 'SSD'),
	(8, 4, 1, '1TB'),
	(9, 4, 3, 'SSD'),
	(10, 5, 1, '1TB'),
	(11, 5, 3, 'SSD'),
	(12, 6, 1, '1TB'),
	(13, 6, 3, 'SSD'),
	(14, 7, 1, '1TB'),
	(15, 7, 3, 'SSD'),
	(16, 8, 1, '1TB'),
	(17, 8, 3, 'SSD'),
	(18, 2, 1, '1024GB'),
	(19, 2, 2, 'SATA 3.0');

DROP TABLE IF EXISTS `article_price`;
CREATE TABLE IF NOT EXISTS `article_price` (
  `article_price_id` int unsigned NOT NULL AUTO_INCREMENT,
  `article_id` int unsigned NOT NULL DEFAULT '0',
  `price` decimal(10,2) unsigned NOT NULL DEFAULT (0),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`article_price_id`),
  KEY `fk_article_price_article_id` (`article_id`),
  CONSTRAINT `fk_article_price_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `article_price`;
INSERT INTO `article_price` (`article_price_id`, `article_id`, `price`, `created_at`) VALUES
	(1, 1, 120.00, '2025-02-17 02:00:10'),
	(2, 1, 80.00, '2025-02-17 02:00:26'),
	(3, 2, 56.98, '2025-02-17 17:20:30'),
	(4, 3, 56.98, '2025-02-17 17:37:30'),
	(5, 4, 56.98, '2025-02-17 17:50:28'),
	(6, 5, 51.78, '2025-02-19 02:09:11'),
	(7, 6, 51.78, '2025-02-20 02:17:52'),
	(8, 7, 51.78, '2025-02-21 20:35:12'),
	(9, 8, 51.78, '2025-02-22 00:56:36'),
	(10, 2, 57.11, '2025-02-22 01:13:21'),
	(11, 2, 57.11, '2025-02-22 01:21:46');

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user_id` (`user_id`),
  CONSTRAINT `fk_cart_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `cart`;

DROP TABLE IF EXISTS `cart_article`;
CREATE TABLE IF NOT EXISTS `cart_article` (
  `cart_article_id` int unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` int unsigned NOT NULL DEFAULT '0',
  `article_id` int unsigned NOT NULL DEFAULT '0',
  `quantity` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`cart_article_id`),
  UNIQUE KEY `uq_cart_article_cart_id_article_id` (`cart_id`,`article_id`),
  KEY `fk_cart_article_article_id` (`article_id`),
  CONSTRAINT `fk_cart_article_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_article_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `cart_article`;

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `image_path` varchar(128) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `parent__category_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category_name` (`name`),
  UNIQUE KEY `uq_category_image_path` (`image_path`),
  KEY `fk_category_parent__category_id` (`parent__category_id`),
  CONSTRAINT `fk_category_parent__category_id` FOREIGN KEY (`parent__category_id`) REFERENCES `category` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `category`;
INSERT INTO `category` (`category_id`, `name`, `image_path`, `parent__category_id`) VALUES
	(1, 'Računarske komponente', 'assets/pc.jpg', NULL),
	(2, 'Kućna elektronika', 'assets/home.jpg', NULL),
	(3, 'Laptop računari', 'assets/pc/laptop.jpg', 1),
	(4, 'Memorijski mediji ', 'assets/pc/memory.jpg', 1),
	(5, 'Hard diskovi', 'assets/pc/memory/hdd.jpg', 4);

DROP TABLE IF EXISTS `feature`;
CREATE TABLE IF NOT EXISTS `feature` (
  `feature_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `category_id` int unsigned NOT NULL DEFAULT (0),
  PRIMARY KEY (`feature_id`),
  UNIQUE KEY `uq_feature_name_category_id` (`name`,`category_id`),
  KEY `fk_feature_category_id` (`category_id`),
  CONSTRAINT `fk_feature_category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `feature`;
INSERT INTO `feature` (`feature_id`, `name`, `category_id`) VALUES
	(1, 'Kapacitet', 5),
	(3, 'Tehnologija', 5),
	(2, 'Tip', 5);

DROP TABLE IF EXISTS `order`;
CREATE TABLE IF NOT EXISTS `order` (
  `order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `cart_id` int unsigned NOT NULL DEFAULT (0),
  `status` enum('rejected','accepted','shipped','pending') COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_order_cart_id` (`cart_id`),
  CONSTRAINT `fk_order_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `order`;

DROP TABLE IF EXISTS `photo`;
CREATE TABLE IF NOT EXISTS `photo` (
  `photo_id` int unsigned NOT NULL AUTO_INCREMENT,
  `article_id` int unsigned NOT NULL DEFAULT '0',
  `image_path` varchar(128) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`photo_id`),
  UNIQUE KEY `uq_photo_image_path` (`image_path`),
  KEY `fk_photo_article_id` (`article_id`),
  CONSTRAINT `fk_photo_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `photo`;
INSERT INTO `photo` (`photo_id`, `article_id`, `image_path`) VALUES
	(1, 1, 'images/1/front.jpg'),
	(2, 1, 'images/1/label.jpg'),
	(6, 2, '2025220-8363377668-hard-disk-slika.jpg'),
	(7, 2, '2025220-5875338761-snoopy.jpg'),
	(8, 2, '2025220-1857308246-snoopy.jpg'),
	(9, 2, '2025220-2384171072-snoopy.jpg'),
	(10, 2, '2025220-4021258134-snoopy.jpg'),
	(11, 2, '2025222-7646135253-snoopy.jpg');

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `password_hash` varchar(128) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `forname` varchar(64) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `surname` varchar(64) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `phone_number` varchar(24) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '0',
  `postal_address` tinytext COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email` (`email`) USING BTREE,
  UNIQUE KEY `uq_user_phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

DELETE FROM `user`;
INSERT INTO `user` (`user_id`, `email`, `password_hash`, `forname`, `surname`, `phone_number`, `postal_address`) VALUES
	(1, 'test@test.rs', 'DDAF35A193617ABACC417349AE20413112E6FA4E89A97EA20A9EEEE64B55D39A2192992A274FC1A836BA3C23A3FEEBBD454D4423643CE80E2A9AC94FA54CA49F', '0', 'Lazic', '+3811234567', 'Nepoznata adresa bb, Glavna luka, Nedodjija');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
