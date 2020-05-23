'use strict';

const Task = require('./task');
const db = require('./db');
const moment = require('moment');

/**
 * Function to create a new Task object from a row of the tasks table
 * @param {*} row a row of the tasks table
 */
const createTask = function (dbTask) {
    const importantTask = (dbTask.important === 1) ? true : false;
    const privateTask = (dbTask['private'] === 1) ? true : false; 
    const completedTask = (dbTask.completed === 1) ? true : false;
    return new Task(dbTask.id, dbTask.description, importantTask, privateTask, moment.utc(dbTask.deadline), dbTask.project, completedTask);
}

/**
* Function to check if a date is today. Returns true if the date is today, false otherwise.
* @param {*} date a Moment js date to be checked
*/
const isToday = function(date) {
    return date.isSame(moment(), 'day');
}

/**
* Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
* @param {*} date a Moment js Date to be checked
*/
const isNextWeek = function(date) {
    const nextWeek = moment().add(1, 'weeks');
    const tomorrow = moment().add(1, 'days');
    return date.isAfter(tomorrow) && date.isBefore(nextWeek);
}

/**
 * Get tasks and optionally filter them
 */
exports.getTasks = function(filter) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => createTask(row));
                if(filter){
                    switch(filter){
                        case 'important':
                            tasks = tasks.filter((el) => {
                                return el.important;
                            });
                            break;
                        case 'private':
                            tasks = tasks.filter((el) => {
                                return el.privateTask;
                            });
                            break;
                        case 'shared':
                            tasks = tasks.filter((el) => {
                                return !el.privateTask;
                            });
                            break;
                        case 'today':
                            tasks = tasks.filter((el) => {
                                if(el.deadline)
                                    return isToday(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        case 'week':
                            tasks = tasks.filter((el) => {
                                if(el.deadline)
                                    return isNextWeek(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        default:
                            //the specified filter is not valid
                            tasks = []
                    }
                }
                resolve(tasks);
            }
        });
    });
}

/**
 * Get a task with given id
 */
exports.getTask = function(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)
                resolve({error: 'Course not found.'});
            else {
                const task = createTask(row);
                resolve(task);
            }
        });
    });
}

/**
 * Insert a task in the database and returns the id of the inserted task. 
 * To get the id, this.lastID is used.
 * To use the 'this', db.run uses 'function (err)' instead of an arrow function.
 */
exports.addTask = function(task) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed) VALUES(?,?,?,?,DATETIME(?),?)';
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed], function (err) {
            if(err){
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

/**
 * Update an existing task with a given id. newTask contains all the new values of the task (e.g., to mark it as 'completed')
 */
exports.updateTask = function(id, newTask) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE tasks SET description = ?, important = ?, private = ?, project = ?, deadline = DATETIME(?), completed = ? WHERE id = ?';
        db.run(sql, [newTask.description, newTask.important, newTask.privateTask, newTask.project, newTask.deadline, newTask.completed, id], function (err) {
            if(err){
                reject(err);
            } else if (this.changes === 0)
                resolve({error: 'Course not found.'});
            else {
                resolve();
        }
        })
    });
}

/**
 * Delete a task with a given id
 */
exports.deleteTask = function(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        db.run(sql, [id], function(err) {
            if(err)
                reject(err);
            else if (this.changes === 0)
                resolve({error: 'Course not found.'});
            else {
                resolve();
            }
        });
    });
}
