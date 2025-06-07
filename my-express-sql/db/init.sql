CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE  -- ถ้า user ถูกลบ, โพสต์ทั้งหมดของ user นั้นก็จะถูกลบไปด้วย
        -- หรือ ON DELETE RESTRICT -- ไม่อนุญาตให้ลบ user ถ้ายังมีโพสต์อยู่
        -- หรือ ON DELETE SET NULL -- ถ้า user ถูกลบ, user_id ในโพสต์จะถูกตั้งเป็น NULL (ต้องอนุญาตให้ user_id เป็น NULLABLE ด้วย)
        ON UPDATE CASCADE  -- ถ้า id ของ user ในตาราง users เปลี่ยน, user_id ใน posts ก็จะเปลี่ยนตาม
);
