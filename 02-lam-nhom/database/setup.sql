-- Database mới cho dự án nhóm; import một lần.
CREATE DATABASE IF NOT EXISTS vic_events_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vic_events_lab;
CREATE TABLE events (
 id INT PRIMARY KEY AUTO_INCREMENT,
 title VARCHAR(150) NOT NULL,
 description TEXT NOT NULL,
 event_date DATE NOT NULL,
 location VARCHAR(150) NOT NULL,
 is_open TINYINT NOT NULL CHECK (is_open IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE registrations (
 id INT PRIMARY KEY AUTO_INCREMENT,
 event_id INT NOT NULL,
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL,
 UNIQUE (event_id,email),
 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
INSERT INTO events (id,title,description,event_date,location,is_open) VALUES
(1,'Workshop Git','Thực hành phối hợp dự án','2026-12-05','Phòng sinh hoạt VIC',1),
(2,'Workshop API','Viết API đầu tiên','2026-12-12','Phòng máy',1),
(3,'Giao lưu thành viên','Kết nối thành viên VIC','2026-12-19','Sân trường',0);
INSERT INTO registrations (event_id,full_name,email) VALUES
(1,'Thành viên mẫu','member1@example.com'),(2,'Học viên mẫu','member2@example.com');
