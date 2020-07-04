const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Character = require("../models/character-model");
const Project = require("../models/project-model");
const Costume = require("../models/costume-model");
const Scene = require("../models/scene-model");

// GET route => to get all the costumes of a specific character within a specific project, if the user is entitled to see this content.
router.get("/projects/:projId/characters/:charId/costumes", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.charId)) {
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
    .populate({
      path: 'characters',
      populate: {
        path: 'costumes',
      }
    })
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      const filteredCharacter = foundProject.characters.filter(eachCharacter => eachCharacter._id == req.params.charId);
      console.log('FILTER', filteredCharacter[0].costumes);
      res.json(filteredCharacter[0].costumes);
    })
    .catch(err => {
      res.json(err);
    });
});

// POST route => to create new costumes for a specific character within a specific project, if the user is entitled to perform this operation
router.post("/projects/:projId/characters/:charId/costumes", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.charId)) {
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
    description,
    costumeNumber,
    gender,
    elements,
    imageUrl
  } = req.body;

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      Costume.create({
          description,
          costumeNumber,
          gender,
          elements,
          imageUrl,
          character: req.params.charId,
          project: req.params.projId
        })
        .then((newCostume) => {

          Character.findByIdAndUpdate(req.params.charId, {
              $push: {
                costumes: newCostume._id
              },
              $inc: {
                numberOfCostumes: 1
              }
            }, {
              new: true
            })
            .then((updatedCharacter) => {

              res.json({
                newCostume,
                updatedCharacter
              });

            })
            .catch(err => res.json(err));

        })
        .catch(err => res.json(err));
    })
    .catch(err => {
      res.json(err);
    });
});


// GET route => to get one single costume by id
router.get("/projects/:projId/characters/:charId/costumes/:costId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.charId) | !mongoose.Types.ObjectId.isValid(req.params.costId)) {
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
    .populate('characters')
    .then((foundProject) => {

      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      const doesCostumeBelongToCharacter = foundProject.characters
        .find(eachCharacter => eachCharacter._id == req.params.charId)
        .costumes
        .includes(req.params.costId);

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId) || !doesCostumeBelongToCharacter) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Costume.findById(req.params.costId)
        .then((foundCostume) => {
          res.json(foundCostume);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));

});

// PUT route => to attach a specific scene id to a specific costume Id
router.put("/projects/:projId/characters/:charId/costumes/:costId/addScene/:sceneId", (req, res) => {


  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId) || !mongoose.Types.ObjectId.isValid(req.params.charId) || !mongoose.Types.ObjectId.isValid(req.params.costId)) {
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
    .populate('characters')
    .then(foundProject => {


      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      const doesCostumeBelongToCharacter = foundProject.characters
        .find(eachCharacter => eachCharacter._id == req.params.charId)
        .costumes
        .includes(req.params.costId);

      if (!foundProject.users.includes(req.user._id) || !foundProject.scenes.includes(req.params.sceneId) || !charactersIdsArr.includes(req.params.charId) || !doesCostumeBelongToCharacter) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      Costume.findByIdAndUpdate(req.params.costId, {
          $push: {
            scenes: req.params.sceneId
          }
        }, {
          new: true
        })
        .then(updatedCostume => {
          Scene.findByIdAndUpdate(req.params.sceneId, {
              $push: {
                costumes: req.params.costId
              }
            }, {
              new: true
            })
            .then(updatedScene => {
              res.json({
                message: `Costume with ID ${req.params.costId} was updated successfully.`,
                updatedScene,
                updatedCostume
              });

            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});


// PUT route => to update a specific costume
router.put("/projects/:projId/characters/:charId/costumes/:costId", (req, res) => {

  const {
    description,
    costumeNumber,
    gender,
    elements,
    imageUrl
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.charId)) {
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
    .populate('characters')
    .then((foundProject) => {

      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      const doesCostumeBelongToCharacter = foundProject.characters
        .find(eachCharacter => eachCharacter._id == req.params.charId)
        .costumes
        .includes(req.params.costId);

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId) || !doesCostumeBelongToCharacter) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Costume.findByIdAndUpdate(req.params.costId, {
          description,
          costumeNumber,
          gender,
          elements,
          imageUrl
        }, {
          new: true
        })
        .then((updatedCostume) => {
          res.json({
            message: `Costume with ID ${req.params.costId} was updated successfully`,
            updatedCostume
          });
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));

});

// DELETE route => to delete a specific character
router.delete("/projects/:projId/characters/:charId/costumes/:costId", (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.charId)) {
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
    .populate('characters')
    .then((foundProject) => {

      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      const doesCostumeBelongToCharacter = foundProject.characters
        .find(eachCharacter => eachCharacter._id == req.params.charId)
        .costumes
        .includes(req.params.costId);

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId) || !doesCostumeBelongToCharacter) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Costume.findByIdAndDelete(req.params.costId)
        .then((deletedCostume) => {

          Character.findByIdAndUpdate(req.params.charId, {
              $pull: {
                costumes: req.params.costId
              },
              $inc: {
                numberOfCostumes: -1
              }
            })
            .then(() => {
              Scene.updateMany({
                  costumes: {
                    $in: [req.params.costId]
                  }
                }, {
                  $pull: {
                    costumes: req.params.costId
                  }
                })
                .then(() => {
                  res.json({
                    message: `Costume with ID ${req.params.costId} was deleted successfully`,
                    deletedCostume
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