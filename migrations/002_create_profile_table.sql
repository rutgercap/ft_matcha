CREATE TABLE profiles (
    user_id INTEGER FOREIGN KEY user.id,
    gender TEXT NOT NULL,
    sex_preference TEXT NOT NULL,
    biography TEXT NOT NULL
);

CREATE TABLE pictures (
    user_id INTEGER,
    picture_id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE tags (
    user_id INTEGER FOREIGN KEY user.id,
    tag TEXT NOT NULL
)


