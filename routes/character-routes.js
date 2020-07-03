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


  if (!req.isAuthenticated()) {
    res.status(403).json({
      message: "Access forbidden.",
    });
    return;
  }

  Project.findById(req.params.projId)
    .populate('characters')
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      res.json(foundProject.characters);
    })
    .catch(err => {
      res.json(err);
    });
});

// POST route => to create new characters within a specific project, if the user is entitled to perform this operation
router.post("/projects/:projId/characters", (req, res) => {

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
    characterName,
    actorName,
    age,
    numberOfCostumes
  } = req.body;

  let emptyCostumesArray = [];
  let createdCharacter;

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
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
              character: newCharacter._id
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
    })
    .catch(err => {
      res.json(err);
    });
});


// GET route => to get one single character by id
router.get("/projects/:projId/characters/:charId", (req, res) => {
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
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id) || !foundProject.characters.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Character.findById(req.params.charId)
        .then((foundCharacter) => {
          res.json(foundCharacter);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));

});

// PUT route => to update a specific character
router.put("/projects/:projId/characters/:charId", (req, res) => {
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
    .then(foundProject => {

      if (!foundProject.users.includes(req.user._id) || !foundProject.characters.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Character.findByIdAndUpdate(req.params.charId, req.body, {
          new: true
        })
        .then(response => {
          res.json({
            message: `Character with ID ${req.params.charId} was updated successfully.`,
            response
          });
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// DELETE route => to delete a specific character
router.delete("/projects/:projId/characters/:charId", (req, res) => {

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
    .then(foundProject => {

      if (!foundProject.users.includes(req.user._id) || !foundProject.characters.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Character.findByIdAndDelete(req.params.charId)
        .then(deletedCharacter => {

          // need to also remove the character Id from the characters array of Scene documents

          Costume.deleteMany({
              _id: {
                $in: deletedCharacter.costumes
              }
            })
            .then((deletedCostumes) => {
              res.status(200).json({
                deletedCostumes,
                deletedCharacter,
                message: "character and related costumes deleted successfully",
              });
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

module.exports = router;