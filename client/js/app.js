class App {
    constructor(taskContainer, pageTitle, sidebarContainer, projectContainer) {
        // reference to the task list container
        this.taskContainer = taskContainer;

        // reference to the page title (for filters)
        this.pageTitle = pageTitle;

        // init the task manager and get the task list
        this.taskManager = new TaskManager();
        this.taskManager.getAllTasks().then(tasks => {
            // init the filter functionality
            this.filters = new Filter(sidebarContainer, this.taskManager);

            // init the project functionality
            this.projects = new Project(projectContainer, this.taskManager);
            
            // listening for the event generated by filters
            document.addEventListener('filter-selected', this.onFilterSelected);
            
            // set up custom validation callback
            // -> if I insert a time for the deadline, then the date is required
            const timeInput = document.getElementById('form-deadline-time');
            const dateInput = document.getElementById('form-deadline-date');
            timeInput.addEventListener('input', function(){
                if(timeInput.value !== ''){
                    // check date
                    if(dateInput.value === ''){
                        dateInput.setCustomValidity('Data mancante, per favore, specificala');
                        dateInput.classList.add('invalid');
                    }
                } else {
                    dateInput.setCustomValidity('');
                    dateInput.classList.remove('invalid');
                }
            });
            dateInput.addEventListener('input', function(){
                if(dateInput.value !== '')
                    dateInput.setCustomValidity('');
            });

            // set up form callback
            document.getElementById('add-form').addEventListener('submit', this.onFormSubmitted);

            this.projects.createAllProjects();
            this.showTasks(tasks);

        });
    }

    /**
     * Custom event handler: receive and show the filtered task list
     * @param {*} event the task list and the title of the page
     */
    onFilterSelected = (event) => {
        // get tasks
        const tasks = event.detail.tasks;

        // set the page title
        this.pageTitle.innerText = event.detail.title;

        // empty the task list
        this.clearTasks();

        // show all the things!
        this.showTasks(tasks);
    }

    /**
     * Handling the form submission: edit and add
     * @param {*} event the submission event
     */
    onFormSubmitted = (event) => {
        event.preventDefault();
        const addForm = document.getElementById('add-form');

        const description = addForm.elements['form-description'].value;

        let project = addForm.elements['form-project'].value;
        if(project === '')
            project = undefined;

        const important = addForm.elements['form-important'].checked;
        const privateTask = addForm.elements['form-private'].checked;
        
        const deadlineDate = addForm.elements['form-deadline-date'].value;
        const deadlineTime = addForm.elements['form-deadline-time'].value;
        
        let deadline = undefined;
        if(deadlineDate !== '' && deadlineTime !== '')
            deadline = deadlineDate + ' ' + deadlineTime;
        else if(deadlineDate !== '')
            deadline = deadlineDate;

        if(addForm.elements['form-id'].value && addForm.elements['form-id'].value !== ""){
            //there is a task id -> update
            const id = addForm.elements['form-id'].value;
            const task = new Task(id, description, important, privateTask, deadline, project);
            this.taskManager.updateTask(task) 
                .then(() => {
                    this.taskManager.getAllTasks().then(tasks => {
                        //remove errors, if any
                        document.getElementById('error-messages').innerHTML = '';
                        //refresh the user interface
                        this.clearTasks();
                        this.showTasks(tasks);

                        this.projects.createAllProjects();
                    
                        //reset the form and close the modal
                        addForm.reset();
                        document.getElementById('close-modal').click();
                    });
                })
                .catch((error) => {
                        // add an alert message in DOM
                        document.getElementById('error-messages').innerHTML = `
                            <div class="alert alert-danger alert-dismissible fade show" role="danger">
                            <strong>Error:</strong> <span>${error}</span> 
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>`;
                    }
                );
        } else {
            //the id is empty -> add
            const task = new Task(description, important, privateTask, deadline, project);

            this.taskManager.addTask(task).then(() => {
                // get the updated tasks and refresh the user interface
                this.taskManager.getAllTasks().then(tasks => {
                    this.clearTasks();
                    this.showTasks(tasks);
                    
                    // create all the projects in the sidebar
                    this.projects.createAllProjects();

                    //reset the form and close the modal
                    addForm.reset();
                    document.getElementById('close-modal').click();
                });
            });
        }
    }

    /**
     * Create the <ul></ul> list of tasks
     * 
     * @param {*} tasks the task list to display
     */
    showTasks(tasks){
        for(const task of tasks){
            const taskNode = this.createTaskNode(task);
            this.taskContainer.appendChild(taskNode);
        }
    }

    /**
     * Function to create a single task enclosed in an <li> tag
     * @param {*} task the task object
     */
    createTaskNode(task){
        const li = document.createElement('li');
        li.id = 'task' + task.id;
        li.className = 'list-group-item';
        const innerDiv = document.createElement('div');
        innerDiv.className = 'custom-control custom-checkbox';
        const externalDiv = document.createElement('div');
        externalDiv.className = 'd-flex w-100 justify-content-between';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'custom-control-input';
        checkbox.id = 'check-t' + task.id;
        if(task.completed)
            checkbox.checked = true;
        else 
            checkbox.checked = false;

        // event listener to mark the task as completed (or not completed)
        checkbox.addEventListener('change', event => {
            console.log(task);
            if(event.target.checked)
                task.completed = true;
            else 
                task.completed = false;

            this.taskManager.updateTask(task)
            .then(() => {
                this.taskManager.getAllTasks().then(tasks => {
                    //remove errors, if any
                    document.getElementById('error-messages').innerHTML = '';
                    //refresh the user interface
                    this.clearTasks();
                    this.showTasks(tasks);

                    this.projects.createAllProjects();
                });
            })
            .catch((error) => {
                    // add an alert message in DOM
                    document.getElementById('error-messages').innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="danger">
                        <strong>Error:</strong> <span>${error}</span> 
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        </div>`;
            });

        });

        innerDiv.appendChild(checkbox);
        
        const descriptionText = document.createElement('label');
        descriptionText.className = 'description custom-control-label';
        descriptionText.htmlFor = 'check-t' + task.id;

        if(task.important) {
            const importantSpan = document.createElement('span');
            importantSpan.className = 'text-danger pr-1';
            importantSpan.innerText = '!!!';
            descriptionText.appendChild(importantSpan);
        }
        descriptionText.innerHTML += task.description;
        
        innerDiv.appendChild(descriptionText);
        
        if(task.project){
            const projectText = document.createElement('span');
            projectText.className = 'project badge badge-primary ml-4';
            projectText.innerText = task.project;
            innerDiv.appendChild(projectText);
        }
        externalDiv.appendChild(innerDiv);

        if(task.deadline){
            const dateText = document.createElement('small');
            dateText.className = 'date';
            // print deadline - using the format function of Moment.js
            dateText.innerText = task.deadline.format('dddd, MMMM Do YYYY, h:mm:ss a'); 
            // mark expired tasks - using the isBefore function of Moment.js
            const now = moment();
            if(task.deadline.isBefore(now))
                dateText.classList.add('text-danger');
            
            externalDiv.appendChild(dateText);
        }

        const buttonsDiv = document.createElement('div');
        
        const editLink = document.createElement('a');
        editLink.href = '#';
        const imgEdit = document.createElement('img');
        imgEdit.width = 20;
        imgEdit.height = 20;
        imgEdit.classList = 'img-button mr-1';
        imgEdit.src = '../svg/edit.svg';

        // callback to edit a task
        imgEdit.addEventListener('click', () => {
            const addForm = document.getElementById('add-form');
            addForm.elements['form-id'].value = task.id;
            addForm.elements['form-description'].value = task.description;
            addForm.elements['form-project'].value = task.project;
            if(task.important)
                addForm.elements['form-important'].checked = true;
            else
                addForm.elements['form-important'].checked = false;
            if(task.privateTask)
                addForm.elements['form-private'].checked = true; 
            else
                addForm.elements['form-private'].checked = false; 

            if(task.deadline) {
                addForm.elements['form-deadline-date'].value = task.deadline.format('YYYY-MM-DD');
                addForm.elements['form-deadline-time'].value = task.deadline.format('hh:mm');
            }

            document.getElementById('add-button').click();
        });
        editLink.appendChild(imgEdit);
        buttonsDiv.appendChild(editLink);

        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        const imgDelete = document.createElement('img');
        imgDelete.width = 20;
        imgDelete.height = 20;
        imgDelete.src = '../svg/delete.svg';
        imgDelete.classList = 'img-button';

        // callback to delete a task
        imgDelete.addEventListener('click', () => {
            this.taskManager.deleteTask(task.id)
            .then(() => {
                this.taskManager.getAllTasks().then(tasks => {
                    this.clearTasks();
                    this.showTasks(tasks);
                    this.projects.createAllProjects();
                });
            })
            .catch((error) => {
                // add an alert message in DOM
                document.getElementById('error-messages').innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="danger">
                    <strong>Error:</strong> <span>${error}</span> 
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>`;
            });
        });
        deleteLink.appendChild(imgDelete);
        buttonsDiv.appendChild(deleteLink);

        externalDiv.appendChild(buttonsDiv);
        
        if(!task.privateTask){
            innerDiv.insertAdjacentHTML('afterend', `<svg class="bi bi-person-square" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg> `);
        }
            
        li.appendChild(externalDiv);
        return li;
    }

    /**
     * Function to empty the <ul></ul> list of tasks
     */
    clearTasks(){
        this.taskContainer.innerHTML = '';
    }
}