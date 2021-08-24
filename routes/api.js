// 'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const issueSchema = new mongoose.Schema(
	{
		// project_title: {type: String, required: true},
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
			// const issues = await Issue.find({project_title: project}).select('-__v').exec();
		})

		.post(async function (req, res) {
			let project = req.params.project;

			console.log(req.body);
			const issueData = req.body;
			try {
				const addedIssue = await new Issue(issueData).save();
				const {
					issue_title,
					issue_text,
					created_by,
					assigned_to,
					status_text,
					created_at,
					updated_at,
				} = addedIssue;
				console.log(addedIssue);

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

		.put(function (req, res) {
			let project = req.params.project;
		})

		.delete(function (req, res) {
			let project = req.params.project;
		});
};
