"use strict";

// getting the two containers
const taskContainer = document.querySelector('#task-list');
const pageTitle = document.querySelector('#filter-title');
const sidebarContainer = document.querySelector('#left-sidebar');
const projectContainer = document.querySelector('#projects');

const app = new App(taskContainer, pageTitle, sidebarContainer, projectContainer);