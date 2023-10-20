"use strict";

const mongoose = require("mongoose");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let projectName = req.params.project;
      //?open=true&assigned_to=Joe
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;

      const projectt = ProjectModel.aggregate([
        {
          $project: {;
          _id != undefined
          ? { $match: { "Issues._id": ObjectId(_id) } }
          : { $match: {} },
        open != undefined
          ? { $match: { "Issues.open": open } }
          : { $match: {} },
        issue_title != undefined
          ? { $match: { "Issues.issue_title": issue_title } }
          : { $match: {} },
        issue_text != undefined
          ? { $match: { "Issues.issue_text": issue_text } }
          : { $match: {} },
        created_by != undefined
          ? { $match: { "Issues.created_by": created_by } }
          : { $match: {} },
        assigned_to != undefined
          ? { $match: { "Issue.assigned_to": assigned_to } }
          : { $match: {} },
        status_text != undefined
          ? { $match: { "Issues.status_text": status_text } }
          : { $match: {} },}}    
       ])
const projectt = ProjectModel.aggregate([
  // existing pipeline

  {
    $project: {
      issueId: "$Issues._id",
      issueTitle: "$Issues.issue_title",
      issueText: "$Issues.issue_text",
      issueOpen: "$Issues.open",
      issueCreatedBy: "$Issues.created_by",
      issueAssignedTo: "$Issues.assigned_to",
      issueStatusText: "$Issues.status_text"
    }
  }
])

projectt.then((data, err) => {
  if (data) {
    console.log(data)
    let mappedData = data.map((item) => item.Issues);
    console.log(mappedData)

  } else {
    console.log(err)
    res.json({ "err": "no data to be found" })
  }
});
    })

    .post(function (req, res) {
  let project = req.params.project;
  const {
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
  } = req.body;
  if (!issue_title || !issue_text || !created_by) {
    res.json({ error: "required field(s) missing" });
    return;
  }
  const newIssue = new IssueModel({
    issue_title: issue_title || "",
    issue_text: issue_text || "",
    created_on: new Date(),
    updated_on: new Date(),
    created_by: created_by || "",
    assigned_to: assigned_to || "",
    open: true,
    status_text: status_text || "",
  });
  ProjectModel.findOne({ name: project }, (err, projectdata) => {
    if (!projectdata) {
      const newProject = new ProjectModel({ name: project });
      newProject.Issues.push(newIssue);
      newProject.save((err, data) => {
        if (err || !data) {
          res.send("There was an error saving in post");
        } else {
          res.json(newIssue);
          console.log("Data saved in DB")
        }
      });
    } else {
      projectdata.Issues.push(newIssue);
      projectdata.save((err, data) => {
        if (err || !data) {
          res.send("There was an error saving in post");
        } else {
          res.json(newIssue);
          console.log("Data saved in DB")
        }
      });
    }
  });
})

  .put(function (req, res) {
    let project = req.params.project;
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open,
    } = req.body;
    if (!_id) {
      res.json({ error: "missing _id" });
      return;
    }
    if (
      !issue_title &&
      !issue_text &&
      !created_by &&
      !assigned_to &&
      !status_text &&
      !open
    ) {
      res.json({ error: "no update field(s) sent", _id: _id });
      return;
    }

    ProjectModel.findOne({ name: project }, (err, projectdata) => {
      if (err || !projectdata) {
        res.json({ error: "could not update", _id: _id });
      } else {
        const issueData = projectdata.issues.id(_id);
        if (!issueData) {
          res.json({ error: "could not update", _id: _id });
          return;
        }
        issueData.issue_title = issue_title || issueData.issue_title;
        issueData.issue_text = issue_text || issueData.issue_text;
        issueData.created_by = created_by || issueData.created_by;
        issueData.assigned_to = assigned_to || issueData.assigned_to;
        issueData.status_text = status_text || issueData.status_text;
        issueData.updated_on = new Date();
        issueData.open = open;
        projectdata.save((err, data) => {
          if (err || !data) {
            res.json({ error: "could not update", _id: _id });
          } else {
            res.json({ result: "successfully updated", _id: _id });
          }
        });
      }
    });
  })

  .delete(function (req, res) {
    let project = req.params.project;
    const { _id } = req.body;
    if (!_id) {
      res.json({ error: "missing _id" });
      return;
    }
    ProjectModel.findOne({ name: project }, (err, projectdata) => {
      if (!projectdata || err) {
        res.send({ error: "could not delete", _id: _id });
      } else {
        const issueData = projectdata.issues.id(_id);
        if (!issueData) {
          res.send({ error: "could not delete", _id: _id });
          return;
        }
        issueData.remove();

        projectdata.save((err, data) => {
          if (err || !data) {
            res.json({ error: "could not delete", _id: issueData._id });
          } else {
            res.json({ result: "successfully deleted", _id: issueData._id });
          }
        });
      }
    });
  });
};