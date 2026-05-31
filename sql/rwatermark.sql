/*
 Navicat Premium Dump SQL

 Source Server         : ss
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           :
 Source Schema         : rwatermark

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 14/03/2026 10:47:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for mini_user
-- ----------------------------
DROP TABLE IF EXISTS `mini_user`;
CREATE TABLE `mini_user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `unionid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `session_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `gender` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `grade` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `view_count` int unsigned DEFAULT '0',
  `appid` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `balance` int unsigned DEFAULT '0',
  `invite_code` varchar(16) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '邀请码',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invite_code` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ----------------------------
-- Table structure for play_video_ad
-- ----------------------------
DROP TABLE IF EXISTS `play_video_ad`;
CREATE TABLE `play_video_ad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `count` int DEFAULT NULL,
  `appid` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ----------------------------
-- Table structure for short_video
-- ----------------------------
DROP TABLE IF EXISTS `short_video`;
CREATE TABLE `short_video` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'douyin',
  `content_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'video,image,audio',
  `content` json DEFAULT NULL,
  `video_path` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `img_paths` json DEFAULT NULL,
  `music_path` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `status` tinyint unsigned DEFAULT NULL COMMENT '0=解析中，1=成功，2=失败',
  `msg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `origin_url` text COLLATE utf8mb4_bin,
  `deleted_at` datetime DEFAULT NULL,
  `appid` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='短视频下载';



DROP TABLE IF EXISTS `slow_sql`;
CREATE TABLE `slow_sql` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `query` text COLLATE utf8mb4_bin DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `params` json DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='慢sql';


