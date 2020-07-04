const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Character = require("../models/character-model");
const Project = require("../models/project-model");
const Costume = require("../models/costume-model");
const Scene = require("../models/scene-model");

// GET route => to get all the scenes of a specific project, if the user is entitled to see this content.
router.get("/projects/:projId/scenes", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }


  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  Project.findById(req.params.projId)
    .populate('scenes')
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      res.json(foundProject.scenes);
    })
    .catch(err => {
      res.json(err);
    });
});

// POST route => to create new scenes within a specific project, if the user is entitled to perform this operation
router.post("/projects/:projId/scenes", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  const {
    sceneNumber,
    storyDayNumber,
    description,
    timeOfDay,
    season
  } = req.body;

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      Scene.create({
          sceneNumber,
          storyDayNumber,
          description,
          timeOfDay,
          season,
          project: req.params.projId
        })
        .then((newScene) => {
          Project.findByIdAndUpdate(req.params.projId, {
              $push: {
                scenes: newScene._id
              },
              $inc: {
                numberOfScenes: 1
              }
            }, {
              new: true
            })
            .then((updatedProject) => {
              res.json({
                newScene,
                updatedProject
              });
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});


// GET route => to get one single scene by id
router.get("/projects/:projId/scenes/:sceneId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id) || !foundProject.scenes.includes(req.params.sceneId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Scene.findById(req.params.sceneId)
        .then((foundScene) => {
          res.json(foundScene);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));

});

// PUT route => to update a specific scene
router.put("/projects/:projId/scenes/:sceneId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  Project.findById(req.params.projId)
    .then(foundProject => {

      if (!foundProject.users.includes(req.user._id) || !foundProject.scenes.includes(req.params.sceneId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      // need to connect scenes with characters

      Scene.findByIdAndUpdate(req.params.sceneId, req.body, {
          new: true
        })
        .then(updatedScene => {
          res.json({
            message: `Scene with ID ${req.params.sceneId} was updated successfully.`,
            updatedScene
          });
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// DELETE route => to delete a specific scene
router.delete("/projects/:projId/scenes/:sceneId", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId)) {
    res.status(400).json({
      message: "id is not valid",
    });
    return;
  }

  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  Project.findById(req.params.projId)
    .then(foundProject => {

      if (!foundProject.users.includes(req.user._id) || !foundProject.scenes.includes(req.params.sceneId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Project.findByIdAndUpdate(req.params.projId, {
          $pull: {
            scenes: req.params.sceneId
          },
          $inc: {
            numberOfScenes: -1
          }
        })
        .then(() => {
          Scene.findByIdAndDelete(req.params.sceneId)
            .then(deletedScene => {
              Costume.updateMany({
                  scenes: {
                    $in: [req.params.sceneId]
                  }
                }, {
                  $pull: {
                    scenes: req.params.sceneId
                  }
                })
                .then(() => {
                  Character.updateMany({
                      scenes: {
                        $in: [req.params.sceneId]
                      }
                    }, {
                      $pull: {
                        scenes: req.params.sceneId
                      }
                    })
                    .then(() => {
                      res.status(200).json({
                        deletedScene,
                        message: "scene deleted successfully",
                      });
                    })
                    .catch(err => res.json(err));
                })
                .catch(err => res.json(err));
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

module.exports = router;