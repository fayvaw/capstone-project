const login = document.querySelectorAll('.login');
const register = document.querySelectorAll('.register');

login.forEach((btn) => {
  btn.addEventListener('click', (e)=>{
    console.log("Login Button was clicked");

    fetch('/login', {method: 'GET'})
    .then(function(response) {
      if(response.ok) {
        console.log('You can now login');
        window.location.href = '/login';
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
  });
});

register.forEach((btn) => {
  btn.addEventListener('click', (e)=>{
    console.log("Register Button was clicked");

    fetch('/register', {method: 'GET'})
    .then(function(response) {
      if(response.ok) {
        console.log('You can now register');
        window.location.href = '/register';
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
  });
});
});

const regForm = document.getElementById('registrationForm');

regForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(regForm);
    const data = Object.fromEntries(formData.entries());

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // Handle the response from the server
        if (response.ok) {
            // Redirect to login page or show success message
            alert('User successfully registered');
            window.location.href = '/login';
        } else {
            // Handle error
            console.error('Registration failed:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
              if (response.ok) {
                  const data = await response.json();
                  const token = data.token;
                  // Store the token in local storage or cookies
                  localStorage.setItem('token', token);
                  // Redirect to dashboard or protected page
                  window.location.href = '/dashboard';
              } else {
                  // Handle login failure
                  const error = await response.json();
                  console.error(error);
                  alert('Invalid credentials');
              }
          } catch (error) {
              console.error('Error logging in:', error);
              alert('An error occurred. Please try again.');
          }

          // Assuming you have a JWT token stored in local storage
          const token = localStorage.getItem('token');

          fetch('/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => response.json())
          .then(data => {
            // Update the dashboard with user data and tasks
            const usernameElement = document.getElementById('username');
            usernameElement.textContent = data.user.username;

            const taskList = document.getElementById('taskList');
            data.tasks.forEach(task => {
              const li = document.createElement('li');
              li.textContent = task.title;
              taskList.appendChild(li);
            });
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });

        });


// Dashboard navigation elements
const taskBtn = document.querySelector('#tasks');
const homeBtn = document.getElementById('home');
const logout = document.getElementById('logout');
const taskForm = document.getElementById("addTaskForm");
const taskList = document.getElementById("taskList");

taskBtn.addEventListener('click', (e) => {

  fetch('/tasks', {method: 'GET'})
  .then(function(response) {
    if(response.ok) {
      console.log('You accessed the tasks page');
      window.location.href = '/tasks';
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
});

logout.addEventListener('click')

taskForm.addEventListener('submit', async (event) => {
homeBtn.addEventListener('click', )
  event.preventDefault();
  const taskTitle = document.getElementById('taskTitle').value;
  const taskDescription = document.getElementById('taskDescription').value;  
  

  // Send a POST request to the backend to create a new task
  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: taskTitle, description: taskDescription  
  
 })
    });

    if (response.ok) {
      // Add the new task to the UI without a full page reload
      const task = await response.json();
      const li = document.createElement('li');
      li.textContent = task.title;
      li.dataset.id = task._id; // Add a data-id attribute for deletion
      li.innerHTML += `<button class="delete-task" data-id="${task._id}">Delete</button>`;
      taskList.appendChild(li);
      taskInput.value = '';
    } else {
      // Handle error
      console.error('Error creating task:', response.statusText);
      // Display error message to the user
    }
  } catch (error) {
    console.error('Error creating task:', error);
    // Display error message to the user
  }
});

taskList.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-task')) {
    const taskId = event.target.dataset.id;

    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        event.target.parentElement.remove();
      } else {
        console.error('Error deleting task:', response.statusText);
        // Display error message to the user
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Display error message to the user
    }
  }
});

// SUCCESS page
const continueBtn = document.getElementById('continue');
continueBtn.addEventListener('click', () => {
  if (window.location.href === '/login'){
    console.log('button clicked');
    window.location.href = '/dashboard';
  }else if (window.location.href === '/register') {
    console.log('button clicked');
    window.location.href = '/login';
  }
});
