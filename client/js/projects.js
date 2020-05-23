class Project {
    constructor(projectContainer, taskManager) {
        // needed references
        this.projectContainer = projectContainer;
        this.taskManager = taskManager;

        // 'this' should point to this class, not to the target element
        this.onProjectSelected = this.onProjectSelected.bind(this);
    }

     /**
     * Create the list of projects in the sidebar
     */
    createAllProjects() {
        // empty the list of projects
        this.projectContainer.innerHTML = '';

        // create all the projects
        for(const project of this.taskManager.projects){
            const projectNode = this.createProjectNode(project);
            this.projectContainer.appendChild(projectNode);
        }
    }

    /**
     * Create a single project
     * @param {*} project the name of the project to be created
     */
    createProjectNode(project){
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        a.innerText = project;
        a.dataset.id = project;
        a.href = '#';
        a.title = project;
        a.addEventListener('click', this.onProjectSelected);
        return a;
    }

    /**
     * The 'click' event handler
     * @param {*} event the selected project
     */
    onProjectSelected(event) {
        // the HTML element that was clicked
        const el = event.target;
        // the data-id of the selected project
        const projectName = el.dataset.id;

        // generate a new (custom) event to warn App.js of the change
        document.dispatchEvent(new CustomEvent('filter-selected', {detail: {tasks: this.taskManager.getByProject(projectName), title: projectName + ' - Tutti'}}));
    }
}
