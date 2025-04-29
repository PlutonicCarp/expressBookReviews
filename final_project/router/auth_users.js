const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // El usuario es válido si existe en el arreglo `users`
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // El usuario está autenticado si username y password coinciden
  return users.some(user => user.username === username && user.password === password);
};


const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imx1aXMxMjMiLCJpYXQiOjE3NDU5MDMyMTIsImV4cCI6MTc0NTkwNjgxMn0.n_aIaEaqaWhZ5vC-GkmgysW79S2W8CWwVP4obJJEsCM"; // Puedes cambiar esto, guárdalo seguro

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validar que se proporcionaron ambos datos
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Verificar credenciales
  if (authenticatedUser(username, password)) {
    // Crear token JWT
    const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});


// Add a book review

// Middleware para autenticar (si no tienes uno)
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, "mi_clave_secreta", (err, user) => {
      if (err) {
        return res.sendStatus(403); // Token inválido
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // No token
  }
};

// Agregar esta protección para que solo usuarios logueados puedan reseñar
regd_users.use(authenticateJWT);

// Ruta para agregar o modificar reseña
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username; // <-- del token JWT

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is missing." });
  }

  // Agregar o modificar la review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // viene del JWT si el middleware está bien implementado

    // Verifica si el libro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verifica si hay reseñas del usuario
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "No review by this user found for this book" });
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
