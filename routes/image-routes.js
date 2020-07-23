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
        .then(imagesFromDB => {
          imagesFromDB.filter(eachImage => eachImage.project === res.params.projId);
          res.status(200).json(imagesFromDB)
        })
        .catch(err => next(err));
    })
    .catch(err => res.json(err));
});


router.get('/projects/:projId/images/:imgId', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.imgId)) {
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

      Image.findById(req.params.imgId)
        .then(imageIFound => {
          if (imageIFound.project === req.params.projId) {
            res.status(200).json(imageIFound);
          } else {
            res.status(403).json({
              message: "Access forbidden.",
            });
            return;
          }


        })
        .catch(err => next(err));
    })
    .catch(err => res.json(err));
});

router.delete('/projects/:projId/images/:imgId', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projId) || !mongoose.Types.ObjectId.isValid(req.params.imgId)) {
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
    
    Image.findById(req.params.imgId)
    .then(imageIFound => {
      if (imageIFound.project == req.params.projId) {
        
        Image.findByIdAndDelete(req.params.imgId)
        .then(deletedImage => {
          res.status(200).json(deletedImage);
        });
      } else {
        // console.log("I'M HERE")
        //     console.log("I'm HERE", imageIFound.project, "----", req.params.projId)
            res.status(403).json({
              message: "Access forbidden.",
            });
            return;
          }


        })
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

      console.log("BODY", req.body)
      Image.create({
          imageUrl: req.body.imageUrl,
          project: req.params.projId
        })
        .then(newImage => {
          res.status(200).json(newImage);
        })
        .catch(err => next(err));
    })
    .catch(err => res.json(err));
});



router.post('/projects/:projId/upload', uploadCloud.single("imageUrl"), (req, res, next) => {
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