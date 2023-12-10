const mysql = require('mysql');
const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurant'
});

db.connect((err) => {
    if (err) {
        console.log('Wystąpił błąd podczas łączenia się z serwerem bazy danych');
        throw err;
    }
    console.log("Połączono z serwerem bazy danych");
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    const checkUserQuery = "SELECT * FROM user WHERE username = ? OR email = ?";
    db.query(checkUserQuery, [username, email], (checkUserErr, checkUserResult) => {
        if (checkUserErr) {
        console.error('Błąd podczas sprawdzania użytkownika w bazie danych: ', checkUserErr);
            return res.status(500).json({ error: 'Błąd sprawdzania użytkownika w bazie danych' });
        }

        if (checkUserResult.length > 0) {
            return res.status(400).json({ error: 'Użytkownik o podanej nazwie użytkownika lub email już istnieje' });
        }
    });

    const query = "INSERT INTO user(username, email, password) VALUES(?, ?, ?)";
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error('Błąd zapisu do bazy danych: ', err);
            res.status(500).json({ error: 'Błąd zapisu do bazy danych' });
        } else {
            res.status(200).json({ success: true });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
    db.query(checkUserQuery, [username], async (checkUserErr, checkUserResult) => {
        if (checkUserErr) {
            console.error('Błąd podczas sprawdzania użytkownika w bazie danych: ', checkUserErr);
            return res.status(500).json({ error: 'Błąd sprawdzania użytkownika w bazie danych' });
        }
    
        if (checkUserResult.length === 0) {
            return res.status(404).json({ error: 'Użytkownik o podanej nazwie użytkownika nie istnieje' });
        }
    
        const storedHashedPassword = checkUserResult[0].password; 
        const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);
    
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Nieprawidłowe hasło' });
        }
    
        const userId = checkUserResult[0].id;
    
        res.status(200).json({ userId, success: true });
    });
});

app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM recipe_categories';
  
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd pobierania kategorii z bazy danych:', err);
            res.status(500).json({ error: 'Błąd pobierania kategorii z bazy danych' });
        } else {
            const categories = results.map((category) => {
                return {
                    id: category.id,
                    name: category.name,
                };
            });
    
            res.json({ categories });
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Serwer nasłuchuje na porcie ${PORT}`);
});