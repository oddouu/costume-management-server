const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.js');
const Image = require('../models/image-model');
const Project = require('../models/project-model')
const mongoose = require("mongoose");

router.get('/projects/:projId/images', (req, res, next) => {

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
    .then(project => {
      if (!project.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Image.find()
        .then(imagesFromDB => res.status(200).json(imagesFromDB))
        .catch(err => next(err));
    })
    .catch(err => res.json(err));
});


router.post('/projects/:projId/images/create', (req, res, next) => {

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
    .then(project => {
      if (!project.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }

      Image.create(req.body)
        .then(newImage => {
          res.status(200).json(newImage);
        })
        .catch(err => next(err));
    })
    .catch(err => res.json(err));
});



router.post('/projects/:projId/upload', uploadCloud.single("imageUrl"), (req, res, next) => {
  console.log("HERE?!")
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
    .then(project => {
      if (!project.users.includes(req.user._id)) {
        res.status(403).json({
          message: "Access forbidden.",
        });
        return;
      }
     res.json({
       imageUrl: req.file.secure_url
     });
    })
    .catch(err => res.json(err));
  });

module.exports = router;

 