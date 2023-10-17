'use strict';
const mongoose = require("mongoose") ; 
const Issuemodel = require("../models").Issue
const Projectmodel = require("../models").Project

 
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;

      const { 
        _id , 
        open , 
        issue_title , 
        issue_text , 
        created_by , 
        assgined_to , 
        status_text , 
      } = req.body ; 
      Projectmodel.aggregate([
        {$match : {name : project }} , 
        {$unwind : "$issues"} , 
        _id != undefined 
          ? { $match : {"issues._id" : ObjectId(_id) }}
          : { $match : {}} ,
        open != undefined  
          ? { $match : {"issues.open" : ObjectId(open)}} 
          : { $match : {}} , 
        issue_title  != undefined 
          ? { $match : {"issues.issue_title" :  ObjectId(issue_title)}}
          : { $match : {}} , 
        issue_text != undefined  
          ? { $match : {"issues.issue_text"  : ObjectId(issue_title )}}
          : { $match : {}} , 
        created_by != undefined 
          ? { $match : {"issues.created_by" : ObjectId(created_by)}}
          : { $match : {}} , 
        assgined_to != undefined 
          ? { $match : {"issues.assigned_to" : ObjectId(assgined_to)}}
          : { $match : {}} , 
        status_text != undefined 
          ? { $match : {"issues.status_text " : ObjectId(status_text)}} 
          : { $match : {}} , 
        ]).exec((err, data) => {
          if (!data) {
            res.json([]);
            console.log("no info to be found")
          } else {
            let mappedData = data.map((item) => item.Issues);
            res.json(mappedData);
            console.log(mappedData)
          }
        });
     })
    

    .post(async (req, res) => {

      const { issue_title , issue_text , created_by , assigned_to , status_text , } = req.body;

      if(!issue_title || !issue_text || !created_by) {
        return res.status(400).json({error: "Required fields missing"});
      }
     const newIssue = new Issuemodel ( { 
        issue_title: issue_title || "" , 
        issue_text: issue_text || "" , 
        created_on : new Date() , 
        update_on : new Date() ,
        created_by : created_by || "" , 
        assigned_to : assigned_to || "", 
        open : true , 
        status_text : status_text || "" , 
      })

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
        console.log("Data saved to database")
      } catch(err) {
        res.status(500).json({error: err.message});
        console.log("error saving to database")
      }
    });
  
    app.put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });   
  };