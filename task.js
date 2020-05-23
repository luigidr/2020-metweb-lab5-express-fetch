class Task{    

  constructor(id, description, important=false, privateTask=true, deadline, project, completed=false) {
    if(id)
      this.id = id;

    this.description = description;
    this.important = important;
    this.privateTask = privateTask;

    if(deadline)
      this.deadline = deadline;
    if(project)
      this.project = project;

    this.completed = completed;
  }
}

module.exports = Task;


