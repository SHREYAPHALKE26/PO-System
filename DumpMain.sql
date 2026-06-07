CREATE DATABASE  IF NOT EXISTS `posystem_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `posystem_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: posystem_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','26','{\"title\": \"Check 1\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-01 21:12:27'),(2,NULL,'QUOTE_SUBMITTED','QUOTE','25','{\"rfq_id\": 26, \"items_count\": 1, \"total_price\": 15000, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-01 21:13:20'),(3,NULL,'QUOTE_SUBMITTED','QUOTE','26','{\"rfq_id\": 26, \"items_count\": 1, \"total_price\": 15000, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-01 21:13:56'),(4,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','13','{\"rfq_id\": 26, \"quote_id\": \"25\", \"po_number\": \"PO-1764623656190\", \"vendor_id\": 12, \"total_amount\": \"15000.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-01 21:14:16'),(5,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','27','{\"title\": \"check for item \", \"items_count\": 12, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 10:52:29'),(6,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','28','{\"title\": \"check for updates\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:02:30'),(7,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','29','{\"title\": \"chcek for delete\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:05:48'),(8,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','30','{\"title\": \"cheke for delete\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:27:50'),(9,NULL,'QUOTE_SUBMITTED','QUOTE','27','{\"rfq_id\": 28, \"items_count\": 2, \"total_price\": 40, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:38:54'),(10,NULL,'QUOTE_SUBMITTED','QUOTE','28','{\"rfq_id\": 28, \"items_count\": 2, \"total_price\": 76, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:39:29'),(11,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','14','{\"rfq_id\": 28, \"quote_id\": \"28\", \"po_number\": \"PO-1764675755520\", \"vendor_id\": 12, \"total_amount\": \"76.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 11:42:35'),(12,NULL,'QUOTE_SUBMITTED','QUOTE','29','{\"rfq_id\": 28, \"items_count\": 2, \"total_price\": 18, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 14:44:57'),(13,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','31','{\"title\": \"check 24\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 18:41:18'),(14,NULL,'QUOTE_SUBMITTED','QUOTE','30','{\"rfq_id\": 31, \"items_count\": 1, \"total_price\": 132, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 20:15:51'),(15,'ec5ff8a7-ceee-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','15','{\"rfq_id\": 31, \"quote_id\": \"30\", \"po_number\": \"PO-1764706565500\", \"vendor_id\": 11, \"total_amount\": \"132.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 20:16:05'),(16,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','16','{\"rfq_id\": 28, \"quote_id\": \"29\", \"po_number\": \"PO-1764713718195\", \"vendor_id\": 11, \"total_amount\": \"18.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-02 22:15:18'),(17,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','32','{\"title\": \"check for vendor assign\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:11:44'),(18,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','33','{\"title\": \"alpha\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:25:05'),(19,NULL,'QUOTE_SUBMITTED','QUOTE','36','{\"rfq_id\": 32, \"items_count\": 1, \"total_price\": 198, \"expected_delivery_days\": 12}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:28:02'),(20,NULL,'QUOTE_SUBMITTED','QUOTE','37','{\"rfq_id\": 27, \"items_count\": 12, \"total_price\": 129, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:28:41'),(21,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','17','{\"rfq_id\": 27, \"quote_id\": \"37\", \"po_number\": \"PO-1764790146131\", \"vendor_id\": 11, \"total_amount\": \"129.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:29:06'),(22,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','18','{\"rfq_id\": 32, \"quote_id\": \"36\", \"po_number\": \"PO-1764790152658\", \"vendor_id\": 11, \"total_amount\": \"198.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 19:29:12'),(23,NULL,'QUOTE_SUBMITTED','QUOTE','38','{\"rfq_id\": 33, \"items_count\": 1, \"total_price\": 122, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:12:05'),(24,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','22','{\"rfq_id\": 33, \"quote_id\": \"38\", \"po_number\": \"PO-1764792822882\", \"vendor_id\": 11, \"total_amount\": \"122.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:13:42'),(25,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','34','{\"title\": \"final check \", \"items_count\": 3, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:22:51'),(26,NULL,'QUOTE_SUBMITTED','QUOTE','39','{\"rfq_id\": 34, \"items_count\": 3, \"total_price\": 286200, \"expected_delivery_days\": 3}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:26:14'),(27,NULL,'QUOTE_SUBMITTED','QUOTE','40','{\"rfq_id\": 34, \"items_count\": 3, \"total_price\": 355200, \"expected_delivery_days\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:27:17'),(28,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','23','{\"rfq_id\": 34, \"quote_id\": \"39\", \"po_number\": \"PO-1764793672478\", \"vendor_id\": 11, \"total_amount\": \"286200.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:27:52'),(29,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','35','{\"title\": \"final check 2\", \"items_count\": 3, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:35:27'),(30,NULL,'QUOTE_SUBMITTED','QUOTE','41','{\"rfq_id\": 35, \"items_count\": 3, \"total_price\": 1418, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:36:44'),(31,NULL,'QUOTE_SUBMITTED','QUOTE','42','{\"rfq_id\": 35, \"items_count\": 3, \"total_price\": 1450, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:37:13'),(32,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','24','{\"rfq_id\": 35, \"quote_id\": \"41\", \"po_number\": \"PO-1764794248405\", \"vendor_id\": 11, \"total_amount\": \"1418.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 20:37:28'),(33,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','36','{\"title\": \"Check main final main \", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:05:21'),(34,NULL,'QUOTE_SUBMITTED','QUOTE','43','{\"rfq_id\": 36, \"items_count\": 1, \"total_price\": 100000, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:06:53'),(35,NULL,'QUOTE_SUBMITTED','QUOTE','44','{\"rfq_id\": 36, \"items_count\": 1, \"total_price\": 97475, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:07:11'),(36,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','25','{\"rfq_id\": 36, \"quote_id\": \"44\", \"po_number\": \"PO-1764799646856\", \"vendor_id\": 11, \"total_amount\": \"97475.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:07:26'),(37,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','37','{\"title\": \"check final last promise\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:10:25'),(38,NULL,'QUOTE_SUBMITTED','QUOTE','45','{\"rfq_id\": 37, \"items_count\": 1, \"total_price\": 109989, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:11:15'),(39,NULL,'QUOTE_SUBMITTED','QUOTE','46','{\"rfq_id\": 37, \"items_count\": 1, \"total_price\": 98989, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:11:41'),(40,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','26','{\"rfq_id\": 37, \"quote_id\": \"46\", \"po_number\": \"PO-1764799913972\", \"vendor_id\": 12, \"total_amount\": \"98989.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:11:54'),(41,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','38','{\"title\": \"Check 431\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-03 22:24:22'),(42,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','39','{\"title\": \"check for 2\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 09:48:28'),(43,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','40','{\"title\": \"11111\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 10:12:40'),(44,NULL,'QUOTE_SUBMITTED','QUOTE','47','{\"rfq_id\": 40, \"items_count\": 1, \"total_price\": 49999, \"expected_delivery_days\": 5}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 10:20:12'),(45,NULL,'QUOTE_SUBMITTED','QUOTE','48','{\"rfq_id\": 40, \"items_count\": 1, \"total_price\": 59999, \"expected_delivery_days\": 7}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 10:22:40'),(46,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','27','{\"rfq_id\": 40, \"quote_id\": \"47\", \"po_number\": \"PO-1764843785279\", \"vendor_id\": 11, \"total_amount\": \"49999.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 10:23:05'),(47,NULL,'QUOTE_SUBMITTED','QUOTE','49','{\"rfq_id\": 39, \"items_count\": 1, \"total_price\": 98, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 11:30:09'),(48,NULL,'QUOTE_SUBMITTED','QUOTE','50','{\"rfq_id\": 39, \"items_count\": 1, \"total_price\": 97, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 11:30:36'),(49,'ec5ff8a7-ceee-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','28','{\"rfq_id\": 39, \"quote_id\": \"50\", \"po_number\": \"PO-1764847875069\", \"vendor_id\": 12, \"total_amount\": \"97.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','2025-12-04 11:31:15'),(50,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','41','{\"title\": \"Final Check for item \", \"items_count\": 2, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 11:44:01'),(51,NULL,'QUOTE_SUBMITTED','QUOTE','51','{\"rfq_id\": 41, \"items_count\": 2, \"total_price\": 546000, \"expected_delivery_days\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 12:07:28'),(52,NULL,'QUOTE_SUBMITTED','QUOTE','52','{\"rfq_id\": 41, \"items_count\": 2, \"total_price\": 367200, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 12:11:11'),(53,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','29','{\"rfq_id\": 41, \"quote_id\": \"52\", \"po_number\": \"PO-1764850468916\", \"vendor_id\": 12, \"total_amount\": \"367200.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 12:14:28'),(54,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','42','{\"title\": \"check \", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 16:41:09'),(55,NULL,'QUOTE_SUBMITTED','QUOTE','53','{\"rfq_id\": 42, \"items_count\": 1, \"total_price\": 288000, \"expected_delivery_days\": 5}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 16:44:17'),(56,NULL,'QUOTE_SUBMITTED','QUOTE','54','{\"rfq_id\": 42, \"items_count\": 1, \"total_price\": 143988, \"expected_delivery_days\": 3}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 16:44:40'),(57,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','30','{\"rfq_id\": 42, \"quote_id\": \"54\", \"po_number\": \"PO-1764866720473\", \"vendor_id\": 11, \"total_amount\": \"143988.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 16:45:20'),(58,'ec5ff8a7-ceee-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','43','{\"title\": \"hello\", \"items_count\": 1, \"department_id\": \"5\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','2025-12-04 16:52:54'),(59,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','44','{\"title\": \"Computer needed\", \"items_count\": 2, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 17:08:16'),(60,NULL,'QUOTE_SUBMITTED','QUOTE','55','{\"rfq_id\": 44, \"items_count\": 2, \"total_price\": 244200, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 17:11:10'),(61,NULL,'QUOTE_SUBMITTED','QUOTE','56','{\"rfq_id\": 44, \"items_count\": 2, \"total_price\": 230400, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 17:11:51'),(62,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','31','{\"rfq_id\": 44, \"quote_id\": \"56\", \"po_number\": \"PO-1764868352406\", \"vendor_id\": 12, \"total_amount\": \"230400.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-12-04 17:12:32'),(63,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','45','{\"title\": \"Check for something\", \"items_count\": 1, \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 20:33:31'),(64,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','48','{\"title\": \"hello notificatoin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:19:17'),(65,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','49','{\"title\": \"hello notificatoin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:20:06'),(66,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','50','{\"title\": \"hello notificatoin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:26:22'),(67,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','RFQ_APPROVED','RFQ','50','{}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:27:30'),(68,'75d4693c-ceef-11f0-95a2-3448ed5a841b','VENDORS_ASSIGNED','RFQ','50','{\"vendor_ids\": [12, 11]}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:29:07'),(69,'11','QUOTE_SUBMITTED','QUOTE','57','{\"rfq_id\": 50, \"items_count\": 1, \"total_price\": 2111, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:33:28'),(70,'11','QUOTE_SUBMITTED','QUOTE','58','{\"rfq_id\": 50, \"items_count\": 1, \"total_price\": 2111, \"expected_delivery_days\": 1}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:33:54'),(71,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','33','{\"rfq_id\": 50, \"quote_id\": \"58\", \"po_number\": \"PO-1764884100979\", \"vendor_id\": 11, \"total_amount\": \"2111.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-04 21:35:01'),(72,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','51','{\"title\": \"Hello\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','2025-12-05 03:58:43'),(73,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','52','{\"title\": \"For lab 1314\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:18:21'),(74,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','RFQ_APPROVED','RFQ','52','{}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:19:56'),(75,'75d4693c-ceef-11f0-95a2-3448ed5a841b','VENDORS_ASSIGNED','RFQ','52','{\"vendor_ids\": [11, 12]}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:21:19'),(76,'12','QUOTE_SUBMITTED','QUOTE','59','{\"rfq_id\": 52, \"items_count\": 2, \"total_price\": 607500, \"expected_delivery_days\": 6}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:22:39'),(77,'11','QUOTE_SUBMITTED','QUOTE','60','{\"rfq_id\": 52, \"items_count\": 2, \"total_price\": 682500, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:23:32'),(78,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','34','{\"rfq_id\": 52, \"quote_id\": \"60\", \"po_number\": \"PO-1764908666833\", \"vendor_id\": 11, \"total_amount\": \"682500.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 04:24:26'),(79,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','53','{\"title\": \"Computer Needed\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-05 08:47:40'),(80,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','54','{\"title\": \"Hello \", \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:31:05'),(81,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','55','{\"title\": \"Hello \", \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:32:01'),(82,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','56','{\"title\": \"Hello \", \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:32:31'),(83,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','57','{\"title\": \"Hello \", \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:34:31'),(84,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','RFQ_APPROVED','RFQ','57','{}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:39:24'),(85,'75d4693c-ceef-11f0-95a2-3448ed5a841b','VENDORS_ASSIGNED','RFQ','57','{\"vendor_ids\": [12, 11]}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:53:29'),(86,'11','QUOTE_SUBMITTED','QUOTE','61','{\"rfq_id\": 57, \"items_count\": 1, \"total_price\": 24000, \"expected_delivery_days\": 3}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:58:37'),(87,'12','QUOTE_SUBMITTED','QUOTE','62','{\"rfq_id\": 57, \"items_count\": 1, \"total_price\": 276000, \"expected_delivery_days\": 2}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 09:59:06'),(88,'75d4693c-ceef-11f0-95a2-3448ed5a841b','PO_GENERATED','PO','35','{\"rfq_id\": 57, \"quote_id\": \"62\", \"po_number\": \"PO-1765102417356\", \"vendor_id\": 12, \"total_amount\": \"276000.00\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 10:13:37'),(89,'612b9987-ceef-11f0-95a2-3448ed5a841b','RFQ_CREATED','RFQ','58','{\"title\": \"helolo\", \"department_id\": 4}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','2025-12-07 10:19:06');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_usage`
--

DROP TABLE IF EXISTS `budget_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `rfq_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  KEY `rfq_id` (`rfq_id`),
  CONSTRAINT `budget_usage_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `budget_usage_ibfk_2` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_usage`
--

LOCK TABLES `budget_usage` WRITE;
/*!40000 ALTER TABLE `budget_usage` DISABLE KEYS */;
INSERT INTO `budget_usage` VALUES (49,4,52,0.00,'2025-12-05 04:19:56'),(50,4,52,682500.00,'2025-12-05 04:24:26'),(51,4,57,0.00,'2025-12-07 09:39:24'),(52,4,57,276000.00,'2025-12-07 10:13:37');
/*!40000 ALTER TABLE `budget_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `budget` decimal(12,2) DEFAULT '0.00',
  `head_user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `name` (`name`),
  KEY `head_user_id` (`head_user_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`head_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (4,'Information Technology','VIT-220194',1000000.00,NULL,'2025-12-01 20:13:28','2025-12-01 20:13:28'),(5,'Computer Engineering','VIT-324181',2000000.00,NULL,'2025-12-02 13:26:17','2025-12-02 13:26:17'),(6,'Mechanical Engineering','VIT-67522',20000000.00,NULL,'2025-12-04 16:48:21','2025-12-07 10:16:46');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','system') DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (17,'612b9987-ceef-11f0-95a2-3448ed5a841b','Purchase Order Generated','Your RFQ \"For lab 1314\" has been converted into PO PO-1764908666833.','success','/purchase-orders',1,'2025-12-05 04:24:26'),(18,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"Hello \" is pending your approval.','info','/approver/rfqs/56',1,'2025-12-07 09:32:31'),(19,'c7ad6a14-d1b6-11f0-b153-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"Hello \" is pending your approval.','info','/approver/rfqs/56',0,'2025-12-07 09:32:31'),(20,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"Hello \" is pending your approval.','info','/approver/rfqs/57',1,'2025-12-07 09:34:31'),(21,'c7ad6a14-d1b6-11f0-b153-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"Hello \" is pending your approval.','info','/approver/rfqs/57',0,'2025-12-07 09:34:31'),(22,'75d4693c-ceef-11f0-95a2-3448ed5a841b','Ready to Assign Vendor to RFQ','RFQ \"undefined\" is approved and ready for vendor assignment.','info','/officer/assignedVendor?rfq_id=57',1,'2025-12-07 09:39:24'),(23,'d18e910c-d12f-11f0-b153-3448ed5a841b','Ready to Assign Vendor to RFQ','RFQ \"undefined\" is approved and ready for vendor assignment.','info','/officer/assignedVendor?rfq_id=57',0,'2025-12-07 09:39:24'),(24,'612b9987-ceef-11f0-95a2-3448ed5a841b','Purchase Order Generated','Your RFQ \"Hello \" has been converted into PO PO-1765102417356.','success','/purchase-orders',0,'2025-12-07 10:13:37'),(25,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"helolo\" is pending your approval.','info','/approver/rfqs/58',0,'2025-12-07 10:19:06'),(26,'c7ad6a14-d1b6-11f0-b153-3448ed5a841b','New RFQ Awaiting Approval','RFQ \"helolo\" is pending your approval.','info','/approver/rfqs/58',0,'2025-12-07 10:19:06');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po_items`
--

DROP TABLE IF EXISTS `po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_items` (
  `po_item_id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`po_item_id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_items`
--

LOCK TABLES `po_items` WRITE;
/*!40000 ALTER TABLE `po_items` DISABLE KEYS */;
INSERT INTO `po_items` (`po_item_id`, `po_id`, `item_name`, `quantity`, `unit_price`) VALUES (68,34,'PC',15,45000.00),(69,34,'Mouse',15,500.00),(70,35,'Computer',12,23000.00);
/*!40000 ALTER TABLE `po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `po_id` int NOT NULL AUTO_INCREMENT,
  `rfq_id` int NOT NULL,
  `quote_id` int NOT NULL,
  `vendor_id` bigint unsigned NOT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('Pending','Approved','Completed','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`po_id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `rfq_id` (`rfq_id`),
  KEY `quote_id` (`quote_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`quote_id`) REFERENCES `rfq_quotes` (`quote_id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`vendor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (34,52,60,11,'PO-1764908666833',682500.00,'Approved','2025-12-05 04:24:26'),(35,57,62,12,'PO-1765102417356',276000.00,'Approved','2025-12-07 10:13:37');
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_approvals`
--

DROP TABLE IF EXISTS `rfq_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_approvals` (
  `approval_id` int NOT NULL AUTO_INCREMENT,
  `rfq_id` int NOT NULL,
  `approver_id` varchar(36) NOT NULL,
  `decision` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `comments` text,
  `decided_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`approval_id`),
  KEY `rfq_id` (`rfq_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `rfq_approvals_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`) ON DELETE CASCADE,
  CONSTRAINT `rfq_approvals_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_approvals`
--

LOCK TABLES `rfq_approvals` WRITE;
/*!40000 ALTER TABLE `rfq_approvals` DISABLE KEYS */;
INSERT INTO `rfq_approvals` VALUES (51,52,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','Approved','okk','2025-12-05 04:19:56'),(52,53,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','Rejected','ok','2025-12-05 08:48:36'),(53,57,'6d929f5a-ceef-11f0-95a2-3448ed5a841b','Approved','ok','2025-12-07 09:39:24');
/*!40000 ALTER TABLE `rfq_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_items`
--

DROP TABLE IF EXISTS `rfq_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_items` (
  `rfq_item_id` int NOT NULL AUTO_INCREMENT,
  `rfq_id` int NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `est_unit_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`rfq_item_id`),
  KEY `rfq_id` (`rfq_id`),
  CONSTRAINT `rfq_items_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_items`
--

LOCK TABLES `rfq_items` WRITE;
/*!40000 ALTER TABLE `rfq_items` DISABLE KEYS */;
INSERT INTO `rfq_items` VALUES (120,52,'PC',15,0.00),(121,52,'Mouse',15,0.00),(122,53,'computer',12,NULL),(126,57,'Computer',12,NULL),(127,58,'inf',8,NULL);
/*!40000 ALTER TABLE `rfq_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_quote_items`
--

DROP TABLE IF EXISTS `rfq_quote_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_quote_items` (
  `item_quote_id` int NOT NULL AUTO_INCREMENT,
  `quote_id` int NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `quoted_unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS ((`quantity` * `quoted_unit_price`)) STORED,
  PRIMARY KEY (`item_quote_id`),
  KEY `quote_id` (`quote_id`),
  CONSTRAINT `rfq_quote_items_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `rfq_quotes` (`quote_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_quote_items`
--

LOCK TABLES `rfq_quote_items` WRITE;
/*!40000 ALTER TABLE `rfq_quote_items` DISABLE KEYS */;
INSERT INTO `rfq_quote_items` (`item_quote_id`, `quote_id`, `item_name`, `quantity`, `quoted_unit_price`) VALUES (155,59,'PC',15,40000.00),(156,59,'Mouse',15,500.00),(157,60,'PC',15,45000.00),(158,60,'Mouse',15,500.00),(159,61,'Computer',12,2000.00),(160,62,'Computer',12,23000.00);
/*!40000 ALTER TABLE `rfq_quote_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_quotes`
--

DROP TABLE IF EXISTS `rfq_quotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_quotes` (
  `quote_id` int NOT NULL AUTO_INCREMENT,
  `rfq_id` int NOT NULL,
  `vendor_id` bigint unsigned NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `expected_delivery_days` int DEFAULT '0',
  `remarks` text,
  `status` enum('Submitted','Reviewed','Accepted','Rejected') DEFAULT 'Submitted',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`quote_id`),
  KEY `rfq_id` (`rfq_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `rfq_quotes_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`) ON DELETE CASCADE,
  CONSTRAINT `rfq_quotes_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`vendor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_quotes`
--

LOCK TABLES `rfq_quotes` WRITE;
/*!40000 ALTER TABLE `rfq_quotes` DISABLE KEYS */;
INSERT INTO `rfq_quotes` VALUES (59,52,12,607500.00,6,'1 year warrenty','Rejected','2025-12-05 04:22:39'),(60,52,11,682500.00,2,'2 year warrenty','Accepted','2025-12-05 04:23:32'),(61,57,11,24000.00,3,'hello','Rejected','2025-12-07 09:58:37'),(62,57,12,276000.00,2,'heelllo','Accepted','2025-12-07 09:59:06');
/*!40000 ALTER TABLE `rfq_quotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_vendors`
--

DROP TABLE IF EXISTS `rfq_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rfq_id` int NOT NULL,
  `vendor_id` bigint unsigned NOT NULL,
  `status` enum('Assigned','Quoted','Reviewed') DEFAULT 'Assigned',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rfq_id` (`rfq_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `rfq_vendors_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`rfq_id`) ON DELETE CASCADE,
  CONSTRAINT `rfq_vendors_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`vendor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_vendors`
--

LOCK TABLES `rfq_vendors` WRITE;
/*!40000 ALTER TABLE `rfq_vendors` DISABLE KEYS */;
INSERT INTO `rfq_vendors` VALUES (114,52,11,'Quoted','2025-12-05 04:21:19'),(115,52,12,'Quoted','2025-12-05 04:21:19'),(116,57,12,'Quoted','2025-12-07 09:53:29'),(117,57,11,'Quoted','2025-12-07 09:53:29');
/*!40000 ALTER TABLE `rfq_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfqs`
--

DROP TABLE IF EXISTS `rfqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfqs` (
  `rfq_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `department_id` int NOT NULL,
  `created_by` varchar(100) NOT NULL,
  `status` enum('Open','Approved','Rejected','Closed','Cancelled') DEFAULT 'Open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rfq_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `rfqs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfqs`
--

LOCK TABLES `rfqs` WRITE;
/*!40000 ALTER TABLE `rfqs` DISABLE KEYS */;
INSERT INTO `rfqs` VALUES (52,'For lab 1314','we want the electrical appliances',4,'612b9987-ceef-11f0-95a2-3448ed5a841b','Closed','2025-11-05 04:18:21'),(53,'Computer Needed','helo',4,'612b9987-ceef-11f0-95a2-3448ed5a841b','Rejected','2025-12-05 08:47:40'),(57,'Hello ','Take to appriver',4,'612b9987-ceef-11f0-95a2-3448ed5a841b','Closed','2025-12-07 09:34:31'),(58,'helolo','hhh',4,'612b9987-ceef-11f0-95a2-3448ed5a841b','Open','2025-12-07 10:19:06');
/*!40000 ALTER TABLE `rfqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_id` (`role_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Has full system access creator\n'),(2,'Approver','Can approve or reject purchase requests'),(3,'Requestor','Can create and track purchase requests'),(4,'Vendor','Supplies goods or services'),(5,'PurchasingOfficer','Handles vendor communication andkfsl;ajd purchase orders');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (23,'612b9987-ceef-11f0-95a2-3448ed5a841b',3),(24,'6d929f5a-ceef-11f0-95a2-3448ed5a841b',2),(28,'6eff7ae7-d331-11f0-afb0-3448ed5a841b',3),(25,'75d4693c-ceef-11f0-95a2-3448ed5a841b',5),(27,'c7ad6a14-d1b6-11f0-b153-3448ed5a841b',2),(26,'d18e910c-d12f-11f0-b153-3448ed5a841b',5),(29,'db000c56-d335-11f0-afb0-3448ed5a841b',3),(22,'ec5ff8a7-ceee-11f0-95a2-3448ed5a841b',1);
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` text NOT NULL,
  `department_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('612b9987-ceef-11f0-95a2-3448ed5a841b','Sharma Sir','sharma@gmail.com','$2b$10$ZopbV8zCsDDi5m2kVbYPbeSlQmP1dJaR/qYyzyWfIbxbI3Am6caK2',4,'2025-12-01 19:53:17','2025-12-01 19:53:17',NULL),('6d929f5a-ceef-11f0-95a2-3448ed5a841b','Approver HOD','ap@gmail.com','$2b$10$VYlXaFnzEvkW6CqM0WlETuEh2Avq5WchzW.RevBBMesSeBXnUQnxG',4,'2025-12-01 19:53:37','2025-12-01 19:53:37',NULL),('6eff7ae7-d331-11f0-afb0-3448ed5a841b','Om_Kokate','om@gmail.com1','$2b$10$zY9EHu/Dg98r6GWr6DouKOzq.4HAGQ09SoReaZGqaPtGRSzl56rs.',NULL,'2025-12-07 05:56:11','2025-12-07 05:56:11',NULL),('75d4693c-ceef-11f0-95a2-3448ed5a841b','Officer Clerk','op@gmail.com','$2b$10$5lpoDm7CkyoKEQkSr.3v0uf5a.2k.CzuDJHYipzgtdzG6i4CoGd92',NULL,'2025-12-01 19:53:51','2025-12-01 19:53:51',NULL),('c7ad6a14-d1b6-11f0-b153-3448ed5a841b','ABC123','abc@gmail.com1','$2b$10$DXeL6dgV5pNltHvZ3cX7TegbES.bYSNNbUxSOOMkj2CYHtkImcYv2',NULL,'2025-12-05 08:45:41','2025-12-05 08:45:41',NULL),('d18e910c-d12f-11f0-b153-3448ed5a841b','chai','chai@gmail.com','$2b$10$1lVLyxcqAgl2/5r.YCO1B.iHK8Qnj/P64OZ2k/k/8ND1NA5qIKFTu',NULL,'2025-12-04 16:39:35','2025-12-04 16:39:35',NULL),('db000c56-d335-11f0-afb0-3448ed5a841b','Om_Kokate25','omkokate2535@gmail.com','$2b$10$bcWoDCTJyfDRYU9wt002guU7cdr93sXXGD43DPLFSUqK5NlmtOm5C',NULL,'2025-12-07 06:27:50','2025-12-07 06:27:50',NULL),('ec5ff8a7-ceee-11f0-95a2-3448ed5a841b','Admin Main','admin@gmail.com','$2b$10$qRlQW7FM4PaJAqekuuwvJ.slJVs.o21NKkcRZfJ3Dj802nrY60zce',NULL,'2025-12-01 19:50:01','2025-12-01 19:50:01',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor`
--

DROP TABLE IF EXISTS `vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor` (
  `vendor_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password_hash` text NOT NULL,
  `phoneno` varchar(20) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `vendor_id` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor`
--

LOCK TABLES `vendor` WRITE;
/*!40000 ALTER TABLE `vendor` DISABLE KEYS */;
INSERT INTO `vendor` VALUES (11,'Agrawal Traders','ag@gmail.com','$2b$10$QZA7AYHOp.paeX874dXzj.LkjOFFMWhzcm6GE4s1MthJrZ2DTrS3u','1232349329','65411',4.60,1,'2025-12-01 20:18:08'),(12,'Sham Compuer\'s','sc@gmail.com','$2b$10$sldD8eEA5ZzBWkjsd5OCn.IDzdnRlFFL0LaD/Riv9Tp2Y5O2HvKfa','2345678908','65411',4.50,1,'2025-12-01 20:18:32');
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-07 16:11:53
