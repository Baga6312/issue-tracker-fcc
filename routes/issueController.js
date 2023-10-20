const Issue = require("./models").Issue;
const Project = require("./models").Project;
const Helper = require("../utils/helpers");
const issueController = {
  viewIssues : ((req, res) => {
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

    const projectt = Project.aggregate([
      { $match: { name: projectName } },
      { $unwind: "$issues" },
      _id != undefined
        ? { $match: { "issues._id": ObjectId(_id) } }
        : { $match: {} },
      open != undefined
        ? { $match: { "issues.open": open } }
        : { $match: {} },
      issue_title != undefined
        ? { $match: { "issues.issue_title": issue_title } }
        : { $match: {} },
      issue_text != undefined
        ? { $match: { "issues.issue_text": issue_text } }
        : { $match: {} },
      created_by != undefined
        ? { $match: { "issues.created_by": created_by } }
        : { $match: {} },
      assigned_to != undefined
        ? { $match: { "issues.assigned_to": assigned_to } }
        : { $match: {} },
      status_text != undefined
        ? { $match: { "issues.status_text": status_text } }
        : { $match: {} },
    ])
    projectt.then(( data ,err   ) => {
      if (data) {
        let mappedData = data.map((item) => item.issues);
        console.log(mappedData)
        res.json(mappedData);
      } else {
        res.json({ "Error" : "no data to be found"});
        console.log("No data to be found ")
      }
    });
  }),
  createIssue: (req, res) => {
    const {
      issue_title,
      issue_text,
      created_by,
      assigned_to = "",
      status_text = ""
    } = req.body;
    const projectName = req.params.project;
    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: "required field(s) missing" });
    }
    const currentTime = new Date();
    const issueToBeAdded = new Issue({
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
      created_on: currentTime,
      updated_on: currentTime
    });
    Project.find({ projectName }, (err, docs) => {
      if (!docs.length) {
        const projectToBeCreated = new Project({
          projectName
        });
        projectToBeCreated.issues.push(issueToBeAdded);
        projectToBeCreated.save((err, data) => {
          if (err) {
            return console.error(err);
          } else {
            res.json(data);
          }
        });
      } else {
        docs[0]["issues"].push(issueToBeAdded);
        docs[0].save((err, data) => {
          if (err) {
            res.send("An error occured while creating the issue");
          } else {
            res.json(issueToBeAdded);
          }
        });
      }
    });
  },
  editIssue: (req, res) => {
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open = undefined
    } = req.body;
    const params = {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open
    };
    const filteredParams = Helper.removeUndefinedAndEmptyStringValuesFromObj(
      params
    );
    let projectName = req.params.project;
    if (!_id) {
      return res.json({ error: "missing _id" });
    } else if (Helper.checkIsEmptyObject(filteredParams)) {
      return res.json({ error: "no update field(s) sent", _id: _id });
    } else {
      Project.findOne({ projectName }, (err, docs) => {
        if (err || !docs) {
          return res.json({ error: "could not update", _id: _id });
        }
        const issueToBeUpdated = docs.issues.id(_id);
        if (!issueToBeUpdated) {
          return res.json({ error: "could not update", _id: _id });
        }
        issueToBeUpdated.issue_title =
          issue_title || issueToBeUpdated.issue_title;
        issueToBeUpdated.issue_text = issue_text || issueToBeUpdated.issue_text;
        issueToBeUpdated.created_by = created_by || issueToBeUpdated.created_by;
        issueToBeUpdated.assigned_to =
          assigned_to || issueToBeUpdated.assigned_to;
        issueToBeUpdated.status_text =
          status_text || issueToBeUpdated.status_text;
        issueToBeUpdated.open = open || issueToBeUpdated.open;
        docs.save((err, data) => {
          if (err || !data) {
            return res.json({ error: "could not update", _id: _id });
          } else {
            return res.json({ result: "successfully updated", _id: _id });
          }
        });
      });
    }
  },
  deleteIssue: async (req, res) => {
    const { _id } = req.body;
    const projectName = req.params.project;
    if (!_id) {
      return res.json({ error: "missing _id" });
    }
    Project.findOne({ projectName }, (err, docs) => {
      const projectHasSelectedIssue = docs.issues.filter(
        obj => obj["_id"].toString() === _id
      ).length;
      if (err || !projectHasSelectedIssue) {
        return res.json({ error: "could not delete", _id: _id });
      }
      const updatedListOfIssues = docs.issues.filter(
        obj => obj["_id"].toString() !== _id
      );
      docs.issues = updatedListOfIssues;
      docs.save((err, data) => {
        if (err) {
          return res.json({ error: "could not delete", _id });
        }
        res.json({ result: "successfully deleted", _id });
      });
    });
  }
};
module.exports = issueController;