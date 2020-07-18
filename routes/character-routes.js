const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Character = require("../models/character-model");
const Project = require("../models/project-model");
const Costume = require("../models/costume-model");
const Scene = require("../models/scene-model");

const uploadCloud = require('../config/cloudinary.js');
const Image = require('../models/image-model');

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
    imageUrl,
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
          imageUrl,
          numberOfCostumes,
          project: req.params.projId
        })
        .then((newCharacter) => {
          createdCharacter = newCharacter;
          for (let i = 1; i <= numberOfCostumes; i++) {
            emptyCostumesArray.push({
              costumeNumber: i,
              project: req.params.projId,
              character: newCharacter._id,
              numberOfScenes: 0
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


// PUT route => to attach a specific scene id to a specific character Id
router.put("/projects/:projId/characters/:charId/addScene/:sceneId", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.sceneId) || !mongoose.Types.ObjectId.isValid(req.params.charId)) {
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

      if (!foundProject.users.includes(req.user._id) || !foundProject.scenes.includes(req.params.sceneId) || !foundProject.characters.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      Character.findByIdAndUpdate(req.params.charId, {
          $push: {
            scenes: req.params.sceneId
          }
        }, {
          new: true
        })
        .then(updatedCharacter => {
          Scene.findByIdAndUpdate(req.params.sceneId, {
              $push: {
                characters: req.params.charId
              }
            }, {
              new: true
            })
            .then(updatedScene => {
              res.json({
                message: `Character with ID ${req.params.charId} was updated successfully.`,
                updatedScene,
                updatedCharacter
              });

            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});


// PUT route => to update a specific character only with specific information
router.put("/projects/:projId/characters/:charId", (req, res) => {

  const {
    characterName,
    actorName,
    age,
    imageUrl,
    numberOfCostumes
  } = req.body;

  let emptyCostumesArray = [];



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
    .then(foundProject => {

      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      const foundCharacter = foundProject.characters.find(eachCharacter => eachCharacter._id == req.params.charId);

      if (!foundCharacter.costumes.length && numberOfCostumes) {
        for (let i = 1; i <= numberOfCostumes; i++) {
          emptyCostumesArray.push({
            costumeNumber: i,
            project: req.params.projId,
            character: req.params.charId,
            numberOfScenes: 0
          });
        }

        
        Costume.create(emptyCostumesArray)
          .then(createdCostumes => {
            const costumesIdsArr = createdCostumes.map(eachCostume => eachCostume._id);
            
            Character.findByIdAndUpdate(req.params.charId, {
                costumes: costumesIdsArr,
                characterName,
                actorName,
                age,
                imageUrl,
                numberOfCostumes
              }, {
                new: true
              })
              .then((updatedCharacter) => {
                res.json(updatedCharacter);
              })
              .catch(err => res.json(err));
          })
          .catch(err => res.json(err));

      } else {

        if (numberOfCostumes) {
          res.json({message: 'this character already has costumes. Make sure to not pass any numberOfCostumes in the body of your request. If you want to create new costumes, go to POST /projects/:projId/character/:charId/costumes'});
          return;
        }

        Character.findByIdAndUpdate(req.params.charId, {
            characterName,
            actorName,
            age,
            imageUrl
          }, {
            new: true
          })
          .then(updatedCharacter => {
            res.json({
              message: `Character with ID ${req.params.charId} was updated successfully.`,
              updatedCharacter
            });
          })
          .catch(err => res.json(err));
      }
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

      Project.findByIdAndUpdate(req.params.projId, {
          $pull: {
            characters: req.params.charId
          },
          $inc: {
            numberOfCharacters: -1
          }
        })
        .then(() => {
          Character.findByIdAndDelete(req.params.charId)
            .then(deletedCharacter => {
              Costume.deleteMany({
                  _id: {
                    $in: deletedCharacter.costumes
                  }
                })
                .then(() => {
                  Scene.updateMany({
                      characters: {
                        $in: [req.params.charId]
                      }
                    }, {
                      $pull: {
                        characters: req.params.charId
                      }
                    })
                    .then(() => {
                      res.status(200).json({
                        deletedCharacter,
                        message: "character and related costumes deleted successfully",
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