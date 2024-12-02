const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// const User = require('../models/User');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', 'views');


// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, 'your_secret_key');
//     req.user = decoded;
//     next();  
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };
// // Protect routes with authentication middleware
// app.use(verifyToken); // Ensure user is authenticated

// ... (Rest of the code)
//Database connection
mongoose.connect('mongodb+srv://aaffavour:HElJEBh284S8okpO@cluster0.6atzm.mongodb.net/taskmaster');

const db = mongoose.connection;
db.on('error', (err) => {
  console.error("Error: ", err);
})
db.once('open', async() => {
  console.log("MongoDB Connected");
});

  // Creating schemas
  // 1. User Schema:
 const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
  });


  // 2. Task Schema:
  const taskSchema = new mongoose.Schema({
      title: {
          type: String,
          required: true
      },
      description: String,
      deadline: Date,
      priority: {
          type: String,
          enum: ['low', 'medium', 'high']
      },
      user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      }
  });

  userSchema.pre('save', async function(next) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
  });

  const User = mongoose.model('User', userSchema);
  const Task = mongoose.model('Task', taskSchema);


// API Endpoints:
app.get('/register', async (req, res) => {
    // ...
    res.render('register');
});

app.get('/login', async (req, res) => {
    // ...
    res.render('login');
});

app.post('/tasks', async (req, res) => {
    // ...
    const { title, description, dueDate, priority } = req.body;
    const user = req.user;

    try {
        const task = new Task({ title, description, dueDate, priority, user });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

});

app.get('/tasks', async (req, res) => {
    // ...
    res.render('tasks');
});



// Register Route
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const user = new User({ email, username, password });
        await user.save();
        // res.status(201).json({ message: 'User registered successfully' });
        res.render('success', { message: 'User registered successfully'})
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'your_secret_key');
        // res.json({ token });
        // res.redirect('/dashboard', {user})
        res.redirect(`/dashboard?n=${username}`)

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/dashboard', async (req, res) => {

  const username = req.query.n
  const user = await User.findOne({ username });
  // ...
  res.render('dashboard', {user})
});

//
// // Apply the middleware to protected routes
// app.get('/dashboard', verifyToken, (req, res) => {
//   // Access user information from req.user
//   // res.json({ message: 'Protected route accessed' });
//   res.render('/dashboard', {user})
// });



// Get all tasks for the authenticated user
app.get('/', async (req, res) => {
  const user = req.user;
  try {
    const tasks = await Task.find({ user: user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
app.post('/', async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  const user = req.user;

  try {
    const task = new Task({ title, description, dueDate, priority, user: user._id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {   
    res.status(400).json({ error: err.message });
  }
});

// Update a task
// router.put('/:taskId', async (req, res) => {
//   const { taskId } = req.params;
//   const { title, description, dueDate, priority } = req.body;
//   const user = req.user;

//   try {
//     const task = await Task.findOneAndUpdate(
//       { _id: taskId, user: user._id },
//       { title, description, dueDate, priority },
//       { new: true }
//     );
//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete a task
// router.delete('/:taskId', async (req, res) => {
//   const { taskId } = req.params;
//   const user = req.user;

//   try {
//     const task = await Task.findOneAndDelete({ _id: taskId, user: user._id });
//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     res.json({ message: 'Task deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
