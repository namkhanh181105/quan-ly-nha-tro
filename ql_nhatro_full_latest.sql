-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: ql_nhatro
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ql_nhatro`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ql_nhatro` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `ql_nhatro`;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT 'Tên đăng nhập',
  `password` varchar(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa BCRYPT',
  `fullname` varchar(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
  `email` varchar(100) NOT NULL COMMENT 'Email quản trị viên',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại liên hệ',
  `role` enum('superadmin','admin') DEFAULT 'admin' COMMENT 'Vai trò phân quyền',
  `avatar` varchar(255) DEFAULT 'default-avatar.png' COMMENT 'Ảnh đại diện',
  `last_login` datetime DEFAULT NULL COMMENT 'Lần đăng nhập cuối',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','$2y$10$ycPF4hbtCr0IrNMyn5QHcO14CX8PwnIQYC0V/Jq3fX4.cbW.DwypG','Quản Trị Viên Chung Cư Mini','admin@ccmn.vn','0988123456','superadmin','default-avatar.png','2026-10-29 14:42:32','2026-10-27 00:07:43');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `note` text DEFAULT NULL,
  `status` enum('pending','contacted','approved','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_bookings_room` (`room_id`),
  CONSTRAINT `fk_bookings_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,'Hoàng Minh Quân','0912345678','quan.hm@gmail.com','2026-10-30','Tôi muốn xem phòng 101 vào khoảng 17h chiều thứ 6 tuần này.','pending','2026-10-27 00:07:43','2026-10-27 00:07:43',NULL),(2,5,'Đặng Mai Phương','0987654321','phuong.dang@outlook.com','2026-10-28','Phòng 201 có ban công kính đúng không ạ? Mình muốn qua xem buổi tối.','contacted','2026-10-27 00:07:43','2026-10-27 00:07:43',NULL),(3,21,'Nguyễn Tiến Đạt','0905123987','dat.cntt@gmail.com','2026-10-27','Phòng 601 view tầng thượng đẹp quá, em muốn xem để cọc dọn vào đầu tháng.','approved','2026-10-27 00:07:43','2026-10-27 00:07:43',NULL),(7,5,'Đinh Đức Hoàn','0981744604','aaa@gmail.com','2026-10-29','bây giờ','contacted','2026-10-29 14:28:45','2026-10-29 14:32:15',2);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Tên loại phòng',
  `slug` varchar(120) NOT NULL COMMENT 'Đường dẫn thân thiện',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Phòng đơn khép kín','phong-don-khep-kin','Phòng trọ nhỏ gọn, vệ sinh riêng, giá rẻ cho sinh viên','2026-10-27 00:07:43'),(2,'Phòng trọ có gác xép lửng','phong-gac-lung-thong-minh','Gác lửng khung sắt chắc chắn, tối ưu không gian ở ghép 2 bạn','2026-10-27 00:07:43'),(3,'Phòng Studio trọ ban công','can-ho-studio-cao-cap','Phòng khép kín có ban công đón gió và phơi đồ riêng','2026-10-27 00:07:43'),(4,'Phòng trọ 2 gian tách bếp','chung-cu-mini-2-phong','Có gian ngủ và gian bếp riêng biệt, không ám mùi thức ăn','2026-10-27 00:07:43');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT 'Tư vấn thuê phòng',
  `message` text NOT NULL,
  `status` enum('new','read','contacted') DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Trần Quang Huy','0912987654','huytq@gmail.com','Hỏi thuê phòng Studio ban công tầng 4','Mình đang làm việc tại Duy Tân, muốn tìm phòng ở 1 người từ đầu tháng tới. Tòa nhà còn phòng 401 hoặc 402 không ạ?','new',NULL,'2026-10-27 18:34:03',NULL),(2,'Vũ Thùy Linh','0934567890','linhvu.neu@gmail.com','Chính sách nuôi thú cưng & gửi xe điện','Cho mình hỏi chung cư mini EcoHouse có cho phép nuôi 1 bé mèo ngoan không và tòa nhà có chỗ cắm sạc xe máy điện VinFast không?','new',NULL,'2026-10-27 18:34:03',NULL);
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_code` varchar(30) NOT NULL COMMENT 'Mã hóa đơn VD: HD-202610-102',
  `room_id` int(11) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `month` tinyint(4) NOT NULL COMMENT 'Tháng thu tiền (1 - 12)',
  `year` int(11) NOT NULL COMMENT 'Năm thu tiền (2026)',
  `room_price` decimal(12,0) NOT NULL COMMENT 'Tiền phòng thỏa thuận',
  `old_electricity` int(11) NOT NULL DEFAULT 0 COMMENT 'Chỉ số điện đầu kỳ',
  `new_electricity` int(11) NOT NULL DEFAULT 0 COMMENT 'Chỉ số điện cuối kỳ',
  `electricity_usage` int(11) NOT NULL DEFAULT 0 COMMENT 'Số số điện tiêu thụ',
  `electricity_rate` decimal(10,0) DEFAULT 3800 COMMENT 'Đơn giá điện (3.800đ/số)',
  `electricity_amount` decimal(12,0) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền điện',
  `old_water` int(11) NOT NULL DEFAULT 0 COMMENT 'Chỉ số nước đầu kỳ (khối)',
  `new_water` int(11) NOT NULL DEFAULT 0 COMMENT 'Chỉ số nước cuối kỳ',
  `water_usage` int(11) NOT NULL DEFAULT 1 COMMENT 'Số khối nước tiêu thụ',
  `water_rate` decimal(10,0) DEFAULT 30000 COMMENT 'Đơn giá nước (30.000đ/khối)',
  `water_amount` decimal(12,0) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền nước',
  `service_amount` decimal(12,0) DEFAULT 150000 COMMENT 'Phí vệ sinh, thang máy, wifi, rác',
  `other_amount` decimal(12,0) DEFAULT 0 COMMENT 'Phụ phí khác nếu có',
  `total_amount` decimal(12,0) NOT NULL COMMENT 'Tổng số tiền phải thu trong tháng',
  `paid_amount` decimal(12,0) DEFAULT 0 COMMENT 'Số tiền khách đã thanh toán',
  `debt_amount` decimal(12,0) DEFAULT 0 COMMENT 'Công nợ còn thiếu (total - paid)',
  `payment_status` enum('unpaid','partially_paid','paid') DEFAULT 'unpaid' COMMENT 'unpaid: Chưa nộp, partially_paid: Còn nợ, paid: Đã nộp đủ',
  `payment_date` date DEFAULT NULL COMMENT 'Ngày thanh toán tiền',
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_code` (`invoice_code`),
  KEY `fk_invoices_room` (`room_id`),
  KEY `fk_invoices_tenant` (`tenant_id`),
  CONSTRAINT `fk_invoices_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'HD-202610-102',2,1,10,2026,2900000,200,332,132,3800,501600,20,23,3,30000,90000,150000,0,3641600,3641600,0,'paid','2026-10-05','Đã chuyển khoản qua Vietcombank đầy đủ','2026-10-27 00:42:08'),(2,'HD-202610-104',4,2,10,2026,3400000,156,244,88,3800,334400,40,45,5,30000,150000,150000,0,4034400,3400000,634400,'partially_paid','2026-10-07','Khách mới đóng tiền phòng, hẹn ngày 15 đóng nốt tiền điện nước 634,400đ','2026-10-27 00:42:08'),(3,'HD-202610-202',6,3,10,2026,3000000,117,226,109,3800,414200,25,29,4,30000,120000,150000,0,3684200,0,3684200,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09'),(4,'HD-202610-204',8,4,10,2026,3500000,267,357,90,3800,342000,46,49,3,30000,90000,150000,0,4082000,0,4082000,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09'),(5,'HD-202610-301',9,5,10,2026,3400000,208,287,79,3800,300200,14,21,7,30000,210000,150000,0,4060200,0,4060200,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09'),(6,'HD-202610-303',11,6,10,2026,2600000,263,408,145,3800,551000,26,34,8,30000,240000,150000,0,3541000,2600000,941000,'partially_paid','2026-10-07','Khách mới đóng tiền phòng, hẹn ngày 15 đóng nốt tiền điện nước 941,000đ','2026-10-27 00:42:09'),(7,'HD-202610-304',12,7,10,2026,3600000,197,316,119,3800,452200,23,31,8,30000,240000,150000,0,4442200,0,4442200,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09'),(8,'HD-202610-403',15,8,10,2026,2600000,146,242,96,3800,364800,21,25,4,30000,120000,150000,0,3234800,0,3234800,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09'),(9,'HD-202610-404',16,9,10,2026,3600000,156,250,94,3800,357200,47,55,8,30000,240000,150000,0,4347200,4347200,0,'paid','2026-10-05','Đã chuyển khoản qua Vietcombank đầy đủ','2026-10-27 00:42:09'),(10,'HD-202610-502',18,10,10,2026,3000000,209,344,135,3800,513000,38,45,7,30000,210000,150000,0,3873000,3000000,873000,'partially_paid','2026-10-07','Khách mới đóng tiền phòng, hẹn ngày 15 đóng nốt tiền điện nước 873,000đ','2026-10-27 00:42:09'),(11,'HD-202610-504',20,11,10,2026,3500000,161,256,95,3800,361000,11,16,5,30000,150000,150000,0,4161000,4161000,0,'paid','2026-10-05','Đã chuyển khoản qua Vietcombank đầy đủ','2026-10-27 00:42:09'),(12,'HD-202610-602',22,12,10,2026,2900000,157,219,62,3800,235600,21,29,8,30000,240000,150000,0,3525600,0,3525600,'unpaid',NULL,'Chưa thanh toán, đã gửi thông báo nhắc đóng tiền qua Zalo','2026-10-27 00:42:09');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Tên khu vực',
  `slug` varchar(120) NOT NULL,
  `city` varchar(50) DEFAULT 'Hà Nội',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Quận Cầu Giấy','quan-cau-giay','Hà Nội','2026-10-27 00:07:43');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_requests`
--

DROP TABLE IF EXISTS `maintenance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `ticket_code` varchar(50) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `tenant_name` varchar(100) NOT NULL,
  `tenant_phone` varchar(20) NOT NULL,
  `category` varchar(50) NOT NULL,
  `urgency` enum('normal','urgent','emergency') DEFAULT 'normal',
  `description` text NOT NULL,
  `preferred_time` varchar(100) DEFAULT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `assigned_technician` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  KEY `idx_mr_tenant` (`tenant_id`),
  KEY `idx_mr_room` (`room_id`),
  KEY `room_number` (`room_number`),
  KEY `status` (`status`),
  CONSTRAINT `fk_mr_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mr_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (1,1,2,'SC-2026-102-01','102','Nguyễn Văn Minh','0981234567','dieuhoa','urgent','Điều hòa chảy nước ở máng thoát góc trong phòng, nhờ kỹ thuật vệ sinh lưới lọc và thông ống.','Sau 17h30 chiều các ngày trong tuần','processing','Đã hẹn thợ bảo dưỡng qua kiểm tra vào chiều nay.','Kỹ thuật viên Tuấn (0912 345 678)','2026-10-27 18:34:03','2026-10-27 18:34:03'),(2,3,6,'SC-2026-202-01','202','Lê Thị Thu Thảo','0972345678','dien','normal','Bóng đèn rọi ban công bị chập chờn khi bật công tắc.','Sáng thứ Bảy','pending','Chờ mua bóng led 9W thay thế.',NULL,'2026-10-27 18:34:03','2026-10-27 18:34:03'),(3,5,9,'SC-2026-301-01','301','Hoàng Anh Tuấn','0963456789','khoacua','normal','Cửa khóa thông minh báo pin yếu, nhờ tòa nhà hỗ trợ thay 4 viên pin AA.','Bất kỳ lúc nào, chìa khóa gửi lễ tân','completed','Đã thay 4 pin Panasonic Alkaline mới 100%, khóa hoạt động bình thường.','BQL EcoHouse','2026-10-27 18:34:03','2026-10-27 18:34:03');
/*!40000 ALTER TABLE `maintenance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_images`
--

DROP TABLE IF EXISTS `room_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_images_room` (`room_id`),
  CONSTRAINT `fk_images_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_images`
--

LOCK TABLES `room_images` WRITE;
/*!40000 ALTER TABLE `room_images` DISABLE KEYS */;
INSERT INTO `room_images` VALUES (121,1,'real_room_101_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:11'),(122,1,'real_room_101_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:11'),(123,1,'real_room_101_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:11'),(124,1,'real_room_101_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:11'),(125,2,'real_room_102_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:12'),(126,2,'real_room_102_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:12'),(127,2,'real_room_102_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:12'),(128,2,'real_room_102_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:12'),(129,2,'real_room_102_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:12'),(130,2,'real_room_102_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:12'),(131,3,'real_room_103_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:13'),(132,3,'real_room_103_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:13'),(133,3,'real_room_103_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:13'),(134,3,'real_room_103_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:13'),(135,3,'real_room_103_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:13'),(136,3,'real_room_103_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:13'),(137,4,'real_room_104_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:14'),(138,4,'real_room_104_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:14'),(139,4,'real_room_104_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:14'),(140,4,'real_room_104_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:14'),(141,4,'real_room_104_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:14'),(142,4,'real_room_104_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:14'),(143,5,'real_room_201_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:16'),(144,5,'real_room_201_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:16'),(145,5,'real_room_201_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:16'),(146,5,'real_room_201_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:16'),(147,5,'real_room_201_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:16'),(148,5,'real_room_201_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:16'),(149,6,'real_room_202_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:17'),(150,6,'real_room_202_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:17'),(151,6,'real_room_202_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:17'),(152,6,'real_room_202_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:17'),(153,6,'real_room_202_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:17'),(154,6,'real_room_202_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:17'),(155,7,'real_room_203_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:18'),(156,7,'real_room_203_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:18'),(157,7,'real_room_203_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:18'),(158,7,'real_room_203_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:18'),(159,8,'real_room_204_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:19'),(160,8,'real_room_204_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:19'),(161,8,'real_room_204_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:19'),(162,8,'real_room_204_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:19'),(163,8,'real_room_204_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:19'),(164,8,'real_room_204_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:19'),(165,9,'real_room_301_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:20'),(166,9,'real_room_301_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:20'),(167,9,'real_room_301_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:20'),(168,9,'real_room_301_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:20'),(169,9,'real_room_301_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:20'),(170,9,'real_room_301_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:20'),(171,10,'real_room_302_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:21'),(172,10,'real_room_302_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:21'),(173,10,'real_room_302_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:21'),(174,10,'real_room_302_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:21'),(175,10,'real_room_302_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:21'),(176,10,'real_room_302_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:21'),(177,11,'real_room_303_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:22'),(178,11,'real_room_303_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:22'),(179,11,'real_room_303_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:22'),(180,11,'real_room_303_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:22'),(181,11,'real_room_303_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:22'),(182,11,'real_room_303_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:22'),(183,12,'real_room_304_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:23'),(184,12,'real_room_304_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:23'),(185,12,'real_room_304_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:23'),(186,12,'real_room_304_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:23'),(187,12,'real_room_304_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:23'),(188,13,'real_room_401_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:25'),(189,13,'real_room_401_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:25'),(190,13,'real_room_401_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:25'),(191,13,'real_room_401_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:25'),(192,13,'real_room_401_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:25'),(193,13,'real_room_401_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:25'),(194,14,'real_room_402_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:26'),(195,14,'real_room_402_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:26'),(196,14,'real_room_402_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:26'),(197,14,'real_room_402_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:26'),(198,14,'real_room_402_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:26'),(199,15,'real_room_403_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:27'),(200,15,'real_room_403_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:27'),(201,15,'real_room_403_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:27'),(202,15,'real_room_403_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:27'),(203,15,'real_room_403_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:27'),(204,15,'real_room_403_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:27'),(205,16,'real_room_404_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:28'),(206,16,'real_room_404_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:28'),(207,16,'real_room_404_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:28'),(208,16,'real_room_404_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:28'),(209,16,'real_room_404_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:28'),(210,16,'real_room_404_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:28'),(211,17,'real_room_501_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:29'),(212,17,'real_room_501_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:29'),(213,17,'real_room_501_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:29'),(214,17,'real_room_501_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:29'),(215,17,'real_room_501_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:29'),(216,18,'real_room_502_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:30'),(217,18,'real_room_502_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:30'),(218,18,'real_room_502_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:30'),(219,18,'real_room_502_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:30'),(220,18,'real_room_502_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:30'),(221,18,'real_room_502_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:30'),(222,19,'real_room_503_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:32'),(223,19,'real_room_503_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:32'),(224,19,'real_room_503_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:32'),(225,19,'real_room_503_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:32'),(226,19,'real_room_503_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:32'),(227,20,'real_room_504_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:33'),(228,20,'real_room_504_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:33'),(229,20,'real_room_504_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:33'),(230,20,'real_room_504_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:33'),(231,20,'real_room_504_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:33'),(232,20,'real_room_504_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:33'),(233,21,'real_room_601_1.jpg','Toàn cảnh căn hộ & Giường ngủ','2026-10-27 01:28:34'),(234,21,'real_room_601_2.jpg','Khu vực bếp nấu & Đảo bếp','2026-10-27 01:28:34'),(235,21,'real_room_601_3.jpg','Nhà vệ sinh khép kín','2026-10-27 01:28:34'),(236,21,'real_room_601_4.jpg','Ban công & Sân phơi máy giặt','2026-10-27 01:28:34'),(237,21,'real_room_601_5.jpg','Bàn làm việc & Tủ quần áo','2026-10-27 01:28:34'),(238,22,'real_room_602_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:35'),(239,22,'real_room_602_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:35'),(240,22,'real_room_602_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:35'),(241,22,'real_room_602_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:35'),(242,22,'real_room_602_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:35'),(243,22,'real_room_602_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:35'),(244,23,'real_room_603_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:36'),(245,23,'real_room_603_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:36'),(246,23,'real_room_603_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:36'),(247,23,'real_room_603_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:36'),(248,23,'real_room_603_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:36'),(249,23,'real_room_603_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:36'),(250,24,'real_room_604_1.jpg','Ảnh góc chụp 1','2026-10-27 01:28:38'),(251,24,'real_room_604_2.jpg','Ảnh góc chụp 2','2026-10-27 01:28:38'),(252,24,'real_room_604_3.jpg','Ảnh góc chụp 3','2026-10-27 01:28:38'),(253,24,'real_room_604_4.jpg','Ảnh góc chụp 4','2026-10-27 01:28:38'),(254,24,'real_room_604_5.jpg','Ảnh góc chụp 5','2026-10-27 01:28:38'),(255,24,'real_room_604_6.jpg','Ảnh góc chụp 6','2026-10-27 01:28:38');
/*!40000 ALTER TABLE `room_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề phòng',
  `floor` tinyint(4) NOT NULL DEFAULT 1 COMMENT 'Tầng số (1 đến 6)',
  `room_number` varchar(50) NOT NULL DEFAULT '101' COMMENT 'Số phòng',
  `slug` varchar(255) NOT NULL COMMENT 'Slug URL',
  `category_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `price` decimal(12,0) NOT NULL COMMENT 'Giá thuê (VNĐ/tháng)',
  `area` float NOT NULL COMMENT 'Diện tích m2',
  `electricity_price` decimal(10,0) DEFAULT 3800,
  `water_price` decimal(10,0) DEFAULT 30000,
  `max_occupants` int(11) DEFAULT 2,
  `image` varchar(255) DEFAULT 'default-room.jpg',
  `description` text NOT NULL,
  `amenities` text DEFAULT NULL,
  `status` enum('available','rented','maintenance') DEFAULT 'available',
  `views` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_rooms_location` (`location_id`),
  KEY `idx_rooms_price` (`price`),
  KEY `idx_rooms_status` (`status`),
  KEY `idx_rooms_floor` (`floor`),
  KEY `idx_rooms_category` (`category_id`),
  CONSTRAINT `fk_rooms_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_rooms_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'Phòng 101 - Căn hộ Studio 25m² ban công thoáng mát, tầng 1 tiện đi lại',1,'101','phong-101-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3200000,32,3800,30000,2,'real_room_101_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 101 (TẦNG 1) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Cho thuê căn hộ 40 m² có máy giặt riêng gần chợ , quận , giáp khu vực Cầu Giấy</p><p>Địa chỉ: khu Cầu Giấy </p><p>* Ra vào vân tay</p><p>* Giờ giấc tự do</p><p>* An ninh cao</p><p> ️0903-79-0930 ( hỗ trợ tìm phòng 24/7 theo nhu cầu ) 1</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',167,'2026-10-27 00:07:43','2026-10-29 14:44:34'),(2,'Phòng 102 - Căn hộ gác lửng 22m² hiện đại, tối ưu không gian sinh hoạt',1,'102','phong-102-ccmn-2',2,1,'Số 18, Ngõ 86 Cầu Giấy',2900000,22,3800,30000,2,'real_room_102_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 102 (TẦNG 1) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Cho thuê căn hộ mini mới xây, đầy đủ nội thất tiện nhi tại 27/18H đường khu Cầu Giấy, . Tòa nhà có thang máy di chuyển tiện lợi</p><p>Tặng ngay 2 triệu cho khách mới HĐ tối thiểu 6 tháng..</p><p>Diện tích 22m². Giá 4,5 triệu/th.</p><p>Nội thất y như hình mỗi phòng có tủ quần áo, bàn ăn, kệ giày, máy lạnh, sạp giường rộng</p><p>Phòng có cửa sổ lớn sử dụng kính màu cách nhiệt tạo không khí thoáng mát, có rèm cửa.</p><p>Toilet sử dụng riêng có cửa sổ nhỏ thoáng mát</p><p>Tủ bếp sử dụng riêng (chỉ sử dụng bếp từ).</p><p>Nước nóng năng lượng mặt trời</p><p>3 máy giặt, sử dụng miễn phí tại sân thượng.</p><p>Giờ giấc tự do, không chung chủ.</p><p>Cửa cổng và cửa phòng sử dụng thẻ từ. Có hệ thống camera an ninh.</p><p>Có hệ thống lọc nước hiện đại, có thể uống trực tiếp không cần đun sôi (miễn phí).</p><p>Tủ lạnh inverter 2 cửa, wifi, mỗi phòng có 1 chỗ đậu xe... Đều miễn phí.</p><p>- Điện 3500đ/kw, nước 100.000đ/người.</p><p>- Cọc 10 triệu. Giá 4,5 triệu/th. Thanks.</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',214,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(3,'Phòng 103 - Phòng đơn khép kín 18m² giá bình dân, vệ sinh riêng sạch sẽ',1,'103','phong-103-ccmn-2',2,1,'Số 18, Ngõ 86 Cầu Giấy',2500000,32,3800,30000,2,'real_room_103_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 103 (TẦNG 1) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Vị trí: Đường Lê Tấn Quốc, TP. Hà Nội</p><p>• Duplex thiết kế 2 tầng hiện đại, tối ưu không gian sinh hoạt</p><p>• Full nội thất, xách vali vào ở ngay</p><p>• Không gian riêng tư, tiện nghi đầy đủ</p><p>• Phù hợp cho người đi làm, cặp đôi hoặc sinh viên</p><p>• Khu vực có nhiều quán ăn, cà phê và cửa hàng tiện lợi</p><p>• Thuận tiện di chuyển đến Tân Sơn Nhất và các khu vực lân cận</p><p>Zalo/Call: 0912.xxx.xxx (Ban quản lý) – Doan Trang</p><p>Inbox nhận hình ảnh, video thực tế và hẹn lịch xem phòng. Hỗ trợ tư vấn tìm phòng miễn phí!</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',96,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(4,'Phòng 104 - Căn hộ mini 28m² thiết kế 2 gian tách bếp riêng biệt',1,'104','phong-104-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3400000,32,3800,30000,3,'real_room_104_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 104 (TẦNG 1) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHÍNH CHỦ CHO THUÊ PHÒNG BAN CÔNG SIU THOÁNG mặt tiền Đường số, phường Tân Quy, Q7.</p><p>- Phòng mới hoàn thiện đưa vào sử dụng.</p><p>- Nội thất mới 100%. full tủ quần áo, giường gỗ, tủ lạnh, máy lạnh, tủ bếp, bếp từ, máy giặt riêng….</p><p>- Tách bếp, cửa sổ, ban công rộng…</p><p>- Phòng đảm bảo yên tĩnh, riêng tư, bảo mật…</p><p>Giá 10,5 triệu.</p><p>Lh: chính chủ để xem phòng.</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',341,'2026-10-27 00:07:43','2026-10-29 13:09:05'),(5,'Phòng 201 - Căn hộ Studio 25m² ban công đón sáng, nội thất gỗ cao cấp',2,'201','phong-201-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3300000,32,3800,30000,2,'real_room_201_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 201 (TẦNG 2) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CĂN HỘ GREEN HOUSE Q12 – ĐẦY ĐỦ NỘI THẤT, CHỈ XÁCH VALI VÀO Ở!</p><p>Phòng được trang bị đầy đủ tiện nghi:</p><p>️ Máy lạnh mát mẻ</p><p>Tủ lạnh riêng</p><p>️ Giường ngủ tiện nghi</p><p>Bếp điện nấu ăn</p><p>Nồi, chén, dĩa và dụng cụ nấu ăn</p><p>Tủ đựng quần áo và đồ dùng cá nhân</p><p>Nhà vệ sinh riêng, sạch sẽ</p><p>An ninh đảm bảo, cửa phòng vân tay, cửa ra vào nhận diện khuôn mặt, camera giám sát 24/24.</p><p>Không gian sạch sẽ, tiện nghi, phù hợp cho sinh viên, nhân viên văn phòng và người đi làm.</p><p>Căn Hộ Green House Q12</p><p>Đầy đủ nội thất – Tiện nghi như ở nhà – Dọn vào ở ngay!</p><p>Inbox ngay để được tư vấn và giữ phòng nhé!</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',182,'2026-10-27 00:07:43','2026-10-29 14:37:06'),(6,'Phòng 202 - Căn hộ gác lửng 23m² thông minh, trần cao thoáng đãng',2,'202','phong-202-ccmn-2',2,1,'Số 18, Ngõ 86 Cầu Giấy',3000000,32,3800,30000,2,'real_room_202_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 202 (TẦNG 2) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Căn hộ mới bóc seal nằm ngay đường , giá chỉ từ 6.x triệu/tháng</p><p>- Vị trí gần ĐH Văn Hiến, Uỷ Ban Phường , BV đa khoa …</p><p>- Phòng full nội thất: giường, nệm, tủ áo, máy lạnh, máy giặt, tủ lạnh, bếp, hút mùi ….</p><p>- Phòng cửa sổ - full nội thất giá chỉ từ 6x</p><p>- Phòng cửa sổ + bancol full nội thất chỉ từ 7x</p><p>- Đặc biệt nhận xe điện và free 2 xe máy bất kì</p><p>- số lượng có hạn, hỗ trợ giữ phòng đến tháng 11/2026</p><p>- Liên hệ xem phòng và tư vấn chi tiết: 0912.xxx.xxx (Ban quản lý) Huỳnh ( zalo )</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',125,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(7,'Phòng 203 - Phòng đơn khép kín 19m² cửa sổ lớn đón gió, an ninh tốt',2,'203','phong-203-ccmn-1',1,1,'Số 18, Ngõ 86 Cầu Giấy',2600000,32,3800,30000,2,'real_room_203_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 203 (TẦNG 2) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Trống 1Ngủ 1Khách Ngõ 37/3 Dịch Vọng Hậu</p><p>Vị trí thuận tiện</p><p>️Phòng FULL nội thất</p><p>️Ngõ rộng oto đậu cửa</p><p>- Nhà cách chỗ gửi xe ô tô 20m.</p><p>Xung quanh tiện ích ngập tran: Chợ Dịch Vọng, công viên cầu giấy, ngõ thông tư phía...</p><p>- Không nhận xe điện. Có nhận khách nước ngoài</p><p>- Nhà xây thang máy, giờ giấc tự do, khóa vân tay</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',160,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(8,'Phòng 204 - Căn hộ mini 30m² tách bếp riêng biệt, thang máy hiện đại',2,'204','phong-204-ccmn-4',4,1,'Số 18, Ngõ 86 Cầu Giấy',3500000,32,3800,30000,3,'real_room_204_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 204 (TẦNG 2) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Cho thuê căn hộ 1 PN, đầy đủ tiện nghi Đường Hoàng Việt, tiện đi </p><p>* Giảm ngay 500k cho khách cọc họp đồng 12tháng</p><p>* Phòng có cửa sổ thông thoáng</p><p>* Full nội thất</p><p>* Có thang máy</p><p>* Khu giặt sấy, BBQ riêng</p><p>- Gần sân vận động quân khu 7, công viên Hoàng Văn Thụ, gần các chợ truyền thống, siêu thị, trung tâm thương mại Vincom Plaza Cộng Hòa (khoảng 800m)</p><p>Liên hệ: (zalo/call): 0912.xxx.xxx (Ban quản lý) - Chiêu Lin</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',275,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(9,'Phòng 301 - Căn hộ Studio 25m² ban công rộng, đầy đủ điều hòa nóng lạnh',3,'301','phong-301-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3400000,32,3800,30000,2,'real_room_301_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 301 (TẦNG 3) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Giá: 13.500.000đ/tháng</p><p>Căn hộ:</p><p>° diện tích 40m²</p><p>° full nội thất</p><p>° cửa sổ thoáng mát</p><p>° thang máy</p><p>° có khu giặt sấy riêng</p><p>° khu vực bảo toàn an ninh</p><p>Tiện ích:</p><p>° ở khu trung tâm tiện di chuyển khu vực Tân Sơn Nhất - Công viên Hoàng Văn Thụ - Vincom Plaza - và các khung đường lớn như Cộng Hòa - Cách mạng tháng 8,...</p><p>° gần các tiện ích công cộng như chợ, bệnh viện Thống Nhất, trường Cao đẳng Lý Tự Trọng,...</p><p>Liên hệ (zalo/call) : 0912.xxx.xxx (Ban quản lý) - Minh Tuệ</p><p>Ibox để biết thêm về thông tin chi tiết và hẹn lịch xem phòng nhé!</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',191,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(10,'Phòng 302 - Căn hộ gác lửng 23m² phong cách trẻ trung, khóa vân tay',3,'302','phong-302-ccmn-2',2,1,'Số 18, Ngõ 86 Cầu Giấy',3100000,32,3800,30000,2,'real_room_302_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 302 (TẦNG 3) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ MINI FULL NỘI THẤT CÓ CỬA SỐ LỚN</p><p>Địa chỉ: Cách Mạng Tháng 8, khu vực Cầu Giấy0, Hà Nội.</p><p>Gần: Công viên Lê Thị Riêng, Ngã Sáu Dân Chủ, Bệnh viện Đa khoa Vạn Hạnh, khu vực Cầu Giấy (~4km), (~1,7km)</p><p>Tiện ích</p><p>• Camera an ninh</p><p>• Nhà xe lớn</p><p>• Thang máy</p><p>Tình trạng phòng: Trống từ ngày 08/12</p><p>Liện hệ: 0912.xxx.xxx (Ban quản lý) - Bá Unite</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',220,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(11,'Phòng 303 - Phòng đơn khép kín 19m² yên tĩnh, phù hợp sinh viên người đi làm',3,'303','phong-303-ccmn-4',4,1,'Số 18, Ngõ 86 Cầu Giấy',2600000,32,3800,30000,2,'real_room_303_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 303 (TẦNG 3) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p> CĂN HỘ DỊCH VỤ 1PN FULL NỘI THẤT – TÂN BÌNH</p><p> Vị trí thuận tiện – Tiện ích đầy đủ – Giá thuê cực tốt!</p><p> ƯU ĐÃI ĐẶC BIỆT: GIẢM NGAY 500K khi ký hợp đồng 12 tháng!</p><p>️ NỘI THẤT ĐẦY ĐỦ – XÁCH VALI VÀO Ở</p><p>️ Giường, tủ quần áo, sofa, bàn ăn, bàn làm việc</p><p>️ Tivi, máy lạnh, tủ lạnh</p><p>️ Nước nóng năng lượng mặt trời</p><p> TIỆN ÍCH NỔI BẬT</p><p> Thang máy, camera an ninh 24/7</p><p> Vệ sinh phòng 1 lần/tuần</p><p> Khu giặt sấy tiện lợi</p><p> Khu BBQ thư giãn</p><p> Đặc biệt: Cho phép nuôi thú cưng!</p><p> VỊ TRÍ ĐẮC ĐỊA – KẾT NỐI THUẬN TIỆN</p><p> Dễ dàng di chuyển đến đường Hoàng Việt, Hoàng Văn Thụ, Cộng Hòa, Trường Chinh và khu vực Tân Sơn Nhất.</p><p>Thuận tiện kết nối , và các quận trung tâm.</p><p>️ Gần các địa điểm mua sắm, ăn uống và vui chơi:</p><p>• Công viên Hoàng Văn Thụ</p><p>• Trung tâm thương mại Pico Plaza</p><p>• Siêu thị WinMart và khu Sky Center</p><p>• Nhiều quán cà phê, cửa hàng tiện lợi, quán ăn xung quanh</p><p> Thuận tiện đến các trường:</p><p>• Học viện Hàng không Việt Nam</p><p>• Trường Đại học Tài nguyên và Môi trường Hà Nội</p><p>• Các trường học, trung tâm ngoại ngữ trong khu vực</p><p> Phù hợp cho người đi làm, sinh viên hoặc các cặp đôi đang tìm không gian sống tiện nghi tại .</p><p> Inbox ngay để nhận lịch xem phòng!</p><p>️ Liên hệ/Zalo: 0912.xxx.xxx (Ban quản lý) – Minh Thư</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',110,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(12,'Phòng 304 - Căn hộ mini 30m² gian ngủ và bếp tách biệt, không ám mùi',3,'304','phong-304-ccmn-4',4,1,'Số 18, Ngõ 86 Cầu Giấy',3600000,30,3800,30000,3,'real_room_304_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 304 (TẦNG 3) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Do mình chuyển công tác nên cần pass lại phòng ở nghách 46 Ngõ 445 .</p><p>Giá chỉ 5tr/th.</p><p>Cách ĐH Nội Vụ 800m</p><p>Ra Hồ Tây 300m</p><p>Thiết kế: Phòng khép kín diện tích 30 m2 rộng rãi, Sạch sẽ thoáng mát, PCCC từng phòng. Ngõ rộng 2 ô tô tránh nhau, khu vực dân trí cao, an ninh tốt</p><p>Nội thất: Điều hòa, nóng lạnh, giường, tủ, kệ bếp, bếp từ, hút mùi, thang máy, camera cổng vân tay</p><p>️ Điện 4k/số; nước 35k/khối; internet 100k/phòng, gửi xe free, vệ sinh 60k/người, thang máy 50k/ người</p><p>Quan tâm ib zalo hoặc liên hệ sdt mình: 0912.xxx.xxx (Ban quản lý) để qua xem trực tiếp</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',305,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(13,'Phòng 401 - Căn hộ Studio 25m² ban công thoáng đãng, view mở đón gió',4,'401','phong-401-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3400000,33,3800,30000,2,'real_room_401_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 401 (TẦNG 4) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ 1 PHÒNG NGỦ – NGUYỄN BỈNH KHIÊM, QUẬN 1</p><p>Căn hộ xinh xắn ngay trung tâm khu vực Cầu Giấy, đầy đủ nội thất, có ban công thoáng mát – phù hợp cho người đi làm hoặc các cặp đôi đang tìm kiếm không gian sống tiện nghi.</p><p>Vị trí: Đường Nguyễn Bỉnh Khiêm, khu vực Cầu Giấy, Hà Nội</p><p>THÔNG TIN CĂN HỘ</p><p> Diện tích: 33m²</p><p> Thiết kế: 1 phòng ngủ</p><p> Ban công riêng, không gian thông thoáng</p><p> Full nội thất – chỉ cần xách vali vào ở</p><p> Vị trí trung tâm, thuận tiện di chuyển và sinh hoạt </p><p>GIÁ THUÊ: 12 TRIỆU/THÁNG</p><p> Không gian sống tiện nghi, thoải mái, phù hợp với khách hàng yêu thích cuộc sống ngay trung tâm thành phố.</p><p>Quan tâm căn hộ, inbox ngay để được tư vấn và đặt lịch xem phòng!</p><p>Liên hệ: 0912.xxx.xxx (Ban quản lý)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',241,'2026-10-27 00:07:43','2026-10-28 08:22:57'),(14,'Phòng 402 - Căn hộ gác lửng 23m² thiết kế ấm cúng, full giường tủ nệm',4,'402','phong-402-ccmn-2',2,1,'Số 18, Ngõ 86 Cầu Giấy',3100000,32,3800,30000,2,'real_room_402_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 402 (TẦNG 4) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Cho thuê căn hộ mini tại 22 HẠ YÊN QUYẾT, YÊN HOA (Đi Ngõ 251 Nguyễn Khang VÀO) </p><p>Nội thât : Giường, đệm, kệ sách , tủ lạnh , tủ bếp, hút mùi, bếp từ âm, .bàn làm việc, nồi cơm điện, ấm siêu tốc, tivi, khóa vân tay từng phòng, tủ giày, máy giặt chung,…</p><p>Gần ngay trường đại học Gia thông Vận tải</p><p>Liên hệ xem phòng 0912.xxx.xxx (Ban quản lý)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','maintenance',85,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(15,'Phòng 403 - Phòng đơn khép kín 19m² sạch đẹp, thiết bị vệ sinh tiện nghi',4,'403','phong-403-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',2600000,32,3800,30000,2,'real_room_403_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 403 (TẦNG 4) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ DỊCH VỤ FULL NỘI THẤT – PHÚ NHUẬN</p><p>Địa chỉ: Nguyễn Công Hoan, Hà Nội</p><p>TIỆN NGHI – THOÁNG MÁT – VÀO Ở NGAY</p><p>️ Vị trí thuận tiện:</p><p>Gần chợ </p><p>Gần Trường Quốc tế TIS</p><p>Dễ dàng di chuyển ra các tuyến đường lớn: Phan Xích Long, Phan Đình Phùng, Nguyễn Kiệm và các khu vực lân cận.</p><p>Tiện ích nổi bật:</p><p>️ Full nội thất, chỉ cần xách vali vào ở</p><p>Có ban công thoáng mát</p><p>Trang bị thang máy, di chuyển thuận tiện</p><p>Không gian sạch sẽ, an ninh</p><p>Vị trí thuận tiện di chuyển đến các khu vực lân cận</p><p>Phòng đẹp, đầy đủ nội thất, vị trí thuận tiện – có phòng sẵn, xem phòng và vào ở ngay!</p><p>Quan tâm inbox để nhận thông tin chi tiết và đặt lịch xem phòng nhé!</p><p>️ Liên hệ/Zalo: 0912.xxx.xxx (Ban quản lý)</p><p>Nhanh tay liên hệ để chọn căn phù hợp với nhu cầu của bạn!</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',146,'2026-10-27 00:07:43','2026-10-28 08:22:45'),(16,'Phòng 404 - Căn hộ mini 30m² 2 gian rộng thoáng, nhiều ánh sáng tự nhiên',4,'404','phong-404-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3600000,32,3800,30000,3,'real_room_404_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 404 (TẦNG 4) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CĂN HỘ SIÊU THOÁNG - FULL NỘI THẤT</p><p>20 Đường Bờ Bao Tân Thắng, Phường Tây Thạnh</p><p>Studio - Bancol siêu thoáng</p><p>Full nội thất</p><p>Không chung chủ</p><p>Giờ giấc tự do</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',216,'2026-10-27 00:07:43','2026-10-29 13:36:46'),(17,'Phòng 501 - Căn hộ Studio 25m² tầng 5 ban công thoáng gió, view ngắm cảnh',5,'501','phong-501-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3300000,32,3800,30000,2,'real_room_501_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 501 (TẦNG 5) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ 1PN - Ban công full nội thất</p><p>Mai Văn Vĩnh, Tân Quy, Q7</p><p>Điện: 4.000/kwh</p><p>Nước: 100.000đ/ người</p><p>Free 2 xe máy</p><p>Liên hệ xem phòng &amp; tư vấn: 0912.xxx.xxx (Ban quản lý)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',198,'2026-10-27 00:07:43','2026-10-27 01:51:57'),(18,'Phòng 502 - Căn hộ gác lửng 23m² thông thoáng, nội thất mới đồng bộ',5,'502','phong-502-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3000000,32,3800,30000,2,'real_room_502_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 502 (TẦNG 5) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ MINI</p><p>- Địa chỉ : Đường Cách Mạng Tháng 8 Q10</p><p>- Phòng thoáng mát sạch sẽ</p><p>- Full nội thất</p><p>- Cửa sổ thoáng mát</p><p>Vị Trí Trung Tâm : Gần Bệnh Viện ĐK Vạn Hạnh , Vạn Hạnh Mall , Trường tiểu học Lê Thị Riêng và các tiện ích khác</p><p>Call me/Zalo :0912.xxx.xxx (Ban quản lý) - Anh Tuấn</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',131,'2026-10-27 00:07:43','2026-10-28 08:23:31'),(19,'Phòng 503 - Phòng đơn khép kín 19m² tầng 5 yên tĩnh, thoáng mát',5,'503','phong-503-ccmn-1',1,1,'Số 18, Ngõ 86 Cầu Giấy',2500000,32,3800,30000,2,'real_room_503_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 503 (TẦNG 5) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CHO THUÊ CĂN HỘ 45M² 1N+ TẠI 105 BÙI THỊ XUÂN, HAI BÀ TRƯNG, HÀ NỘI - TẶNG 2 TRIỆU</p><p>* Địa chỉ: 105 , Hai Bà Trưng, Hà Nội</p><p>* Diện tích: 45m², có cửa sổ thoáng mát.</p><p>- Tầng 7 riêng tư, có sân view đằng trc thoáng mát , phơi đồ thoải mái. Căn có vị trí đẹp nhất của toà.</p><p>- Full nội thất: Điều hòa, nóng lạnh, giường, tủ, kệ bếp, tủ bếp, bàn ăn, sofa, tivi, đệm…</p><p>- Nhà mới, sạch sẽ, thoáng mát.</p><p>- Tòa nhà có thang máy, cửa vân tay và camera an ninh.</p><p>- Tiện ích: 2 máy giặt chung miễn phí, khu để xe tầng 1.</p><p>-&gt;Thuận tiện di chuyển đến Phố Huế, Bà Triệu, Triệu Việt Vương, Đại Cồ Việt, Xã Đàn, Bạch Mai…</p><p>- Phù hợp với người đi làm và sinh hoạt tại khu vực nội thành.</p><p>* GIÁ THUÊ : 9tr / tháng ( nhận nhà 24/10 tặng 2tr )</p><p>- Điện 4.000₫/ số , Nước : 150k/ người</p><p>- Thang máy , rác , vệ sinh chung..... : 80k / người</p><p>- Mạng : 100k/ phòng , máy sấy : 100k/ phòng</p><p>- Free: Máy giặt chung , để xe / free</p><p>=&gt; Zalo trao đổi chi tiết : 0912.xxx.xxx (Ban quản lý)</p><p>(Miễn trung gian)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',170,'2026-10-27 00:07:43','2026-10-27 01:51:58'),(20,'Phòng 504 - Căn hộ mini 30m² 2 gian riêng tư, khu bếp nấu tiện lợi',5,'504','phong-504-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3500000,32,3800,30000,3,'real_room_504_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 504 (TẦNG 5) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CĂN HỘ STUDIO FULL NỘI THẤT  CẦN CHO THUÊ NGAY</p><p>Địa chỉ: Cách Mạng Tháng 8, khu vực Cầu Giấy0 (ngày 8/12 có thể dọn vào)</p><p>Phòng full nội thất, rộng rãi, cửa sổ thoáng mát</p><p>Vị trí đắc địa:</p><p>- Gần Ga Hà Nội, trung tâm thương mại,…</p><p>- Thuận tiện di chuyển các trường ĐH, quận trung tâm (khu vực Cầu Giấy, 3, 5, 10,…), quận lân cận và những khu vui chơi, dịch vụ sầm uất,…</p><p>Inbox ngay để được tư vấn và hẹn lịch xem phòng!</p><p>LH/Zalo: 0912.xxx.xxx (Ban quản lý)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',360,'2026-10-27 00:07:43','2026-10-27 01:51:58'),(21,'Phòng 601 - Căn hộ Studio 24m² tầng cao view thoáng, sát sân phơi có mái che',6,'601','phong-601-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3000000,32,3800,30000,2,'real_room_601_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 601 (TẦNG 6) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Cho thuê căn hộ mini đầy đủ tiện nghi tại Cầu Giấy, Hà Nội, Hà Nội!</p><p>• Giường, tủ quần áo, TV</p><p>• Khu vực bếp tiện nghi</p><p>• Nhà vệ sinh riêng</p><p>• Ban công/sân phơi thoáng mát</p><p>• Tòa nhà có thang máy</p><p>VỊ TRÍ THUẬN TIỆN</p><p>• Gần chợ, siêu thị và trường học</p><p>• Có công viên trong khu vực</p><p>• Thuận tiện di chuyển đến các khu vực lân cận như khu vực Cầu Giấy, </p><p>LIÊN HỆ NGAY: 0912.xxx.xxx (Ban quản lý)</p><p>Nhắn tin hoặc gọi điện để được tư vấn và biết thêm chi tiết nhé!</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',436,'2026-10-27 00:07:43','2026-10-27 18:51:58'),(22,'Phòng 602 - Căn hộ gác lửng 22m² trần chống nóng, không gian thoáng đãng',6,'602','phong-602-ccmn-4',4,1,'Số 18, Ngõ 86 Cầu Giấy',2800000,32,3800,30000,2,'real_room_602_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 602 (TẦNG 6) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>Căn hộ mới xây full nội thất</p><p>- Đường , kế bên ĐH Văn Hiến, uỷ ban phường , bệnh viện đa khoa </p><p>- Giáp khu vực Cầu Giấy1, Bình Tân …</p><p>- Full nội thất gồm: giường, tủ, nệm, sofa, tủ giày, tủ bếp, máy giặt, máy lạnh, tủ lạnh, hút mùi bếp …</p><p>- Phòng tách bếp 1PN + 1PK như hình</p><p>- ĐẶC BIỆT có nhận xe điện và miễn phí để xe</p><p>Nhanh tay liên hệ xem trực tiếp và giữ chổ 0912.xxx.xxx (Ban quản lý) ( còn 1p như hình 7,8tr/ tháng )</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','rented',175,'2026-10-27 00:07:43','2026-10-27 01:51:58'),(23,'Phòng 603 - Phòng đơn khép kín 18m² giá tiết kiệm tầng 6, yên tĩnh riêng tư',6,'603','phong-603-ccmn-1',1,1,'Số 18, Ngõ 86 Cầu Giấy',2400000,32,3800,30000,2,'real_room_603_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 603 (TẦNG 6) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CĂN HỘ MINI FULL NỘI THẤT QUẬN 10</p><p>Thuận tiện di chuyển sang khu vực Cầu Giấy0, khu vực Cầu Giấy, </p><p>Gần công viên văn hoá Lê Thị Riêng, Đường Điện Biên Phủ</p><p>Tiện ích: đầy đủ nội thất, cửa khoá vân tay, an ninh, PCCC</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','available',161,'2026-10-27 00:07:43','2026-10-27 01:51:58'),(24,'Phòng 604 - Căn hộ mini 28m² tách bếp, gần sân thượng phơi đồ rộng rãi',6,'604','phong-604-ccmn-3',3,1,'Số 18, Ngõ 86 Cầu Giấy',3200000,32,3800,30000,4,'real_room_604_1.jpg','<p><strong>CĂN HỘ CHUNG CƯ MINI PHÒNG 604 (TẦNG 6) - TÒA NHÀ ECO HOUSE CCMN</strong></p><p>CĂN HỘ 1 PHÒNG NGỦ - 1 PHÒNG KHÁCH | CÓ BAN CÔNG</p><p> K69 </p><p> 6 triệu/tháng</p><p> ~50m², tối đa 3ng</p><p> Tầng 3 – thang bộ</p><p>️ 1 phòng ngủ riêng biệt</p><p>️ Phòng khách • Bếp riêng</p><p> Full nội thất – đầy đủ tiện nghi</p><p> Điện: 4.000đ/kWh</p><p> Nước + phí dịch vụ: 100k/người</p><p> Lh Zalo: 0912.xxx.xxx (Ban quản lý)</p><p><strong>TIỆN ÍCH DÙNG CHUNG CỦA TÒA NHÀ:</strong><br> - Thang máy tốc độ cao thẻ từ phân tầng, thang bộ thoát hiểm chuẩn PCCC.<br> - Hệ thống camera giám sát an ninh 24/7 toàn bộ hành lang và khu để xe tầng 1.<br> - Cửa khóa vân tay ra vào tự do, không chung chủ, đảm bảo riêng tư tuyệt đối.<br> - Sân phơi đồ tầng 6 rộng rãi, có mái che chống mưa gió và máy giặt dùng chung.<br> - Biểu phí minh bạch: Điện 3.800đ/kWh, Nước 30.000đ/m³, Phí dịch vụ chung 150.000đ/phòng/tháng.</p>','Điều hòa Inverter, Bình nóng lạnh, Giường nệm ga gối, Tủ quần áo, Bàn làm việc, Kệ bếp chậu rửa, Cửa sổ/Ban công thoáng, Khóa cửa vân tay, Thang máy, Camera an ninh, Máy giặt dùng chung, Wifi tốc độ cao','maintenance',290,'2026-10-27 00:07:43','2026-10-27 01:51:58');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL COMMENT 'Họ tên người thuê đại diện',
  `phone` varchar(20) NOT NULL COMMENT 'Số điện thoại',
  `id_card` varchar(20) DEFAULT NULL COMMENT 'Số CCCD',
  `hometown` varchar(100) DEFAULT NULL COMMENT 'Quê quán',
  `deposit_amount` decimal(12,0) DEFAULT 0 COMMENT 'Tiền đặt cọc phòng',
  `contract_start` date NOT NULL COMMENT 'Ngày bắt đầu thuê',
  `contract_end` date DEFAULT NULL COMMENT 'Ngày hết hạn hợp đồng',
  `occupant_count` tinyint(4) DEFAULT 1 COMMENT 'Số người thực tế đang ở',
  `vehicle_count` tinyint(4) DEFAULT 1 COMMENT 'Số lượng xe máy gửi tầng 1',
  `status` enum('active','ended') DEFAULT 'active' COMMENT 'active: đang ở, ended: đã trả phòng',
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tenants_room` (`room_id`),
  CONSTRAINT `fk_tenants_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,2,'Nguyễn Văn Tuấn','0981234567','001201012345','Nam Định',2900000,'2026-08-01','2027-08-01',2,2,'active','Sinh viên ĐH Thương Mại ở cùng bạn thân','2026-10-27 00:42:08'),(2,4,'Trần Thu Trang','0978901234','034199008877','Thái Bình',3400000,'2026-05-15','2027-05-15',2,1,'active','Nhân viên văn phòng công ty gần Cầu Giấy','2026-10-27 00:42:08'),(3,6,'Lê Hoàng Nam','0912456789','026198005544','Vĩnh Phúc',3000000,'2026-09-01','2027-03-01',2,2,'active','Làm việc IT tại Duy Tân','2026-10-27 00:42:09'),(4,8,'Vũ Thị Thanh Mai','0963852741','019197003322','Hải Dương',3500000,'2026-07-01','2027-07-01',3,2,'active','3 bạn sinh viên ĐH Quốc Gia ở ghép','2026-10-27 00:42:09'),(5,9,'Đỗ Mạnh Cường','0988776655','001200009988','Bắc Ninh',3400000,'2026-06-01','2027-06-01',1,1,'active','Kỹ sư xây dựng, đi làm cả ngày','2026-10-27 00:42:09'),(6,11,'Phạm Quỳnh Nga','0945678912','036199004411','Phú Thọ',2600000,'2026-09-15','2027-03-15',1,1,'active','Sinh viên Học viện Báo chí & Tuyên truyền','2026-10-27 00:42:09'),(7,12,'Hoàng Minh Đức','0932112233','030198007766','Ninh Bình',3600000,'2026-04-01','2027-04-01',2,2,'active','Vợ chồng trẻ mới cưới','2026-10-27 00:42:09'),(8,15,'Bùi Thúy Hằng','0977441122','025199006655','Hà Nam',2600000,'2026-08-15','2027-02-15',2,1,'active','Nhân viên kế toán','2026-10-27 00:42:09'),(9,16,'Ngô Đức Anh','0919887766','017196002233','Hưng Yên',3600000,'2026-05-01','2027-05-01',2,2,'active','Hai anh em cùng ở','2026-10-27 00:42:09'),(10,18,'Đinh Thị Thu Hà','0987332211','037199001199','Nghệ An',3000000,'2026-07-15','2027-01-15',2,2,'active','Sinh viên ĐH Sư Phạm','2026-10-27 00:42:09'),(11,20,'Phan Văn Hải','0904556677','022197008844','Quảng Ninh',3500000,'2026-06-15','2027-06-15',2,1,'active','Kinh doanh online','2026-10-27 00:42:09'),(12,22,'Tạ Quang Khải','0916778899','014198005522','Sơn La',2900000,'2026-09-01','2027-09-01',1,1,'active','Sinh viên năm cuối ĐH Giao thông','2026-10-27 00:42:09'),(13,5,'Đinh Đức Hoàn','0981744604','','Hà Nội',0,'2026-10-29','2027-04-29',2,2,'active','','2026-10-29 14:37:06');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','locked') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Đinh Đức Hoàn','0981744604','aaa@gmail.com','$2y$10$bM951HhVaLp4zBK9uO99ruKCIXm4.xvRxJwuvhBZ2r22I3TxInhsG','active','2026-10-29 06:35:57','2026-10-29 13:36:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ql_nhatro'
--

--
-- Dumping routines for database 'ql_nhatro'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02 15:33:02


-- ==========================================
-- NÂNG CẤP CỔNG CƯ DÂN (TENANT PORTAL)
-- ==========================================

-- ====================================================================
-- MIGRATION: NÂNG CẤP PHÂN HỆ TENANT / KHÁCH HÀNG PORTAL
-- Hệ thống: Quản lý & Giới thiệu Phòng trọ Thống Nhất
-- ====================================================================

-- 1. Cho phép room_id NULL để người dùng có thể đăng ký tài khoản trước khi được xếp phòng
ALTER TABLE `tenants` MODIFY COLUMN `room_id` int(11) NULL DEFAULT NULL;

-- 2. Bổ sung các trường phục vụ xác thực và hồ sơ người thuê vào bảng `tenants`
ALTER TABLE `tenants`
  ADD COLUMN `email` varchar(150) DEFAULT NULL AFTER `phone`,
  ADD COLUMN `password` varchar(255) DEFAULT NULL AFTER `email`,
  ADD COLUMN `avatar` varchar(255) DEFAULT 'default-avatar.svg' AFTER `password`,
  ADD COLUMN `portal_status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: Hoạt động, 0: Khóa tài khoản' AFTER `status`,
  ADD COLUMN `contract_notes` text DEFAULT NULL COMMENT 'Danh sách tài sản/nội thất bàn giao' AFTER `note`,
  ADD COLUMN `extension_status` enum('none','requested_extension','requested_leave') NOT NULL DEFAULT 'none' AFTER `contract_notes`,
  ADD COLUMN `extension_note` text DEFAULT NULL AFTER `extension_status`,
  ADD COLUMN `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `created_at`;

-- 3. Bổ sung các trường tải ảnh ủy nhiệm chi/bill chuyển khoản vào bảng `invoices`
ALTER TABLE `invoices`
  ADD COLUMN `payment_proof` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh bill chuyển khoản' AFTER `payment_date`,
  ADD COLUMN `payment_proof_note` text DEFAULT NULL COMMENT 'Ghi chú khi chuyển khoản' AFTER `payment_proof`,
  ADD COLUMN `payment_proof_time` datetime DEFAULT NULL COMMENT 'Thời gian tải bill' AFTER `payment_proof_note`,
  ADD COLUMN `payment_proof_status` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none' COMMENT 'none: Chưa nộp, pending: Chờ duyệt, approved: Đã duyệt, rejected: Từ chối' AFTER `payment_proof_time`;

-- 4. Tạo bảng thông báo `notifications`
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL COMMENT 'NULL: Thông báo chung toàn khu trọ, ID cụ thể: Thông báo cá nhân',
  `title` varchar(200) NOT NULL COMMENT 'Tiêu đề thông báo',
  `content` text NOT NULL COMMENT 'Nội dung thông báo chi tiết',
  `type` varchar(50) NOT NULL DEFAULT 'general' COMMENT 'general: Tin chung, invoice: Hóa đơn, maintenance: Sửa chữa, contract: Hợp đồng',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: Chưa đọc, 1: Đã đọc',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_tenant` (`tenant_id`),
  CONSTRAINT `fk_notifications_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Thêm dữ liệu thông báo mẫu
INSERT INTO `notifications` (`tenant_id`, `title`, `content`, `type`, `created_at`) VALUES
(NULL, 'Chào mừng cư dân đến với Cổng thông tin Nhà Trọ Thống Nhất', 'Cổng cư dân trực tuyến chính thức hoạt động giúp bạn dễ dàng theo dõi tiền phòng, kiểm tra chỉ số điện nước, gửi yêu cầu bảo dưỡng thiết bị và chuyển khoản thanh toán nhanh chóng.', 'general', NOW()),
(NULL, 'Nội quy nhà trọ & Giờ giấc sinh hoạt văn minh', 'Kính mong quý cư dân giữ trật tự sau 23h00, khóa cửa cổng cẩn thận khi ra vào và phân loại rác đúng nơi quy định tại tầng 1.', 'general', NOW()),
(1, 'Hóa đơn tiền phòng tháng này đã được cập nhật', 'Hóa đơn tiền phòng, tiền điện nước tháng hiện tại đã sẵn sàng. Bạn có thể kiểm tra chi tiết và chuyển khoản thanh toán ngay.', 'invoice', NOW());



-- Cập nhật mật khẩu mẫu 'tenant123' cho tất cả người thuê có sẵn
UPDATE `tenants` SET `password` = '$2y$10$YBu0H9rNfBCAhupJpRDY7OdnpAxELVK6c9bgeqKfuuIYnE2IjhTV2', `email` = CONCAT('tenant', `id`, '@thongnhat.vn') WHERE `password` IS NULL OR `password` = '';
