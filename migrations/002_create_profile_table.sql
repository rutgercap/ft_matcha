CREATE TABLE profiles (
    user_id INTEGER,
    gender TEXT NOT NULL,
    sex_preference TEXT NOT NULL,
    biography TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE pictures (
    user_id INTEGER,
    picture_id INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
    user_id INTEGER,
    tag TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

