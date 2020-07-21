const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Scene = require("../models/scene-model");
const Location = require("../models/location-model");
const Project = require("../models/project-model");

// PUT route => to attach one or more LOCATIONS to an existing SCENE and vice-versa
router.put("/projects/:projId/locations/:locId/addScene/", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.locId)) {
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

      if (!foundProject.users.includes(req.user._id) || !foundProject.locations.includes(req.params.locId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Scene.findByIdAndUpdate(req.params.sceneId, {
          $set: {
            location: req.params.locId
          }
        }, {
          new: true
        })
        .then(updatedScene => {

          Location.findByIdAndUpdate(req.params.locId, {
              $push: {
                scenes: req.params.sceneId
              }
            }, {
              new: true
            })
            .then(updatedLocation => {

              res.json({
                message: `Location with ID ${req.params.locId} was attached to Scene ID ${req.params.sceneId} successfully.`,
                updatedScene,
                updatedLocation
              });

            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});



// PUT route => to attach an existing LOCATION to an existing SCENE
router.put("/projects/:projId/locations/:locId/addScene/:sceneId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.locId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId)) {
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

      if (!foundProject.users.includes(req.user._id) || !foundProject.locations.includes(req.params.locId) || !foundProject.scenes.includes(req.params.sceneId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Scene.findByIdAndUpdate(req.params.sceneId, {
          $set: {
            location: req.params.locId
          }
        }, {
          new: true
        })
        .then(updatedScene => {

          Location.findByIdAndUpdate(req.params.locId, {
              $push: {
                scenes: req.params.sceneId
              }
            }, {
              new: true
            })
            .then(updatedLocation => {

              res.json({
                message: `Location with ID ${req.params.locId} was attached to Scene ID ${req.params.sceneId} successfully.`,
                updatedScene,
                updatedLocation
              });

            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// GET route => to GET all LOCATIONS of a specific project
router.get("/projects/:projId/locations", (req, res) => {

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
    .populate('locations')
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      res.json(foundProject.locations);
    })
    .catch(err => {
      res.json(err);
    });
});

// GET route => to GET a specific LOCATION by Id
router.get("/projects/:projId/locations/:locId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.locId)) {
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
      if (!foundProject.users.includes(req.user._id) || !foundProject.locations.includes(req.params.locId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Location.findById(req.params.locId)
        .then((foundLocation) => {
          res.json(foundLocation);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// POST route => to CREATE a new LOCATION
router.post("/projects/:projId/locations", (req, res) => {

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
    decor,
    locale
  } = req.body;

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      Location.create({
          decor,
          locale,
          project: req.params.projId
        })
        .then((newLocation) => {
          Project.findByIdAndUpdate(req.params.projId, {
              $push: {
                locations: newLocation._id
              }
            }, {
              new: true
            })
            .then((updatedProject) => {
              res.json({
                newLocation,
                updatedProject
              });
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// PUT route => to update a specific LOCATION by Id
router.put("/projects/:projId/locations/:locId", (req, res) => {

  const {
    decor,
    locale
  } = req.body;


  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.locId)) {
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

      if (!foundProject.users.includes(req.user._id) || !foundProject.locations.includes(req.params.locId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Location.findByIdAndUpdate(req.params.locId, {
          decor,
          locale
        }, {
          new: true
        })
        .then(updatedLocation => {
          res.json({
            message: `Scene with ID ${req.params.locId} was updated successfully.`,
            updatedLocation
          });
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});


// DELETE route => to DELETE a LOCATION by ID
router.delete("/projects/:projId/locations/:locId", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.locId)) {
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

      if (!foundProject.users.includes(req.user._id) || !foundProject.locations.includes(req.params.locId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Project.findByIdAndUpdate(req.params.projId, {
          $pull: {
            locations: req.params.locId
          }
        })
        .then(() => {
          Location.findByIdAndDelete(req.params.locId)
            .then(deletedLocation => {
              Scene.updateMany({
                  location: req.params.locId
                }, {
                  $set: {
                    location: null
                  }
                })
                .then((updatedScenes) => {

                  res.status(200).json({
                    deletedLocation,
                    updatedScenes,
                    message: "location deleted successfully",
                  });
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