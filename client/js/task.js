class Task{
    
    constructor(id=undefined, description, important, privateTask, deadline, project) {
        this.id = id;
        this.description = description;
        this.important = important;
        this.privateTask = privateTask;

        if(deadline)
            this.deadline = moment.utc(deadline);
        if(project)
            this.project = project;
    }

    /**
     * Construct an Exam from a plain object
     * @param {*} json 
     * @return {Task} the newly created Task object
     */
    static from(json) {
        const t = Object.assign(new Task(), json);
        if(t.deadline)
            t.deadline = moment.utc(t.deadline);
            t.deadline.isUTC
        return t;
    }
}

