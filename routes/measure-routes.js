const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Character = require("../models/character-model");
const Project = require("../models/project-model");
const actorMeasures = require("../models/measures-model");

// GET route => to get the measures of a specific character within a specific project, if the user is entitled to see this content.
router.get("/projects/:projId/characters/:charId/measures", (req, res) => {

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
    .populate(
      'characters')
    .then((foundProject) => {

      console.log("FOUND PROJECT: ", foundProject)
      const charactersIdsArr = foundProject.characters.map(eachCharacter => eachCharacter._id);

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      const foundCharacter = foundProject.characters.find(eachCharacter => eachCharacter._id == req.params.charId);
      console.log("FOUND CHARACTER: ", foundCharacter);
      const measID = foundCharacter.measures;

      actorMeasures.findById(measID)
        .then(foundMeasures => {
          res.json(foundMeasures);
        })
    })
    .catch(err => {
      res.json(err);
    });
});

// POST route => to create new measures for a specific character within a specific project, if the user is entitled to perform this operation
router.post("/projects/:projId/characters/:charId/measures", (req, res) => {

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
    heightMeasures,
    shouldersMeasures,
    chestMeasures,
    waistMeasures,
    hipsMeasures,
    armMeasures,
    legMeasures,
    unitMeasure,
    shirtSize,
    coatSize,
    trousersSize,
    shoeSize,
    suitSize,
    braSize,
  } = req.body;

  Project.findById(req.params.projId)
    .then((foundProject) => {
      if (!foundProject.users.includes(req.user._id) || !foundProject.characters.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
      actorMeasures.create({
          heightMeasures,
          shouldersMeasures,
          chestMeasures,
          waistMeasures,
          hipsMeasures,
          armMeasures,
          legMeasures,
          unitMeasure,
          shirtSize,
          coatSize,
          trousersSize,
          shoeSize,
          suitSize,
          braSize,
          character: req.params.charId,
          project: req.params.projId
        })
        .then((newMeasures) => {

          Character.findByIdAndUpdate(req.params.charId, {
              $set: {
                measures: newMeasures._id
              }
            }, {
              new: true
            })
            .then((updatedCharacter) => {

              res.json({
                newMeasures,
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

// PUT route => to update measures for a specific character
router.put("/projects/:projId/characters/:charId/measures", (req, res) => {

  const {
    heightMeasures,
    shouldersMeasures,
    chestMeasures,
    waistMeasures,
    hipsMeasures,
    armMeasures,
    legMeasures,
    unitMeasure,
    shirtSize,
    coatSize,
    trousersSize,
    shoeSize,
    suitSize,
    braSize,
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
      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      const foundMeasures = foundProject.characters.find(eachCharacter => eachCharacter._id == req.params.charId).measures;

      actorMeasures.findByIdAndUpdate(foundMeasures, {
          heightMeasures,
          shouldersMeasures,
          chestMeasures,
          waistMeasures,
          hipsMeasures,
          armMeasures,
          legMeasures,
          unitMeasure,
          shirtSize,
          coatSize,
          trousersSize,
          shoeSize,
          suitSize,
          braSize
        }, {
          new: true
        })
        .then((updatedMeasures) => {
          res.json({
            message: `Character with ID ${req.params.charId} was updated successfully`,
            updatedMeasures
          });
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));

});

// DELETE route => to delete measures for a specific character
router.delete("/projects/:projId/characters/:charId/measures", (req, res) => {
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

      if (!foundProject.users.includes(req.user._id) || !charactersIdsArr.includes(req.params.charId)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      const foundMeasures = foundProject.characters.find(eachCharacter => eachCharacter._id == req.params.charId).measures;

      actorMeasures.findByIdAndDelete(foundMeasures)
        .then((response) => {
          Character.findByIdAndUpdate(req.params.charId, {
              $set: {
                measures: null
              }
            })
            .then(() => {
              res.json(response);
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

module.exports = router;