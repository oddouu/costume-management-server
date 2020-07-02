const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/project-model');


// GET route => to get all the projects
router.get('/projects', (req, res) => {

  if (req.isAuthenticated()) {

    Project.find()
      .then(allProjects => {
        const filter = allProjects.filter(eachProject => eachProject.users.includes(req.user._id));
        res.json(filter);
      })
      .catch(err => {
        res.json(err);
      });


  } else {
    res.status(403).json({
      message: 'Access forbidden.'
    });
  }
});

// POST route => to create new projects
router.post('/projects', (req, res) => {

  if (req.isAuthenticated()) {
    const {
      title,
      movieDirectorName,
      scriptWriter,
      date,
      productionName,
      numberOfScenes,
      numberOfCharacters
    } = req.body;

    Project.create({
      title,
      movieDirectorName,
      scriptWriter,
      date,
      productionName,
      numberOfScenes,
      numberOfCharacters,
      users: [req.user._id]
    }).then(response => {
      res.json(response);
    }).catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: 'Access forbidden.'
    });
  }


});

// GET route => to get one single project by id
router.get('/projects/:id', (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: 'id is not valid'
    });
    return;
  }

  if (req.isAuthenticated()) {

    Project.findById(req.params.id)
      .then(project => {
        if (project.users.includes(req.user._id)) {
          res.json(project);
        } else {
          res.status(403).json({
            message: 'Access forbidden.'
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: 'Access forbidden.'
    });
  }

});

// PUT route => to update a specific project
router.put('/projects/:id', (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: 'id is not valid'
    });
    return;
  }

  if (req.isAuthenticated()) {
    Project.findById(req.params.id)
      .then(project => {
        if (project.users.includes(req.user._id)) {
          Project.findByIdAndUpdate(req.params.id, req.body)
            .then((response) => {
              res.json({
                message: `Project with ID ${req.params.id} was updated successfully. - ${response}`
              });
            })
            .catch(err => res.json(err));
        } else {
          res.status(403).json({
            message: 'Access forbidden.'
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: 'Access forbidden.'
    });
  }
});

// DELETE route => to delete a specific project
router.delete('/projects/:id', (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: 'id is not valid'
    });
    return;
  }

  if (req.isAuthenticated()) {

    Project.findById(req.params.id)
      .then(project => {
        if (project.users.includes(req.user._id)) {
          Project.findByIdAndDelete(req.params.id)
            .then(response => res.status(200).json({response, message: 'project deleted successfully'}))
            .catch(err => res.status(500).json(err));
        } else {
          res.status(403).json({
            message: 'Access forbidden.'
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: 'Access forbidden.'
    });
  }
});


module.exports = router;