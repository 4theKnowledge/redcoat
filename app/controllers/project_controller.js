require('rootpath')();
var logger = require('config/winston');

var Project = require('app/models/project');
var DocumentGroupAnnotation = require('app/models/document_group_annotation')

// The project dashboard. Renders the projects page that lists all the projects of a user.
// Doesn't actually send any projects - that's done by 'getProjects', via AJAX.
module.exports.index = function(req, res) {
  req.user.getProjects(function(err, projects) {
    if(err)
      res.send(err);
    else {
      res.render('projects', { title: "Projects" })
    }
  });  
}

// A function that returns all the projects of a user.
module.exports.getProjects = function(req, res) {
  req.user.getProjectsTableData(function(err, projects) {
    if(err) res.send(err);
    else {
      setTimeout(function() {
      res.send({projects: projects});
      }, 1);
    }
  });
}



// The tagging interface.
module.exports.tagging = function(req, res) {
  var id = req.params.id;
  Project.findOne({ _id: id }, function(err, proj) {
    if(err) {
      res.send("error");
    }
    console.log(proj)
    proj.getDocumentGroupsPerUser(function(err, docGroupsPerUser) {
      if(err) { res.send("error"); }
      res.render('tagging', { 
       projectName: proj.project_name,
       tagging: true,
       title: "Annotation Interface",
       numDocuments: proj.file_metadata['Number of documents'],
      });

    })

  });
}

// Retrieve a single document group for the tagging interface.
module.exports.getDocumentGroup = function(req, res) {
  var id = req.params.id;
  Project.findOne({ _id: id }, function(err, proj) {
    if(err) {
      res.send("error");
    }
    proj.recommendDocgroupToUser(req.user, function(err, docgroup) {
      if(err == null && docgroup == null) {
        return "tagging complete";
      }
      if(err) {
        res.send("error");
      } else {     

        logger.debug("Sending doc group id: " + docgroup._id)

        proj.getDocumentGroupsAnnotatedByUserCount(req.user, function(err, annotatedDocGroups) {
          res.send({
              documentGroupId: docgroup._id,
              documentGroup: docgroup.documents,
              entityClasses: proj.category_hierarchy,
              annotatedDocGroups: annotatedDocGroups * 10,
              pageTitle: "Annotating group: \"" + (docgroup.display_name || "UnnamedGroup") + "\""          
          });
        });
      }
      
    });
  });
}

module.exports.submitAnnotations = function(req, res) {
  var User = require('app/models/user');
  var documentGroupId = req.body.documentGroupId;
  var userId = req.user._id;
  var projectId = req.params.id;
  var labels = req.body.labels;

 




    var documentGroupAnnotation = new DocumentGroupAnnotation({
      user_id: userId,
      document_group_id: documentGroupId,
      labels: labels,
    });
    documentGroupAnnotation.save(function(err, dga) {

      if(err) {
        logger.error(err.stack);
        return res.send({error: err})
      }

      // Add the docgroup to the user's docgroups_annotated array.

      console.log(dga._id)
      User.findByIdAndUpdate(userId, { $addToSet: { 'docgroups_annotated': documentGroupId }}, function(err) {
        console.log(req.user);

          if(err) {
            logger.error(err.stack);
            res.send({error: err})
          } else {
            console.log("doneeeeewtf")
            logger.debug("Saved document group annotation " + dga._id)
            res.send({success: true});
          }      
      })



      

      

    
  })

  // TODO: Save as a documentGroupAnnotation

  
  

}

module.exports.downloadAnnotationsOfUser = function(req, res) {
  var User = require('app/models/user')
  var proj_id = req.params.id;
  var user_id = req.params.user_id;

  

  User.findById(user_id, function(err, user) {
    console.log(user)
    Project.findById(proj_id, function(err, proj) {
      //console.log(err, proj)
      if(!proj.user_id.equals(req.user._id)) {
        return res.send("error");
      }
      proj.getAnnotationsOfUserForProject(user, function(err, annotations) {
        proj.json2conll(annotations, function(err, annotations_conll) {          
          if(err) { res.send("error"); }

          res.type('.txt');
          res.setHeader('Content-type', "application/octet-stream");
          res.set({"Content-Disposition":"attachment; filename=\"annotations-" + user.username + ".txt\""});
          res.send(annotations_conll);
          //res.send(annotations);
        });        
      })
    });
  });
}


// AJAX function to retrieve details of a project (annotators, metrics).
module.exports.getProjectDetails = function(req, res) {
  var id = req.params.id;



  Project.findOne({ _id: id}, function(err, proj) {

    proj.getUserInfo(function(err, users) {
      if(err) { res.send("error") }
        res.send( {
          annotators: users
        });    
    });
   
  });
}