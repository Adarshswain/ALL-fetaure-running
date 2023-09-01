const btn = document.querySelector("#btn");
console.log(btn);
const input = document.querySelector("#inp")
console.log(input);
const list = document.querySelector('#list')
const date = document.querySelector('#date')
const time = document.querySelector('#time')
const taskPage = document.querySelector('#taskPage');
//let transist to all the new feature


// Function to show the main page and hide the task details page
const showMainPage = () => {
    // Show the main page
    list.style.display = "block";

    // Hide the task details page
    taskPage.style.display = "none";
    
    // Refresh the page
    location.reload();//I have added this to fix the issue of updating the title as it takes time from localstrage when refresh it reload the title
    getTask();
};

// ... (previous code)

const showTaskPage = (id) => {
    // Get the task from localStorage
    let datas = JSON.parse(localStorage.getItem("datas"));
    const task = datas.find((i) => i.id === +id);
    console.log(task);
    // Hide the main page
    list.style.display = "none";

    // Display the task page
    taskPage.style.display = "block";

    // Populate the task details on the task page
    const taskTitle = document.getElementById('taskTitle');
    const taskDate = document.getElementById('taskDate');
    const taskTime = document.getElementById('taskTime');

    taskTitle.textContent = task.title;
    console.log("taskTitle element:", taskTitle);

    taskDate.textContent = task.date;
    taskTime.textContent = task.time;

    const taskPageContent = `
            <h1>${task.title}</h1>
            <p>Date: ${task.date}</p>
            <p>Time: ${task.time}</p>
            <button onclick="editData('${task.id}')">Edit</button>
            <button onclick="deleteData('${task.id}')">Delete</button>
            <button onclick="reminder('${task.id}')">Reminder</button>
            <label for="comp">Completed</label><br>
            <input type="checkbox" id="comp-${task.id}" name="comp" value="comp" ${task.completed ? 'checked' : ''} onchange="toggleTaskCompletion(${task.id}, this.checked)">
            <button onclick="repeat('${task.id}')">Repeat</button>
            <button onclick="showMainPage()">Back to Main Page</button>
        `;

    taskPage.innerHTML = taskPageContent;

};

// const sortTaskByOrder = ()=>{

// }
// ADD to the favourite
const addToFavorites = (id) => {
    let datas;

    if (localStorage.getItem("datas") === '') {
        datas = [];
    } else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }

    // Find the index of the clicked task in the datas array
    const taskIndex = datas.findIndex((i) => i.id === +id);

    if (taskIndex !== -1) {
        // Toggle the favorited property of the task
        datas[taskIndex].favorited = !datas[taskIndex].favorited;

        // Sort tasks by favorites
        datas.sort((a, b) => {
            if (b.favorited && !a.favorited) {
                return 1; // Move favorited tasks to the top
            } else if (!b.favorited && a.favorited) {
                return -1; // Keep non-favorited tasks below
            }
            return 0; // Preserve existing order for non-favorited tasks
        });

        // Update localStorage
        localStorage.setItem("datas", JSON.stringify(datas));

        // Refresh the task list
        getTask();
        showMainPage();
        
    }
};



// Repeat function
const repeat = (id) => {
    let datas;
    if (localStorage.getItem("datas") === null) {
        datas = [];
    } else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }

    const task = datas.find((i) => i.id === +id);
    if (task) {
        // Calculate the next occurrence of the task (24 hours later)
        const taskDate = new Date(task.date + ' ' + task.time);
        taskDate.setDate(taskDate.getDate() + 1);

        // Create a new task with the calculated next occurrence
        const newTask = {
            id: Date.now(),
            title: task.title,
            date: taskDate.toISOString().split('T')[0],
            time: task.time,
            completed: false,
            favorited: false // Add this line
        };
        datas.unshift(newTask);
        localStorage.setItem("datas", JSON.stringify(datas));
        getTask();
        showMainPage();
    }
};
//when task complted the task must be removed
// Function to mark a task as completed or delete it

const toggleTaskCompletion = (id, completed) => {
    let datas;
    if (localStorage.getItem("datas") === null) {
        datas = [];
    } else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }

    const taskIndex = datas.findIndex((i) => i.id === +id);
    if (taskIndex !== -1) {
        if (completed) {
            // If completed checkbox is checked, delete the task
            datas.splice(taskIndex, 1);
        }
        localStorage.setItem("datas", JSON.stringify(datas));
        getTask();
        showMainPage();
    }
};


const setReminder = (taskDate, title) => {
    const currentTime = new Date();
    const timeUntilReminder = taskDate - currentTime - 1 * 60 * 1000; // 1 minute in milliseconds


    if (timeUntilReminder > 0) {
        setTimeout(() => {
            // Show browser notification if permission is granted
            if (Notification.permission === "granted") {
                new Notification(`Reminder: ${title}`, {
                    body: "It's time for your task!",
                    icon: "notification-icon.png" // Replace with the path to your notification icon
                });
            } else if (Notification.permission !== "denied") {
                // Request notification permission if not granted or denied
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        console.log("Notification permission granted.");
                    }
                });
            }


            // Create the audio element
            const reminderAudio = document.createElement("audio");
            reminderAudio.id = "aud";
            reminderAudio.controls = true;
            reminderAudio.autoplay = true;

            // Create source element for the audio
            const audioSource = document.createElement("source");
            audioSource.src = "music.wav";
            audioSource.type = "audio/wav";

            // Append the source element to the audio element
            reminderAudio.appendChild(audioSource);

            const reminderModal = document.getElementById("reminderModal");
            const reminderTitle = document.getElementById('yourTask');
            reminderModal.style.display = "block";
            reminderTitle.textContent = title;

            // Append the audio element to the modal content
            reminderModal.querySelector(".modal-content").appendChild(reminderAudio);

            const closeModal = reminderModal.querySelector(".close");
            closeModal.onclick = () => {
                reminderModal.style.display = "none";
                // Pause and remove the audio element when modal is closed
                reminderAudio.pause();
                reminderAudio.remove();
            };
        }, timeUntilReminder);
    }
};





const reminder = (id) => {
    let datas;
    if (localStorage.getItem("datas") === null) {
        datas = [];
    } else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }

    const task = datas.find((i) => i.id === +id);
    if (task) {
        const taskDate = new Date(task.date + ' ' + task.time);
        console.log('Task Date:', taskDate);
        console.log('Current Time:', new Date());

        setReminder(id, taskDate, task.title);
    }
};







//lets edit the data
const editData = (id) => {
    //lets go the data
    let datas;
    if (localStorage.getItem("datas") === null) {
        datas = [];
    }
    else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }
    //let find the  the id and then update the data
    const taskId = datas.findIndex((i) => i.id === +id)

    if (taskId !== -1) {
        const newtitle = prompt("Update the Title");
        const newdate = prompt("Enter the Date");
        const newtime = prompt("Enter the update time");

        if (newtitle) {
            //let update the array
            datas[taskId].title = newtitle;
            datas[taskId].date = newdate;
            datas[taskId].time = newtime;

            localStorage.setItem("datas", JSON.stringify(datas));

            getTask();
            showTaskPage();
        }
    }
}
editData();

//let delete the id 

const deleteData = (id) => {
    let datas;

    if (localStorage.getItem("datas") === null) {
        datas = [];
    }
    else {
        datas = JSON.parse(localStorage.getItem("datas", datas));
    }
    datas = datas.filter(i => {
        return i.id !== +id;
    });
    localStorage.setItem("datas", JSON.stringify(datas));
    getTask();
    showMainPage();
}




//let Display the data

const getTask = () => {
    let datas;
    if (localStorage.getItem("datas") === null) {
        datas = [];

    }
    else {
        //now let get the data 
        datas = JSON.parse(localStorage.getItem("datas"));


    }
    //let show it

    const alldatas = datas.map((i) => {
        return `
            <li>
            <button onclick="showTaskPage('${i.id}')">${i.title}</button>
            <button class="favorite-btn" onclick="addToFavorites('${i.id}')">Add to Favorites</button>
            </li>
            `;
    })
    list.innerHTML = alldatas.join("");

}
getTask();



//lets getData from the input field
const getData = (e) => {
    e.preventDefault();

    if (input.value === '') {
        alert("Please enter a value");
        return;
    }

    const data = input.value;
    const selectedDate = date.value;
    const selectedTime = time.value;
    //, the T is a separator that is used to combine a date and a time in a specific format.
    // This format is known as the ISO 8601 combined date and time format.
    const taskDate = new Date(`${selectedDate}T${selectedTime}`);

    // Call the setReminder function when adding a task
    setReminder(taskDate, data);

    let datas;

    if (localStorage.getItem("datas") === '' || localStorage.getItem("datas") === null) {
        datas = [];
    } else {
        datas = JSON.parse(localStorage.getItem("datas"));
    }

    datas.unshift({
        id: Date.now(),
        title: data,
        date: selectedDate,
        time: selectedTime,
        favorited: false // Add this line
    });

    localStorage.setItem("datas", JSON.stringify(datas));
    getTask();
    // showTaskPage(id);
};

btn.addEventListener('click', getData);