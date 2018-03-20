var cf = require('./common/common_functions');
var expect = require('chai').expect;
var Project = require('../models/project');
var User = require('../models/user');
var DocumentGroup = require('../models/document_group');
var DocumentGroupAnnotation = require('../models/document_group_annotation');
var rid = require('mongoose').Types.ObjectId;


describe('Projects', function() {


  before(function(done) {
    cf.connectToMongoose(done);
  });
  after(function(done) {
    cf.disconnectFromMongoose(done);
  });

  /* project_name */

  describe("project_name", function() {
    it('should fail validation if it does not have a project name', function(done) { 
      var proj = new Project();
      proj.validate(function(err) { expect(err.errors.project_name).to.exist; done(); });
    });
    it('should fail validation if the name is too short', function(done) { 
      var proj = new Project({ project_name: "" });
      proj.validate(function(err) { expect(err.errors.project_name).to.exist; done(); });
    });
    it('should fail validation if the name is too long', function(done) { 
      var proj = new Project({ project_name: cf.createStringOfLength(51) }); // 51 chars
      proj.validate(function(err) { expect(err.errors.project_name).to.exist; done(); });
    });
    it('should fail validation if the name is blank', function(done) { 
      var proj = new Project({ project_name: "      " });      
      proj.validate(function(err) { expect(err.errors.project_name).to.exist; done(); });
    });
    it('should pass validation (for project_name) if the name is OK', function(done) { 
      var proj = new Project({ project_name: "Cool project." });
      proj.validate(function(err) { expect(err.errors.project_name).to.not.exist; done(); });
    });
  })

  /* project_description */

  describe("project_description", function() {

    it('should fail validation if the description is too short', function(done) { 
      var proj = new Project({ project_description: "" });
      proj.validate(function(err) { expect(err.errors.project_description).to.exist; done(); });
    });
    it('should fail validation if the description is too long', function(done) { 
      var proj = new Project({ project_description: cf.createStringOfLength(510) }); // 51 chars
      proj.validate(function(err) { expect(err.errors.project_description).to.exist; done(); });
    });
    it('should fail validation if the description is blank', function(done) { 
      var proj = new Project({ project_description: "    " });
      proj.validate(function(err) { expect(err.errors.project_description).to.exist; done(); });
    });
    it('should pass validation (for project_description) if description is missing', function(done) { 
      var proj = new Project({ });
      proj.validate(function(err) { expect(err.errors.project_description).to.not.exist; done(); });
    });    
    it('should pass validation (for project_description) if the descriptin is OK', function(done) { 
      var proj = new Project({ project_description: "This is a nice description." });
      proj.validate(function(err) { expect(err.errors.project_description).to.not.exist; done(); });
    });    
  });
  /* user */

  describe("user_id", function() {

    
    after(function(done)  { cf.dropMongooseDb(done); });

    it('should fail validation if user_id is absent or blank', function(done) { 
      var proj1 = new Project( {  } );
      var proj2 = new Project( { user_id: "" });
      proj1.validate(function(err) { 
        expect(err.errors.user_id).to.exist;
        proj2.validate(function(err) { 
          expect(err.errors.user_id).to.exist;
          done();
        });
      });          
    }); 

    it('should fail to save if user_id does not exist in the Users collection', function(done) { 
      var proj = new Project( { 
        project_name: "Qwyjibo",
        user_id: rid() ,
        valid_labels: [
          { label: "fine", abbreviation: "fine", color: "#123456" }
        ]
      });

      proj.save(function(err) { 
        expect(err).to.exist;
        // Ensure the project wasn't saved. (Note: I spent 2 hours debugging this because the User model had connected to redcoat-db-dev for some reason and the connection
        // was never closed. The tests were hanging, and I couldn't figure out why...)
        Project.count({}, function(err, count) {
          expect(count).to.equal(0);
          done();
        });
      });
    }); 
  });

  describe("user_ids", function() {

    var user1 = cf.createValidUser();
    var user2 = cf.createValidUser();
    var user3 = cf.createValidUser(); 

    before(function(done) { 
      cf.registerUsers([user1, user2, user3], function(err) { }, done);
    });
    after(function(done)  { cf.dropMongooseDb(done); });

    it('should fail validation if user_ids contains the same user twice', function(done) {

      var proj1 = cf.createValidProject(1, user1._id);

      proj1.user_ids.push(user2._id);
      proj1.user_ids.push(user3._id);
      proj1.user_ids.push(user3._id);

      proj1.validate(function(err) {
        expect(err.errors.user_ids).to.exist;
        done();
      });  

    });

    it('should place the admin of the project into user_ids', function(done) {
      var proj1 = cf.createValidProject(1, user1._id);
        proj1.validate(function(err) { 
          expect(err).to.not.exist;
          proj1.save(function(err, proj) {
            expect(proj.user_ids).to.include(user1._id); 
            done();
          });
      });         
    }); 

    it('should pass validation if the project creator is already in the users array prior to validation', function(done) {

      var proj1 = cf.createValidProject(1, user1._id);

      proj1.user_ids.push(user1._id); // Same as creator, but should still validate correctly because it won't be added twice
      proj1.user_ids.push(user2._id);
      proj1.validate(function(err) {
        expect(err).to.not.exist;
        expect(proj1.user_ids.length).to.equal(2);
        //proj1.getUsers(function(users) {
        //  console.log("USERS:", users);
        //});

        done();
      });
    });
  });

  /* valid_labels */

  describe("valid_labels", function() {

    /* Label errors */
    it('should fail validation if valid_labels contains a label that is too short', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "", abbreviation: "fine", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.label']).to.exist; done(); });
    }); 
    it('should fail validation if valid_labels contains a label that is too long', function(done) { 
      var proj = new Project( { valid_labels: [ { label: cf.createStringOfLength(30), abbreviation: "fine", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.label']).to.exist; done(); });
    });  
    it('should fail validation if valid_labels contains a label that is blank', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "   ", abbreviation: "fine", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.label']).to.exist; done(); });
    });  

    /* Abbreviation errors */
    it('should fail validation if valid_labels contains an abbreviation that is too short', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", abbreviation: "", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.abbreviation']).to.exist; done(); });
    }); 
    it('should fail validation if valid_labels contains an abbreviation that is too long', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", abbreviation: cf.createStringOfLength(30), color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.abbreviation']).to.exist; done(); });
    });  
    it('should fail validation if valid_labels contains an abbreviation that is blank', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", abbreviation: "     ", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.abbreviation']).to.exist; done(); });
    }); 

    /* Color errors */
    it('should fail validation if valid_labels contains an color that is not a color', function(done) { 
      var proj1 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "#111" }] });
      var proj2 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "red" }] });
      var proj3 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "" }] });
      var proj4 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "#1234g4" }] });
      var proj5 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "" }] });
      var proj6 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: " #111" }] });
      var proj7 = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "   " }] });
      cf.validateMany([proj1, proj2, proj3, proj4, proj5, proj6, proj7], function(err) { expect(err.errors['valid_labels.0.color']).to.exist }, done);
    }); 
    it('should pass validation for color if valid_labels contains a valid color', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", abbreviation: "fine", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors['valid_labels.0.color']).to.not.exist; done(); });
    }); 
   
    /* Missing attributes */
    it('should fail validation if valid_labels contains a valid_label with no label', function(done) { 
      var proj = new Project( { valid_labels: [ { abbreviation: "xxx", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });
    it('should fail validation if valid_labels contains a valid_label with no abbreviation', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", color: "#111111" }] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });
    it('should fail validation if valid_labels contains a valid_label with no color', function(done) { 
      var proj = new Project( { valid_labels: [ { label: "fine", abbreviation: "xxx" }] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });
    it('should fail validation if it has 0 valid_labels', function(done) { 
      var proj = new Project();
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); })
    });
    it('should fail validation if it has more than 20 valid_labels', function(done) { 
      var valid_label = { label: "test", abbreviation: "fine" }
      var proj = new Project( { valid_labels: [ ] });
      for(var i = 0; i < 21; i++) {
        proj.valid_labels.push(valid_label);
      }
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });   

    /* Duplicates in valid_labels */
    it('should fail validation if valid_labels contains more than one of the same label', function(done) { 
      var proj = new Project( { valid_labels: [ 
        { label: "fine", abbreviation: "fine", color: "#111111" },
        { label: "fine", abbreviation: "ok", color: "#222222" } ] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });
    it('should fail validation if valid_labels contains more than one of the same abbreviation', function(done) { 
      var proj = new Project( { valid_labels: [ 
        { label: "fine", abbreviation: "fine", color: "#111111" },
        { label: "ok",   abbreviation: "fine", color: "#222222" } ] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });
    it('should fail validation if valid_labels contains more than one of the same color', function(done) { 
      var proj = new Project( { valid_labels: [ 
        { label: "fine", abbreviation: "fine", color: "#111111" },
        { label: "fine",   abbreviation: "fine", color: "#111111" } ] });
      proj.validate(function(err) { expect(err.errors.valid_labels).to.exist; done(); });
    });

    /* Protected terms */
    it('should fail validation if valid_labels contains the label or abbreviation \"O\"', function(done) { 
      var proj1 = new Project( { valid_labels: [ 
        { label: "O", abbreviation: "fine", color: "#111111" },
        { label: "fine", abbreviation: "ok", color: "#222222" } ] });
      var proj2 = new Project( { valid_labels: [ 
        { label: "fine", abbreviation: "fine", color: "#111111" },
        { label: "fine", abbreviation: "O", color: "#222222" } ] });
      var proj3 = new Project( { valid_labels: [ 
        { label: "fine", abbreviation: "fine", color: "#111111" },
        { label: "fine", abbreviation: "o", color: "#222222" } ] });
      proj1.validate(function(err) { 
        expect(err.errors.valid_labels).to.exist;
        proj2.validate(function(err) { 
          expect(err.errors.valid_labels).to.exist;
          proj3.validate(function(err) { 
            expect(err.errors.valid_labels).to.exist;
            done();
          });
        });
      });
    });
  });




  /* Valid object test */

  describe("Validity tests", function() {
  
    var user = cf.createValidUser();
    before(function(done) { 
      cf.registerUsers([user], function(err) { }, done);
    });
    after(function(done)  { cf.dropMongooseDb(done); });

    it('should pass validation if everything is OK', function(done) {       
      var projs = [cf.createValidProject(1, user._id), cf.createValidProject(4, user._id), cf.createValidProject(7, user._id), cf.createValidProject(18, user._id)];
      cf.validateMany(projs, function(err) { expect(err).to.not.exist; }, done);  
    });
    it('should pass saving if everything is OK', function(done) {
      var projs = [cf.createValidProject(1, user._id), cf.createValidProject(4, user._id), cf.createValidProject(7, user._id), cf.createValidProject(18, user._id)];
      cf.saveMany(projs, function(err) { expect(err).to.not.exist; }, done);  
    });
  });   

  /* Cascade deletion test */

  describe("Cascade delete", function() {

    after(function(done)  { cf.dropMongooseDb(done); });    

    it('should delete all associated document groups and document_group_annotations when deleted', function(done) {

      var user = cf.createValidUser();
      var projs = [cf.createValidProject(1, user._id), cf.createValidProject(4, user._id), cf.createValidProject(7, user._id), cf.createValidProject(18, user._id)];
      p1_id = projs[0]._id;
      var doc_groups = [cf.createValidDocumentGroup(5, projs[0]._id), cf.createValidDocumentGroup(5, projs[0]._id), cf.createValidDocumentGroup(5, projs[2]._id)];
      var doc_group_annotations = [cf.createValidDocumentGroupAnnotation(5, user._id, doc_groups[0]._id), cf.createValidDocumentGroupAnnotation(5, user._id, doc_groups[0]._id), cf.createValidDocumentGroupAnnotation(5, user._id, doc_groups[0]._id)];
     
      cf.registerUsers([user], function(err) { expect(err).to.not.exist; }, function() {
        cf.saveMany(projs, function(err) { expect(err).to.not.exist; }, function() {
          cf.saveMany(doc_groups, function(err) { expect(err).to.not.exist; }, function() {
            cf.saveMany(doc_group_annotations, function(err) { expect(err).to.not.exist; }, function() {
              Project.findById(p1_id, function(err, proj) {
                proj.remove(function(err) { 
                  Project.count({}, function(err, count) {
                    expect(count).to.equal(3);
                    DocumentGroup.find({}, function(err, doc_groups2) {
                      expect(doc_groups2.length).to.equal(1);
                      DocumentGroupAnnotation.count({}, function(err, count) {
                        expect(count).to.equal(0);
                        done();
                      });
                    });
                  });
                });
              });
            });
          }); // yay pyramid
        });
      });
    });
  });


  /* Instance method tests */

  describe("Instance methods", function() {

    // before(function(done) { cf.connectToMongoose(done); });
    after(function(done)  { cf.dropMongooseDb(done); });    

    it('should sort its document_groups in order of times_annotated', function(done) {

      var user = cf.createValidUser();
      cf.registerUsers([user], function(err) { expect(err).to.not.exist; }, function() {
        var proj1 = cf.createValidProject(6, user._id);
        var proj2 = cf.createValidProject(11, user._id);
        var proj1_id = proj1._id;
        var proj2_id = proj2._id;
        // Save the two projects
        cf.saveMany([proj1, proj2], function(err) { expect(err).to.not.exist; }, function() {
          // Create 6 document groups (3 for each project)
          var doc_groups = [cf.createValidDocumentGroup(4, proj1._id), cf.createValidDocumentGroup(6, proj1._id), cf.createValidDocumentGroup(7, proj1._id),
                            cf.createValidDocumentGroup(4, proj2._id), cf.createValidDocumentGroup(6, proj2._id), cf.createValidDocumentGroup(7, proj2._id)
          ];
          var doc_group_ids = [ doc_groups[0]._id, doc_groups[1]._id, doc_groups[2]._id, doc_groups[3]._id, doc_groups[4]._id, doc_groups[5]._id ]
          cf.saveMany(doc_groups, function(err) { expect(err).to.not.exist; }, function() {
            // Update the first four document groups to have different numbers of times_annotated
            DocumentGroup.findOneAndUpdate( { _id : doc_group_ids[0] }, { $set: { times_annotated: 6 } }).exec()
            .then(function() { return DocumentGroup.findOneAndUpdate( { _id : doc_group_ids[1] }, { $set: { times_annotated: 4 } })})
            .then(function() { return DocumentGroup.findOneAndUpdate( { _id : doc_group_ids[2] }, { $set: { times_annotated: 2 } })})
            .then(function() { return DocumentGroup.findOneAndUpdate( { _id : doc_group_ids[3] }, { $set: { times_annotated: 7 } })})
            .then(function() { return Project.findOne({ _id: proj1_id }).exec();
            })
            .then(function(proj) {
              proj.sortDocumentGroupsByTimesAnnotated(function(err, sorted_doc_groups) {
                expect(err).to.not.exist;
                expect(sorted_doc_groups[0].times_annotated).to.equal(2);
                expect(sorted_doc_groups[1].times_annotated).to.equal(4);
                expect(sorted_doc_groups[2].times_annotated).to.equal(6);
                expect(sorted_doc_groups.length).to.equal(3);
                done();
              });
            });
          });
        });
      });
    });
  });
})





