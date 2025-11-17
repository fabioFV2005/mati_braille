-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: braille_db
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `attempts`
--

DROP TABLE IF EXISTS `attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(50) DEFAULT NULL,
  `lesson_id` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `step_index` int DEFAULT NULL,
  `answer` text,
  `correct` tinyint(1) DEFAULT '0',
  `attempts` int DEFAULT '0',
  `ts` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `idx_attempts_session` (`session_id`),
  KEY `idx_attempts_user` (`user_id`),
  CONSTRAINT `attempts_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attempts_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attempts_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attempts`
--

LOCK TABLES `attempts` WRITE;
/*!40000 ALTER TABLE `attempts` DISABLE KEYS */;
INSERT INTO `attempts` VALUES (1,'1ef27394ca404474','ef2b0d3f',20,0,'A',1,1,20251115170050),(2,'1ef27394ca404474','ef2b0d3f',20,1,'B',0,1,20251115170056),(3,'1ef27394ca404474','ef2b0d3f',20,1,'E',1,2,20251115170100),(4,'1ef27394ca404474','ef2b0d3f',20,2,'C',0,1,20251115170106),(5,'1ef27394ca404474','ef2b0d3f',20,2,'E',0,2,20251115170110),(6,'1ef27394ca404474','ef2b0d3f',20,2,'__SKIP__',0,1,20251115170119),(7,'1ef27394ca404474','ef2b0d3f',20,2,'DSADSA',0,4,20251115170126),(8,'1ef27394ca404474','ef2b0d3f',20,2,'E',0,5,20251115170135),(9,'d03de8cce71e4b13','aafed076',20,0,'HOLA',0,1,20251115171044),(10,'d03de8cce71e4b13','aafed076',20,0,'A',1,2,20251115171046),(11,'1ef27394ca404474','ef2b0d3f',20,2,'I',1,6,20251115171100),(12,'1ef27394ca404474','ef2b0d3f',20,3,'O',1,1,20251115171106),(13,'1ef27394ca404474','ef2b0d3f',20,4,'Y',0,1,20251115171113),(14,'1ef27394ca404474','ef2b0d3f',20,4,'U',1,2,20251115171117),(15,'708e1db43cf74bac','db976995',20,0,'B',0,1,20251115174745),(16,'708e1db43cf74bac','db976995',20,0,'A',1,2,20251115174749),(17,'708e1db43cf74bac','db976995',20,1,'B',1,1,20251115174753),(18,'708e1db43cf74bac','db976995',20,2,'C',1,1,20251115174756),(19,'41f1d59cf8254601','ef2b0d3f',20,0,'A',1,1,20251115175745),(20,'41f1d59cf8254601','ef2b0d3f',20,1,'E',1,1,20251115175749),(21,'41f1d59cf8254601','ef2b0d3f',20,2,'I',1,1,20251115175753),(22,'41f1d59cf8254601','ef2b0d3f',20,3,'O',1,1,20251115175758),(23,'41f1d59cf8254601','ef2b0d3f',20,4,'U',1,1,20251115175803),(24,'578ef99c53274c4c','ef2b0d3f',20,0,'2',0,1,20251115180154),(25,'578ef99c53274c4c','ef2b0d3f',20,0,'D',0,2,20251115180200),(26,'578ef99c53274c4c','ef2b0d3f',20,0,'D',0,3,20251115180204);
/*!40000 ALTER TABLE `attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_lessons`
--

DROP TABLE IF EXISTS `class_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `lesson_id` varchar(50) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_lesson` (`class_id`,`lesson_id`),
  KEY `idx_class_lessons_class` (`class_id`),
  KEY `idx_class_lessons_lesson` (`lesson_id`),
  CONSTRAINT `class_lessons_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_lessons_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_lessons`
--

LOCK TABLES `class_lessons` WRITE;
/*!40000 ALTER TABLE `class_lessons` DISABLE KEYS */;
INSERT INTO `class_lessons` VALUES (1,4,'ef2b0d3f','2025-11-15 20:16:39',NULL,1),(2,5,'ef2b0d3f','2025-11-15 20:16:39',NULL,1),(3,4,'aafed076','2025-11-15 21:10:03',NULL,1),(8,5,'aafed076','2025-11-15 21:10:25',NULL,1),(9,6,'db976995','2025-11-15 21:46:51',NULL,1);
/*!40000 ALTER TABLE `class_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_student` (`class_id`,`student_id`),
  KEY `idx_class_students_class` (`class_id`),
  KEY `idx_class_students_student` (`student_id`),
  CONSTRAINT `class_students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_students`
--

LOCK TABLES `class_students` WRITE;
/*!40000 ALTER TABLE `class_students` DISABLE KEYS */;
INSERT INTO `class_students` VALUES (4,5,20,'2025-11-15 19:00:32',1),(5,4,19,'2025-11-15 19:00:43',1),(6,5,19,'2025-11-15 20:23:57',1),(7,4,20,'2025-11-15 20:24:05',1),(8,6,20,'2025-11-15 21:47:25',1);
/*!40000 ALTER TABLE `class_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `teacher_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_classes_teacher` (`teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (4,'hola mundo',NULL,16,'2025-11-15 05:13:11',1),(5,'PEPE',NULL,16,'2025-11-15 18:56:38',1),(6,'Introduccion a braille',NULL,16,'2025-11-15 21:43:58',1);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `assigned_user_id` int DEFAULT NULL,
  `last_seen` bigint DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_devices_assigned` (`assigned_user_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_steps`
--

DROP TABLE IF EXISTS `lesson_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` varchar(50) NOT NULL,
  `step_index` int NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `target` varchar(50) DEFAULT NULL,
  `prompt` text,
  `hint` text,
  `max_attempts` int DEFAULT '3',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_id` (`lesson_id`,`step_index`),
  CONSTRAINT `lesson_steps_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_steps`
--

LOCK TABLES `lesson_steps` WRITE;
/*!40000 ALTER TABLE `lesson_steps` DISABLE KEYS */;
INSERT INTO `lesson_steps` VALUES (6,'ef2b0d3f',0,'input','A','Escribe la vocal A en tu teclado Braille','Es la primera vocal del alfabeto',3),(7,'ef2b0d3f',1,'input','E','Escribe la vocal E en tu teclado Braille','Es la vocal más usada en español',3),(8,'ef2b0d3f',2,'input','I','Escribe la vocal I en tu teclado Braille','Es una vocal cerrada anterior',3),(9,'ef2b0d3f',3,'input','O','Escribe la vocal O en tu teclado Braille','Es una vocal redonda',3),(10,'ef2b0d3f',4,'input','U','Escribe la vocal U en tu teclado Braille','Es la última vocal',3),(11,'aafed076',0,'input','A','hola','A',3),(12,'db976995',0,'input','A','Escribe la letra A','es la primera vocal',3),(13,'db976995',1,'input','B','Escribre la letra B','Es la segunda letra',3),(14,'db976995',2,'input','C','Escribe la letra C','es la 3era letra',3);
/*!40000 ALTER TABLE `lesson_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_lessons_difficulty` (`difficulty`),
  KEY `idx_lessons_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES ('aafed076','hehe','hehe','intermediate',1,'2025-11-15 19:47:04',1),('db976995','introduccion a braille','empleado','beginner',3,'2025-11-15 21:46:22',1),('ef2b0d3f','Vocales en Braille','Aprende a reconocer y escribir las 5 vocales en el sistema Braille','beginner',0,'2025-11-15 19:34:16',1);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(50) NOT NULL,
  `lesson_id` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `started_at` bigint DEFAULT NULL,
  `finished_at` bigint DEFAULT NULL,
  `score` int DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_sessions_class` (`class_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('1ef27394ca404474','ef2b0d3f',20,NULL,20251115170041,20251115171117,5,0),('41f1d59cf8254601','ef2b0d3f',20,NULL,20251115175742,20251115175803,5,0),('578ef99c53274c4c','ef2b0d3f',20,NULL,20251115180141,NULL,0,0),('708e1db43cf74bac','db976995',20,NULL,20251115174738,20251115174756,3,0),('b3eff7f753944a30','aafed076',20,NULL,20251115171124,NULL,0,0),('d03de8cce71e4b13','aafed076',20,NULL,20251115171037,20251115171046,1,0);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_progress`
--

DROP TABLE IF EXISTS `student_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` varchar(50) NOT NULL,
  `class_id` int DEFAULT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `score` int DEFAULT '0',
  `attempts` int DEFAULT '0',
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson_progress` (`student_id`,`lesson_id`,`class_id`),
  KEY `idx_progress_student` (`student_id`),
  KEY `idx_progress_lesson` (`lesson_id`),
  KEY `idx_progress_class` (`class_id`),
  CONSTRAINT `student_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_progress_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_progress`
--

LOCK TABLES `student_progress` WRITE;
/*!40000 ALTER TABLE `student_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `password` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  `CI` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (13,'xdd','fabiofernandez','admin','scrypt:32768:8:1$mHHw2fBobI4LXY0y$ec087b5800844557336bb0f004d2691e778c35a36ca93e595d2f6d8ed1a72f0bdcf3ffbfcfe4a60305e8b19a914fd203dc1b90fc1502cbfd4d0208ff540d167e',NULL,'2025-11-14 23:33:04',1,12345678),(14,'fer','fab','admin','c8cefded12a2334c16a9c2c50f56509b$70a70d69a8909cd6000ef2e024c97cfe077ef33dc98942e8c49856fe3f5243e6e02d828c3c74af52179cb1408ad118ffcbf0ffcf0df06fc222745b55068306b3',NULL,'2025-11-14 23:46:05',1,0),(15,'lesli','Moises Fernandez','admin','0f7bc0d4b293aa537c0d05438f6c66fc$f9bcacd48acf576e577d63ebdbecd1a9be42da3f99e40b732d74a42bd09aecd939897f9a5456e988460e1088857c09bc4242ebed1849dcb8aa9ebe30cc106b96',NULL,'2025-11-15 00:10:55',1,0),(16,'empleado','fabio fernandez','teacher','2bb790553c4ca591aed84ee603b033d0$b40cf2f10de1191f02051ecba57f0407949aa3796151b4b2d5736f9c493f42e694bed89de4f7718e0af5f2323481b87369cb7f8072b88df94570c2d940755c8a',NULL,'2025-11-15 00:14:23',1,0),(17,'feb','fab','admin','a72e61220fbd23f0a585c9aaf34091a2$a0043affbbbc123d77050f9222d871d071ac72b99c0d7b0bfa96bddaab87f9c1b617513f9ab9ba8634d33438ae9af326de865c0a4ac234a81b4f6555d1bd824c',NULL,'2025-11-15 00:30:05',1,0),(19,'lesliaa','Moises Fernandez','student','26a8d82829b147057586532d52e3c018$fefb938908e788a371994fe7b9cb4075bc41d5b2866faac0002690537353622812cec434ed216b3fdeccc025ca1823b364f959e01ad632a121f55b4e318bf331',NULL,'2025-11-15 05:38:54',1,0),(20,'empleado1','fabio fernandez','student','43e66e053024991669332d1bb86ad7b3$ab5fc01c2325968a544a921d41602c123175743a38d860744a65b25fb4360af07d7adfdde86a8d2dc2b16717b239d716e3c58c087d696faa05b6aa93e64f9a37',NULL,'2025-11-15 18:42:46',1,NULL),(21,'lucas','Lucas','teacher','ec39f899088ce58689c5c947b766eca3$8376691d8de550769ed1897a97b78c131482dfa1e407f2b7bf4349918c0957c3911eb94e6d918713be0f2c55e98d0fc8d377aeb1b0f38a8cbc63e710a26c080a',NULL,'2025-11-15 18:56:54',1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 20:39:30
