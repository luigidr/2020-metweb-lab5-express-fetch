// imports
const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao');
const Task = require('./task');

// init
const app = express(); 
const port = 3000;

// set-up logging
app.use(morgan('tiny'));

// process body content as JSON
app.use(express.json());

// set up the 'client' component as a static website
app.use(express.static('client'));
app.get('/', (req, res) => res.redirect('/index.html'));

// === REST API endpoints ===/

// GET /tasks
app.get('/tasks', (req, res) => {
    dao.getTasks(req.query.filter)
        .then((tasks) => res.json(tasks) )
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

// GET /tasks/<taskId>
app.get('/tasks/:taskId', (req, res) => {
    dao.getTask(req.params.taskId)
        .then((task) => {
            if(task.error){
                res.status(404).json(task);
            } else {
                res.json(task);
            }
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'param': 'Server', 'msg': err}],
            });
        });
});

// POST /tasks
app.post('/tasks', [
    check('description').notEmpty(),
  ], (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    const task = req.body;
    dao.addTask(task)
        .then((id) => res.status(201).header('Location', `/tasks/${id}`).end())
        .catch((err) => res.status(503).json({ error: err }));
    
});

// PUT /tasks/<taskId>
app.put('/tasks/:taskId', [
    check('description').notEmpty(),
  ], (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    const task = req.body;
    dao.updateTask(req.params.taskId, task)
        .then((result) => {
            if(result)
                res.status(404).json(result);
            else
                res.status(200).end();
        })
        .catch((err) => res.status(500).json({
            errors: [{'param': 'Server', 'msg': err}],
        }));
});

// DELETE /tasks/<taskId>
app.delete('/tasks/:taskId', (req,res) => {
    dao.deleteTask(req.params.taskId)
        .then((result) =>  {
            if(result)
                res.status(404).json(result);
            else
             res.status(204).end();
        })
        .catch((err) => res.status(500).json({
            errors: [{'param': 'Server', 'msg': err}],
        }));
});


// activate server
app.listen(port, () => console.log('Server ready'));
