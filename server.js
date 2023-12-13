const mysql = require('mysql');
const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const multer = require('multer');
const morgan = require('morgan');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { promisify } = require('util');
app.use(express.json());
app.use(morgan('dev'));  
app.use(cors());
app.use(upload.single('photo'));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurant2'
});

const queryAsync = promisify(db.query).bind(db);

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

app.post('/api/newRecipe', (req, res) => {
    const { user_id, category_id, name, steps, products } = req.body;
    const photo = req.file.buffer;
    const insertRecipeQuery = 'INSERT INTO recipes(user_id, category_id, name, image) VALUES (?, ?, ?, ?)';
    db.query(insertRecipeQuery, [user_id, category_id, name, photo], (err, result) => {
        if (err) {
            console.error('Błąd dodawania przepisu:', err);
            return res.status(500).json({ error: 'Błąd dodawania przepisu', details: err.message });
        }

        const recipeId = result.insertId;

        const stepsArray = Array.isArray(steps) ? steps : (typeof steps === 'string' ? JSON.parse(steps) : [steps]);
        const stepsData = stepsArray.map((step, index) => `(${recipeId}, '${step}', ${index + 1})`);
        const insertStepsQuery = 'INSERT INTO recipe_steps(recipe_id, step_text, step_order) VALUES ';
        const stepsQuery = stepsData.join(', ');
        db.query(`${insertStepsQuery}${stepsQuery}`, (err, result) => {
            if (err) {
                console.error('Błąd dodawania kroków przepisu:', err);
                return res.status(500).json({ error: 'Błąd dodawania kroków przepisu', details: err.message });
            }

            const productsArray = Array.isArray(products) ? products : (typeof products === 'string' ? JSON.parse(products) : [products]);
            const productsData = productsArray.map(product => [recipeId, product.id, product.amount]);

            const insertProductsQuery = 'INSERT INTO recipe_products(recipe_id, product_id, amount) VALUES ';
            const productQuestionMarks = productsData.map(() => '(?, ?, ?)').join(', ');

            db.query(`${insertProductsQuery}${productQuestionMarks}`, [...productsData.flat()], (err, result) => {
                if (err) {
                    console.error('Błąd dodawania produktów przepisu:', err);
                    return res.status(500).json({ error: 'Błąd dodawania produktów przepisu', details: err.message });
                }

                res.status(200).json({ success: true });
            });
        });
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

app.get('/api/recipes', (req, res) => {
    const query = 'SELECT * FROM recipes';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd pobierania przepisów z bazy danych:', err);
            return res.status(500).json({ error: "Błąd pobierania przepisów z bazy danych" });
        }

        const recipes = results.map((recipe) => {
            return {
                id: recipe.id,
                name: recipe.name,
                image: recipe.image,
            };
        });

        res.json({ recipes });
    })
})

app.get('/api/getRecipeProducts', (req, res) => {
    const { recipe_id } = req.query;
    const query = `
        SELECT products.id, products.name, products.unit, recipe_products.amount 
        FROM recipe_products 
        INNER JOIN products ON recipe_products.product_id = products.id 
        WHERE recipe_id = ?`;

    db.query(query, [recipe_id], (err, results) => {
        if (err) {
            console.error('Błąd pobierania produktów tego przepisu:', err);
            return res.status(500).json({ error: "Błąd pobierania produktów tego przepisu" });
        }
        return res.json({ results });
    });
});

app.get('/api/getRecipeSteps', (req, res) => {
    const { recipe_id } = req.query;
    const query = `
    SELECT recipe_steps.id, recipe_steps.step_text, recipe_steps.step_order
    FROM recipe_steps
    INNER JOIN recipes ON recipe_steps.recipe_id = recipes.id
    WHERE recipe_steps.recipe_id = ?`;

    db.query(query, recipe_id, (err, results) => {
        if (err) {
            console.error('Błąd pobierania kroków wykonania tego przepisu:', err);
            return res.status(500).json({ error: "Błąd pobierania produktów tego przepisu" });
        }
        return res.json({ results });
    });
});

app.get('/api/getRecipeWithCategory', (req, res) => {
    const { cat_id } = req.query;
    const query = `SELECT * FROM recipes WHERE category_id = ?`;

    db.query(query, [cat_id], (err, results) => {
        if (err) {
            console.error('Błąd pobierania przepisów z tej kategorii:', err);
            return res.status(500).json({ error: "Błąd pobierania przepisów z tej kategorii" });
        }
        return res.json({ results });
    });
});

app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
  
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd pobierania produktów z bazy danych:', err);
            res.status(500).json({ error: 'Błąd pobierania produktów z bazy danych' });
        } else {
            const products = results.map((product) => {
                return {
                    id: product.id,
                    name: product.name,
                    unit: product.unit,
                };
            });
    
            res.json({ products });
        }
    });
});

app.post('/api/userProducts', (req, res) => {
    const { username } = req.body;

    const query = `
        SELECT products.name, fridge.amount, products.unit
        FROM fridge
        INNER JOIN user ON fridge.user_id = user.id
        INNER JOIN products ON fridge.product_id = products.id
        WHERE user.username = ?`;

    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Błąd pobierania produktów użytkownika: ', err);
            res.status(500).json({ error: 'Błąd pobierania produktów użytkownika' });
        } else {
            const userProducts = result.map(product => ({
                name: product.name,
                amount: product.amount,
                unit: product.unit
            }));

            res.status(200).json({ userProducts });
        }
    });
});

app.post('/api/addUserProduct', (req, res) => {
    const { user_id, product_id, amount } = req.body;

    const checkQuery = 'SELECT * FROM fridge WHERE user_id = ? AND product_id = ?';

    db.query(checkQuery, [user_id, product_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Błąd sprawdzania produktu: ', checkErr);
            res.status(500).json({ error: 'Błąd sprawdzania produktu' });
        } else {
            if (checkResult.length > 0) {
                const updateQuery = 'UPDATE fridge SET amount = amount + ? WHERE user_id = ? AND product_id = ?';

                db.query(updateQuery, [amount, user_id, product_id], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Błąd aktualizacji ilości produktu: ', updateErr);
                        res.status(500).json({ error: 'Błąd aktualizacji ilości produktu' });
                    } else {
                        res.status(200).json({ success: true });
                    }
                });
            } else {
                const insertQuery = 'INSERT INTO fridge(user_id, product_id, amount) VALUES (?, ?, ?)';

                db.query(insertQuery, [user_id, product_id, amount], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Błąd dodawania produktu: ', insertErr);
                        res.status(500).json({ error: 'Błąd dodawania produktu' });
                    } else {
                        res.status(200).json({ success: true });
                    }
                });
            }
        }
    });
});

app.post('/api/removeUserProduct', (req, res) => {
    const { user_id, product_id, amount } = req.body;

    const checkQuery = 'SELECT * FROM fridge WHERE user_id = ? AND product_id = ?';

    db.query(checkQuery, [user_id.userId, product_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Błąd sprawdzania produktu: ', checkErr);
            res.status(500).json({ error: 'Błąd sprawdzania produktu' });
        } else {
            const currentAmount = checkResult[0].amount;

            if (currentAmount - amount < 0) {
                return res.status(400).json({ error: 'Ilość do usunięcia przekracza dostępną ilość produktu' });
            }

            const updateQuery = 'UPDATE fridge SET amount = amount - ? WHERE user_id = ? AND product_id = ?';

            db.query(updateQuery, [amount, user_id.userId, product_id], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Błąd aktualizacji ilości produktu: ', updateErr);
                    res.status(500).json({ error: 'Błąd aktualizacji ilości produktu' });
                } else {
                    res.status(200).json({ success: true });
                }
            });
        }
    });
});

app.post('/api/checkUserProducts', async (req, res) => {
    const { user_id, products } = req.body;

    const checkQuery = 'SELECT product_id, amount FROM fridge WHERE user_id = ?';

    try {
        const checkResults = await queryAsync(checkQuery, [user_id.userId]);
        console.log(products);

        const userProductsMap = {};
        checkResults.forEach(row => {
            userProductsMap[row.product_id] = row.amount;
        });

        console.log(userProductsMap);

        const missingProducts = [];
        products.forEach(({ product_id, requiredAmount }) => {
            const availableAmount = userProductsMap[product_id] || 0;
            console.log(availableAmount);
            if (availableAmount < requiredAmount) {
                missingProducts.push({
                    product_id,
                    requiredAmount,
                    availableAmount,
                });
            }
        });

        if (missingProducts.length > 0) {
            res.status(400).json({ error: 'Brak wystarczającej ilości niektórych produktów', missingProducts });
        } else {
            // Zmniejsz ilość produktów w tabeli fridge
            for (const { product_id, requiredAmount } of products) {
                const updateQuery = 'UPDATE fridge SET amount = amount - ? WHERE user_id = ? AND product_id = ?';
                await queryAsync(updateQuery, [requiredAmount, user_id.userId, product_id]);
            }

            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.error('Błąd podczas przetwarzania: ', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Serwer nasłuchuje na porcie ${PORT}`);
});