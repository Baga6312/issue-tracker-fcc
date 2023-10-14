'use strict';
const mongoose = require("mongoose") ; 
const Issuemodel = require("../models").Issue
const Projectmodel = require("../models").Project

 
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
    })
    
    // .post(function (req, res){
    //   let project = req.params.project;
    //   const { 
    //     issue_title , 
    //     issue_text , 
    //     created_by , 
    //     assigned_to , 
    //     status_text ,
    //   }=req.body; 

    //   if(!issue_title || !issue_text || !created_by ){ 
    //     req.json({error : "required field(s) missing"})
    //     return ; 
    //   }

    //   const newIssue = new Issuemodel ( { 
    //     issue_title: issue_title || "" , 
    //     issue_text: issue_text || "" , 
    //     created_on : new Date() , 
    //     update_on : new Date() ,
    //     created_by : created_by || "" , 
    //     assigned_to : assigned_to || "", 
    //     open : true , 
    //     status_text : status_text || "" , 
    //   })

    //  const data = Projectmodel.findOne({name : project} , (err , projectdata)=> {  
    //     if(!data) {
    //       const newProject = new Projectmodel({name : project} , ) ; 
    //       newProject.Issues.push(newIssue) ;
    //       newProject.save((err , data )=> { 
    //         if (err || !data) { 
    //           res.send("there was an error saving in post") 
    //           console.log("error saving in post")
    //         }else{ 
    //           res.json(newIssue)
    //         }
    //       })
    //     }
    //     else {
    //       projectdata.Issues.push(newIssue) ;
    //       projectdata.save((err , data ) => { 
    //         if ( err || !data) { 
    //           res.send("there was error saving in post") 
    //           console.log("error saving in post") 
    //         }else{
    //           res.json(newIssue)
    //         }
    //       })
    //     }
    //   })
    // } )
    
    .post(async (req, res) => {

      const { issue_title, issue_text, created_by } = req.body;
    
      if(!issue_title || !issue_text || !created_by) {
        return res.status(400).json({error: "Required fields missing"});
      }
    
      const newIssue = new Issuemodel({
        title: issue_title, 
        text: issue_text,
        createdBy: created_by
      });
    
      let project;
      
      try {
        project = await Projectmodel.findOne({name: req.params.project});
      } catch(err) {
        return res.status(500).json({error: err.message}); 
      }
    
      if(!project) {
        project = new Projectmodel({name: req.params.project});
      }
    
      project.Issues.push(newIssue);
    
      try {
        await project.save();
        res.status(201).json(newIssue); 
      } catch(err) {
        res.status(500).json({error: err.message});
      }
    });

























    
  
    app.put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });   
  };