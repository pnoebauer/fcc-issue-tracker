// 'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.set('useFindAndModify', false);

const issueSchema = new mongoose.Schema(
	{
		project_title: {type: String, required: true},
		issue_title: {type: String, required: true},
		issue_text: {type: String, required: true},
		created_by: {type: String, required: true},
		assigned_to: String,
		open: Boolean,
		status_text: String,
		// createdAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
		// updatedAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const Issue = mongoose.model('Issue', issueSchema);

module.exports = async function (app) {
	app
		.route('/api/issues/:project')

		.get(async function (req, res) {
			let project = req.params.project;

			// return everything except the __v field
			const issues = await Issue.find({}).select('-__v').exec();

			console.log(issues);
			// const issues = await Issue.find({project_title: project}).select('-__v').exec();
		})

		.post(async function (req, res) {
			const project = req.params.project;

			console.log(req.body, req.params);
			let issueObject = {project_title: project};

			Object.keys(req.body).forEach(
				key => req.body[key].length && (issueObject[key] = req.body[key])
			);

			try {
				const addedIssue = await new Issue(issueObject).save();

				const {
					issue_title,
					issue_text,
					created_by,
					assigned_to,
					status_text,
					created_at,
					updated_at,
				} = addedIssue;
				// console.log(addedIssue);

				if (addedIssue) {
					// return res.json(addedIssue);
					return res.json({
						issue_title,
						issue_text,
						created_by,
						assigned_to,
						status_text,
						created_at: created_at.toDateString(),
						updated_at: updated_at.toDateString(),
					});
				} else {
					return res.json({error: 'error adding the issue to the db'});
				}
			} catch (e) {
				return res.json({error: 'error adding issue, check the form input data types'});
			}
		})

		.put(async function (req, res) {
			// 6125b0700a16f60f605ffd82
			const project = req.params.project;

			const {_id, ...updatedData} = req.body;

			let updatedIssueObject = {};

			Object.keys(updatedData).forEach(
				key => updatedData[key].length && (updatedIssueObject[key] = updatedData[key])
			);

			console.log(req.body);

			// const findIssue = await Issue.findById(_id).exec();
			// console.log(findIssue);

			const updatedIssue = await Issue.findOneAndUpdate({_id}, updatedIssueObject, {
				// upsert: false,
				new: true,
			}).select('-__v');
			console.log(updatedIssue, '------up');
		})

		.delete(async function (req, res) {
			const project = req.params.project;
		});
};
