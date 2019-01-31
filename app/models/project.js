require('rootpath')();
var logger = require('config/winston');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DocumentGroup = require('./document_group');
var cf = require("./common/common_functions");
var User = require("./user");
var nanoid = require('nanoid');
var FrequentTokens = require('./frequent_tokens');

var moment = require('moment');

//USERS_PER_PROJECT_MAXCOUNT = cf.USERS_PER_PROJECT_MAXCOUNT;



// function validateUsersCountMax(arr) {
//   return arr.length < USERS_PER_PROJECT_MAXCOUNT;
// }



/* Schema */

var ProjectSchema = new Schema({
  _id: cf.fields.short_id,

  // The user who created the project.
  user_id: cf.fields.user_id,

  // The username of the user who created the project.
  author: cf.fields.author,

  // The name of the project.
  project_name: cf.fields.project_name,

  // A description of the project.
  project_description: cf.fields.project_description,

  // The category hierarchy of the project, stored as a string. "name\nperson\norganisation\n business" etc
  category_hierarchy: cf.fields.category_hierarchy,

  // Determines the extent to which users may modify the hierarchy
  category_hierarchy_permissions: cf.fields.category_hierarchy_permissions,

  // Whether to perform automatic tagging on commonly-tagged tokens
  automatic_tagging: cf.fields.automatic_tagging,

  // The users who are annotating the project.
  //user_ids.active: cf.fields.user_ids.active, // TODO: Change to user_emails : { active, inactive, invited, rejected }

  // Some metadata about the Project.
  file_metadata: cf.fields.file_metadata,

  // Some metadata about the categories of the Project.
  category_metadata: cf.fields.category_metadata,

  // How many times each document should be annotated.
  overlap: cf.fields.overlap,

  // Determines the extent to which users may modify the hierarchy.
  category_hierarchy_permissions: cf.fields.category_hierarchy_permissions,

  user_ids: {
    active: cf.fields.user_ids,
    inactive: cf.fields.user_ids,
    declined: cf.fields.user_ids,
  },

  // invited_user_emails: {
  //   type: [String],
  //   maxlength: USERS_PER_PROJECT_MAXCOUNT,
  //   index: true,
  //   validate: userIdsValidation,
  //   default: [] 
  // },

  // The number of completed document group annotations of the project.
  completed_annotations: {
    type: Number,
    default: 0
  },

  frequent_tokens: {
    type: Schema.Types.ObjectId,
    ref: 'FrequentTokens',
  }

}, {
  timestamps: { 
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

/* Common methods */


ProjectSchema.methods.cascadeDelete = cf.cascadeDelete;
ProjectSchema.methods.verifyAssociatedExists = cf.verifyAssociatedExists;
ProjectSchema.methods.verifyAssociatedObjectsExist = cf.verifyAssociatedObjectsExist;

/* Instance methods */

// ProjectSchema.methods.getValidLabels = function() {
//   var r = [];
//   for(var i = 0; i < this.valid_labels.length; i++) {
//     r.push(this.valid_labels[i].label);
//   }
//   return r;
// }

// ProjectSchema.methods.getValidLabelColors = function() {
//   var r = [];
//   for(var i = 0; i < this.valid_labels.length; i++) {
//     r.push(this.valid_labels[i].color);
//   }
//   return r;
// }

// ProjectSchema.methods.getValidLabelsAbbr = function() {
//   var r = [];
//   for(var i = 0; i < this.valid_labels.length; i++) {
//     r.push(this.valid_labels[i].abbreviation);
//   }
//   return r;
// }

// Get the data to appear in the Projects table.
// user_id is the user calling the getTableData method, needed to determine whether the projects belong to the user or not.
ProjectSchema.statics.getTableData = function(p, user_id) {
  var project = p;
  project["owner"] = p.user_id.equals(user_id) ? "Your projects" : "Projects you've joined";
  project["num_annotators"] = p.user_ids.active.length;
  //var pc = Math.random() * 100;
  project["project_description"] = p["project_description"] ? p["project_description"] : "(no description)";
  project["_created_at"] = p.created_at,
  project["created_at"] = moment(p.created_at).format("DD/MM/YYYY [at] h:mm a");
  project["updated_at"] = moment(p.updated_at).format("DD/MM/YYYY [at] h:mm a");
  project["hierarchy_permissions"] = {"no_modification": "Annotators may not modify the category hierarchy.",
                                      "create_edit_only": "Annotators may add new categories to the hierarchy but may not delete or rename existing categories.",
                                      "full_permission": "Annotators may add, rename, and delete categories."}[p.category_hierarchy_permissions]
  project["annotations_required"] = Math.ceil(p.file_metadata["Number of documents"] / 10) * p.overlap;

  project["completed_annotations"] = Math.ceil((p.completed_annotations || 0) / 10);

  //project["percent_complete"] = project["completed_annotations"] / (Math.ceil(project["annotations_required"]/10) * 10) * 100;
  project["percent_complete"] = project["completed_annotations"] / project["annotations_required"] * 100;
  
  // DocumentGroupAnnotation = require('./document_group_annotation');
  // DocumentGroupAnnotation.count( {project_id: p._id, user_id: user_id }, function(err, count) {
  //   console.log(err, count)

  //   project["percent_complete_yours"] = count / project["annotations_required"] * 100;
  // });

  //project["percent_complete_yours"] = p.getDocumentGroupsAnnotatedByUserCount(user_id) / project["annotations_required"] * 100;

  return project;
  
 
}


// Adds the creator of the project (or WIP Project) to its list of user_ids.active if it is not there.
ProjectSchema.methods.addCreatorToUsers = function() {
  if(!this.user_ids.active) { this.user_ids.active = []; }
  this.user_ids.active.push(this.user_id);
}

// Returns a set of the labels in the category hierarchy, without spaces or newlines.
// ProjectSchema.methods.getLabelSet = function() {
//   return new Set(this.category_hierarchy.replace(/ /g, "").split("\n"));
// }

ProjectSchema.methods.getCategoryHierarchy = function() {
  return this.category_hierarchy;
}

ProjectSchema.methods.getFrequentTokens = function(next) {
  return FrequentTokens.findOne({ _id: this.frequent_tokens }).exec(next);  
}

ProjectSchema.methods.getDocumentGroups = function(next) {
  return DocumentGroup.find({ project_id: this._id }).exec(next);  
}

ProjectSchema.methods.getNumDocumentGroups = function(next) {
  return DocumentGroup.count({ project_id: this._id }).exec(next);  
}

// Return the number of document groups annotated by the user for this project.
ProjectSchema.methods.getDocumentGroupsAnnotatedByUserCount = function(user, next) {
  DocumentGroupAnnotation = require('./document_group_annotation');
  return DocumentGroupAnnotation.count( {project_id: this._id, user_id: user._id }).exec(next);
}

// Return the number of documents annotated by the user for this project. More correct than the DocumentGroups method above.
ProjectSchema.methods.getDocumentsAnnotatedByUserCount = function(user, next) {
  var t = this;
  var DocumentGroupAnnotation = require('./document_group_annotation');
  var d = DocumentGroupAnnotation.aggregate([
    { $match: { project_id: t._id, user_id: user._id} },
    { $unwind: "$labels"},
    {
      $group: {
        _id: "$project_id",
        count: {
          $sum: 1
        }
      }
    }
  ], function(err, results) {
    if(results.length > 0)
      var count = results[0].count;
    else
      var count = 0;
    return next(err, count);
  });


}

// Retrieve a list of all annotators of the project: the active, inactive, and declined users, as well as the pending invitations.
// For the pending invitations, lookup the user account associated with them (if an account exists), otherwise fill the missing fields with empty strings.
ProjectSchema.methods.getInvitationsTableData = function(next) {


  var User = require('./user');
  var t = this;

  User.aggregate([
    { 
      $facet: {
        "active_users": [
          { $match: { _id: { $in: t.user_ids.active } } },
          { $project: {
            username: 1,
            email: 1,
            _id: 1,
            }
          },
          { $addFields: {
            status: "Active annotators"
          }}      
        ], 
        "inactive_users": [
          { $match: { _id: { $in: t.user_ids.inactive } } },
          { $project: {
            username: 1,
            email: 1,
            _id: 1,
            }
          },
          { $addFields: {
            status: "Inactive annotators"
          }}      
        ], 
        "declined_users": [
          { $match: { _id: { $in: t.user_ids.inactive } } },
          { $project: {
            username: 1,
            email: 1,
            _id: 1,
            }
          },
          { $addFields: {
            status: "Declined invitation"
            }
          }      
        ]
      }
    },
    { $project: { users: { $setUnion: ['$active_users','$inactive_users','$declined_users']}}},
    { $unwind: '$users'},
    { $replaceRoot: { newRoot: "$users" } }
  ], function(err, project_users) {
    //console.log(err, project_users); // TODO: add 'last_active'?
    var ProjectInvitation = require('./project_invitation');
    // Also obtain all pending invitations and map them to the original user accounts, if they exist, otherwise simply return the email addresses.
    ProjectInvitation.aggregate([
      { $match: { project_id: t._id } },
      {
        $lookup: {
          from: "users",
          localField: "user_email",
          foreignField: "email",
          as: "user"
        }
      },
      {
        $project: {
          _id: "$user._id",
          username: "$user.username",
          email: "$user_email",
        }
      },
      {
        $unwind: {
          path: "$username",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$_id",
          preserveNullAndEmptyArrays: true
        }
      },
      { $addFields: {
          status: "Pending invitations"
        }
      }
    ], function(err, pending_users) {
      console.log("project", project_users)
      console.log("pending", pending_users)
      var all_users = project_users.concat(pending_users)
      console.log(",,,,,,,,,,,,,,,,,,,", all_users)
      next(err, all_users); 
    });
  });
}

// Retrieve the info of users associated with this project for display in the "Annotations" tab on the Project details page.
ProjectSchema.methods.getAnnotationsTableData = function(next) {
  var User = require('./user')
  var t = this;
  User.find({
      '_id': { $in: t.user_ids.active}
  }).select('username docgroups_annotated').lean().exec(function(err, users){
      function getUserData(userData, users, next) {
        var u = users.pop()

        //userData.push(u);
        //userData['docgroups_annotated_count'] = u['docgroups_annotated'].length;

        User.findById(u._id, function(err, user) {
          t.getDocumentsAnnotatedByUserCount(user, function(err, count) {
            u['docgroups_annotated_count'] = u['docgroups_annotated'].length * 10 // TODO: Change this to not be hardcoded to 10;
            u['docgroups_annotated_this_project_count'] = count;
            u['project_owner'] = false;
            if(u['_id'].equals(t.user_id)) {
              u['project_owner'] = true;
            }
            u['download_link'] = {'project_id': t._id, 'user_id': u['_id'], 'enough_annotations': u['docgroups_annotated_this_project_count'] > 0};
            delete u['docgroups_annotated']
            userData.push(u);
            

            if(users.length == 0) {
               next(err, userData)
             } else {
              getUserData(userData, users, next);
             }
          });

        });
      }

      getUserData([], users, function(err, userData) {
        next(err, userData);
      });      
     
  });
}

// Retrieve all annotations of a user for this project. The data will be in JSON format:
// {
//   id: the id of the document group
//   documents: the documents of the document group
//   labels: the labels corresponding to the document group
//   document_group_display_name: The display name of the document group
// }
ProjectSchema.methods.getAnnotationsOfUserForProject = function(user, next) {
  DocumentGroupAnnotation = require('./document_group_annotation')
  DocumentGroup = require('./document_group')
  var t = this;

  DocumentGroupAnnotation.aggregate([
    {
      $match: {
        user_id: user._id,
        project_id: t._id
      },
    },
    {
      $lookup: {
        from: "documentgroups",
        localField: "document_group_id",
        foreignField: "_id",
        as: "document_group"
      }
    },
    {
      $project: {
        _id: 1,
        labels: 1,
        documents: "$document_group.documents",
        document_group_display_name: "$document_group.display_name"
      }
    }
    ], function(err, docs) {
      for(var i in docs) {
        docs[i]["documents"] = docs[i]["documents"][0]; // Required to ensure docs and labels match up correctly
        docs[i]["document_group_display_name"] = docs[i]["document_group_display_name"][0]; 
      }
      next(null, docs);
    } );

  //next(null, user.username);


}

// Converts a json object to conll format.
// The JSON should be in the format of 'getAnnotationsOfUserForProject' above.
ProjectSchema.methods.json2conll = function(annotations, next) {
  conll_arr = [];
  for(var i in annotations) {
    for(var j in annotations[i]["documents"]) {
      for(var k in annotations[i]["documents"][j]) {
        conll_arr.push("" + annotations[i]["documents"][j][k] + " " + annotations[i]["labels"][j][k])
      }
      if(i < annotations.length - 1) {
        conll_arr.push("");    
      }
    }    
  }
  conll_str = conll_arr.join("\n")
  next(null, conll_str)

}

// Update the number of annotations for the project.
// This seems a lot faster than querying it every single time the project page is loaded.
// This method is called whenever a DocumentGroupAnnotation is saved.
ProjectSchema.methods.updateNumAnnotations = function(next) {
  DocumentGroupAnnotation = require('./document_group_annotation');
  var t = this;

  try {
    var d = DocumentGroupAnnotation.aggregate([
    { $match: { project_id: t._id} },
    { $unwind: "$labels"},
    {
      $group: {
        _id: "$project_id",
        count: {
          $sum: 1
        }
      }
    }
    ], function(err, results) {
      if(err) next(err);
      t.completed_annotations = results[0].count;

      //console.log(results[0].count, t.completed_annotations)
      t.save(function(err, proj) {
        next(err);
      });
    });
  } catch(err) { next(err); }
}



// Retrieve the number of document groups each user must annotate for a project, based on the overlap, number of annotators, and number of document groups in the project.
ProjectSchema.methods.getDocumentGroupsPerUser = function(next) {
  // documentGroup count = total number of document groups
  // overlap: number of times each group must be annotated
  // num users: number of users annotating
  // ioa.html((1 / numAnnotators * v * 100).toFixed(2));
  var numAnnotators = this.user_ids.active.length;
  var overlap = this.overlap;
 
  this.getNumDocumentGroups(function(err, numDocGroups) {
    var docGroupsPerUser = Math.ceil((1.0 / numAnnotators * overlap) * numDocGroups);

    console.log(docGroupsPerUser, numAnnotators, overlap, numDocGroups, "<<>>")
    next(err, docGroupsPerUser);
  });
  
}

// Sorts the project's document groups in ascending order of the number of times they have been annotated.
ProjectSchema.methods.sortDocumentGroupsByTimesAnnotated = function(next) {
  return DocumentGroup.find({ project_id: this._id }).sort('times_annotated').exec(next);
}

// Returns whether a particular user is subscribed to annotate a project.
ProjectSchema.methods.projectHasUser = function(user_id) {
  return !(this.user_ids.active.indexOf(user_id) === -1);
}

// Returns an array of user objects from this project's user_ids.active.
ProjectSchema.methods.getUsers = function(next) {
  User.find( { _id: { $in : this.user_ids.active } } , function(err, users) {
    if(err) { next(new Error("There was an error attempting to run the find users query.")); return; }
    else { next(null, users); return; }
  });
}

// Recommend a document group to a user. This is based on the document groups that the user is yet to annotate.
// Only document groups that have been annotated less than N times will be recommended, where N = the "overlap" of the project.
// Results are sorted based on the documentGroup that was last recommended.
ProjectSchema.methods.recommendDocgroupToUser = function(user, next) {
  var t = this;
  // All doc groups with this project id, where the times annotated is less than overlap, that the user hasn't already annotated
  var q = { $and: [{ project_id: t._id}, { times_annotated: { $lt: t.overlap } }, { _id: { $nin: user.docgroups_annotated }} ] };


  DocumentGroup.aggregate([
    { $match: q, },
    { $sort: {
        last_recommended: 1,
        //times_annotated: 1
      }
    }
  ], function(err, docgroups) {
    console.log(err, docgroups, "<<>>")
    if(err) return next(err);
    if(docgroups.length == 0) { return next(new Error("No document groups left")) } //TODO: fix this
    var docgroup = docgroups[0];

    DocumentGroup.update( {_id: docgroup._id }, { last_recommended: Date.now() }, {}, function(err) {
      return next(err, docgroup);
    })
    
  });


  // DocumentGroup.count(q, function(err, count) {
  //   //console.log(count, "<<<<");
  //   //console.log(user.docgroups_annotated)
  //   var random = Math.random() * count; // skip over a random number of records. Much faster than using find() and then picking a random one.
  //   DocumentGroup.findOne(q).lean().skip(random).exec(function(err, docgroup) {
  //     if(err) return next(err);
  //     //if(docgroups.length == 0) {
  //     //  return next(null, null);
  //     //}
  //     if(docgroup == null) {
  //       return next(null, null);
  //     }
  //     return next(null, docgroup);
  //   });
  // });
}


/* Middleware */

// ProjectSchema.pre('validate', function(next) {
//   var t = this;
//   next();
// });

ProjectSchema.pre('save', function(next) {
  var t = this;

  // If the project is new, addCreatorToUsers.
  if (t.isNew) {
    if(t.user_ids.active && t.user_ids.active.length == 0) {
      t.addCreatorToUsers();
    }
  }

  // 1. Validate admin exists
  var User = require('./user')
  t.verifyAssociatedExists(User, t.user_id, function(err) {
    if(err) { next(err); return; }

    // 2. Validate all users in the user_ids.active array exist.
    t.verifyAssociatedObjectsExist(User, t.user_ids.active, next);
  });
});

// Cascade delete for project, so all associated document groups are deleted when a project is deleted.
ProjectSchema.pre('remove', function(next) {
  var t = this;
  var DocumentGroup = require('./document_group')
  t.cascadeDelete(DocumentGroup, {project_id: t._id}, next);
});


/* Model */

var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;