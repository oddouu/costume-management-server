const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Character = require("../models/character-model");
const Project = require("../models/project-model");
const Costume = require("../models/costume-model");

// GET route => to get all the characters of a specific project, if the user is entitled to see this content.
router.get("/projects/:projId/characters", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }


  if (req.isAuthenticated()) {
    Project.findById(req.params.projId)
      .populate('characters')
      .then((foundProject) => {
        if (foundProject.users.includes(req.user._id)) {
          res.json(foundProject.characters);
        } else {
          res.status(403).json({
            message: "Access forbidden.",
          });
        }
      })
      .catch(err => {
        res.json(err);
      });
  } else {
    res.status(403).json({
      message: "Access forbidden.",
    });
  }
});

// POST route => to create new characters within a specific project, if the user is entitled to perform this operation
router.post("/projects/:projId/characters", (req, res) => {
  if (req.isAuthenticated()) {
    const {
      characterName,
      actorName,
      age,
      numberOfCostumes
    } = req.body;

    let emptyCostumesArray = [];
    let createdCharacter;

    console.clear();

    Project.findById(req.params.projId)
      .then((foundProject) => {
        if (foundProject.users.includes(req.user._id)) {
          Character.create({
              characterName,
              actorName,
              age,
              numberOfCostumes,
              project: req.params.projId
            })
            .then((newCharacter) => {
              createdCharacter = newCharacter;
              for (let i = 1; i <= numberOfCostumes; i++) {
                emptyCostumesArray.push({
                  costumeNumber: i,
                  project: req.params.projId,
                });
              }
              Costume.create(emptyCostumesArray)
                .then(createdCostumes => {
                  const costumesIdsArr = createdCostumes.map(eachCostume => eachCostume._id);
                  Character.findByIdAndUpdate(createdCharacter._id, {
                      costumes: costumesIdsArr
                    }, {
                      new: true
                    })
                    .then((updatedCharacter) => {
                      createdCharacter = updatedCharacter;
                      Project.findByIdAndUpdate(req.params.projId, {
                          $push: {
                            characters: createdCharacter._id
                          },
                          $inc: {
                            numberOfCharacters: 1
                          }
                        }, {
                          new: true
                        })
                        .then((updatedProject) => {
                          res.json({
                            createdCharacter,
                            updatedProject
                          });
                        })
                        .catch(err => res.json(err));
                    })
                    .catch(err => res.json(err));
                })
                .catch(err => res.json(err));
            })
            .catch(err => res.json(err));
        } else {
          res.status(403).json({
            message: "Access forbidden.",
          });
        }
      })
      .catch(err => {
        res.json(err);
      });
  } else {
    res.status(403).json({
      message: "Access forbidden.",
    });
  }
});

// GET route => to get one single project by id
router.get("/projects/:id", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: "id is not valid",
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
            message: "Access forbidden.",
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: "Access forbidden.",
    });
  }
});

// PUT route => to update a specific project
router.put("/projects/:id", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (req.isAuthenticated()) {
    Project.findById(req.params.id)
      .then(project => {
        if (project.users.includes(req.user._id)) {
          Project.findByIdAndUpdate(req.params.id, req.body, {
              new: true
            })
            .then(response => {
              res.json({
                message: `Project with ID ${req.params.id} was updated successfully.`,
                response
              });
            })
            .catch(err => res.json(err));
        } else {
          res.status(403).json({
            message: "Access forbidden.",
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: "Access forbidden.",
    });
  }
});

// DELETE route => to delete a specific project
router.delete("/projects/:id", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (req.isAuthenticated()) {
    Project.findById(req.params.id)
      .then(project => {
        if (project.users.includes(req.user._id)) {
          Project.findByIdAndDelete(req.params.id)
            .then(response =>
              res.status(200).json({
                response,
                message: "project deleted successfully",
              })
            )
            .catch(err => res.status(500).json(err));
        } else {
          res.status(403).json({
            message: "Access forbidden.",
          });
        }
      })
      .catch(err => res.json(err));
  } else {
    res.status(403).json({
      message: "Access forbidden.",
    });
  }
});

module.exports = router;