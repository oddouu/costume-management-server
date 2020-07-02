const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/project-model");
const Scene = require("../models/scene-model");
const Character = require("../models/character-model");

// GET route => to get all the projects
router.get("/projects", (req, res) => {
  if (req.isAuthenticated()) {
    Project.find()
      .then((allProjects) => {
        const filter = allProjects.filter(eachProject =>
          eachProject.users.includes(req.user._id)
        );
        res.json(filter);
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

// POST route => to create new projects
router.post("/projects", (req, res) => {
  if (req.isAuthenticated()) {
    const {
      title,
      movieDirectorName,
      scriptWriter,
      date,
      productionName,
      numberOfScenes,
      numberOfCharacters,
    } = req.body;

    let emptyScenesArray = [];
    let emptyCharactersArray = [];
    let createdProjectId;

    console.clear();

    Project.create({
        title,
        movieDirectorName,
        scriptWriter,
        date,
        productionName,
        numberOfScenes,
        numberOfCharacters,
        users: [req.user._id],
      })
      .then((createdProject) => {
        // stores project Id in order to use it later
        createdProjectId = createdProject._id;

        // pre-fills Scenes array depending on user input
        for (let i = 1; i <= numberOfScenes; i++) {
          emptyScenesArray.push({
            sceneNumber: i,
            project: createdProject._id,
          });
        }

        // pre-fills Character array depending on user input
        for (let i = 1; i <= numberOfCharacters; i++) {
          emptyCharactersArray.push({
            project: createdProject._id,
          });
        }

        console.log({
          message: "1. I created the project and, depending on the user input, I pre-filled the arrays for Characters and Scenes.",
          emptyCharactersArray,
          emptyScenesArray,
          createdProject,
        });

        Scene.create(emptyScenesArray)
          .then((createdScenes) => {
            const scenesIdArr = createdScenes.map((eachScene) => eachScene._id);
            console.log({
              message: "2. Depending on the Scenes array that I pre-filled in step 1, I created as many documents as needed within the Scene collection. Using the callback function of the document creation, I also created an array with newly created Scenes Ids - which will be later attached to the Project.",
              createdScenes,
              scenesIdArr,
            });
            Character.create(emptyCharactersArray)
              .then((createdCharacters) => {
                const charIdArr = createdCharacters.map(
                  (eachChar) => eachChar._id
                );
                console.log({
                  message: "3. Depending on the Character array that I pre-filled in step 1, I created as many documents as needed within the Character collection. Using the callback function of the document creation, I also created an array with newly created Character Ids - which will be later attached to the Project.",
                  createdCharacters,
                  charIdArr,
                });

                Project.findByIdAndUpdate(createdProjectId, {
                    scenes: scenesIdArr,
                    characters: charIdArr,
                  }, {
                    new: true
                  })
                  .then((updatedProject) => {
                    console.log({
                      message: "4. I went back to the Project and updated it with the ids of the newly created Scenes and Characters.",
                      updatedProject,
                    });

                    res.json(updatedProject);
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