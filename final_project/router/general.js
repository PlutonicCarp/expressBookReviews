const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    //Write your code here
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userExists = users.find(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists." }); // 409 Conflict
    }

    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Simular una llamada asíncrona con una función que devuelva una promesa
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };

        const data = await getBooks();
        res.status(200).send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book list" });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBN = () => {
        return new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });
    };

    try {
        const book = await getBookByISBN();
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];

    for (let key in books) {
        if (books[key].author === author) {
            booksByAuthor.push(books[key]);
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found for the given author" });
    }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksByTitle = []

  for(let key in books){
    if(books[key].title === title){
        booksByTitle.push(books[key]);
    }
  }

  if(booksByTitle.length > 0){
    return res.status(200).json(booksByTitle);
}else{
    return res.status(404).json({message: "No book found for the given title"})
}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;  // Obtener el ISBN de la URL
  const book = books[isbn];      // Buscar el libro en el objeto 'books'

  if (book) {
      return res.status(200).json(book.reviews); // Si el libro existe, responder con sus datos
  } else {
      return res.status(404).json({ message: "Book not found" }); // Si no existe, responder error
  }
  
});

module.exports.general = public_users;
