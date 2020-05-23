class TaskManager {
    constructor(){
        this.tasks = [];
    }

    /**
     * Get all the tasks
     */
    async getAllTasks() {
        let response = await fetch('/tasks');
        const tasksJson = await response.json();
        if (response.ok) {
            this.tasks = tasksJson.map((ex) => Task.from(ex));
            return this.tasks;
        } else {
            throw tasksJson;
        }
    }

    /**
     * Get important tasks
     */
    get important() {
        return this.tasks.filter((el) => {
            return el.important;
        });
    }

    /**
     * Get the tasks of today
     */
    get today() {
        return this.tasks.filter((el) => {
            if(el.deadline)
                return this.isToday(el.deadline);
            else
                return false;
        });
    }

    /**
     * Get the tasks of the next week
     */
    get nextWeek() {
        return this.tasks.filter((el) => {
            if(el.deadline)
                return this.isNextWeek(el.deadline);
            else
                return false;
        });
    }

    /**
     * Get the private taks
     */
    get private() {
        return this.tasks.filter((el) => {
            return el.privateTask;
        });
    }

    /**
     * Get the shared tasks
     */
    get shared() {
        return this.tasks.filter((el) => {
            return !el.privateTask;
        });
    }

    /**
     * Get all the projects
     */
    get projects() {
        const projects = [];
        for(const task of this.tasks){
            if(task.project && !projects.includes(task.project))
                projects.push(task.project);
        }

        return projects;
        //Alternative
        //return [...new Set(this.tasks.map(task => task.project))];
    }

    /**
     * Get all the tasks of a given project
     * 
     * @param {*} project the given project
     */
    getByProject(project) {
        return this.tasks.filter((el) => {
            return el.project === project;
        });
    }

    /**
     * Add a task
     * 
     * @param {*} task the Task to be added
     */
    async addTask(task) {
        let response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task), // stringify removes undefined fields
        });
        if(response.ok) {
            return;
        }
        else {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                if(Array.isArray(err)) {
                    let errors = '';
                    err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                    throw `Error: ${errors}`;
                }
                else
                    throw 'Error: cannot parse server response';
            }
        }
    }

    /**
     * Update a task, even partially
     * 
     * @param {*} task the Task to be added
     */
    async updateTask(task) {
        let response = await fetch(`/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        if(response.ok) {
            return;
        }
        else {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                if(Array.isArray(err)) {
                    let errors = '';
                    err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                    throw `Error: ${errors}`;
                }
                else
                    throw 'Error: cannot parse server response';
            }
        }
    }

    /**
     * Delete a task
     * 
     * @param {*} id the id of the task to be deleted
     */
    async deleteTask(taskId) {
        let response = await fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if(response.ok) {
            return;
        }
        else {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                if(Array.isArray(err)) {
                    let errors = '';
                    err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                    throw `Error: ${errors}`;
                }
                else
                    throw 'Error: cannot parse server response';
            }
        }
    }

    /**
     * Function to check if a date is today. Returns true if the date is today, false otherwise.
     * @param {*} date a Moment js date to be checked
     */
    isToday(date) {
        return date.isSame(moment(), 'day');
    }

    /**
     * Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
     * @param {*} date a Moment js Date to be checked
     */
    isNextWeek(date) {
        const nextWeek = moment().add(1, 'weeks');
        const tomorrow = moment().add(1, 'days');
        return date.isAfter(tomorrow) && date.isBefore(nextWeek);
    }
}